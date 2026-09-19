"""
AgentFlow Pytest Compatibility Shim.
Provides a hermetic, zero-dependency implementation of essential Pytest APIs:
- @pytest.fixture (including autouse, scope, generator yields, and dependencies)
- pytest.approx (relative/absolute floating point comparison)
- pytest.raises (exception assertion context manager with match support)
- @pytest.mark (asyncio, parametrize, skip, etc.)
- pytest.fail / pytest.skip
- pytest.MonkeyPatch / monkeypatch fixture
- tmp_path fixture
- sys.modules shimming for fastapi.testclient.TestClient via InMemoryTestClient
- CLI runner support with argument, path, and -k filtering
"""

from __future__ import annotations
import math
import os
import re
import sys
import types
from typing import Any, Callable, Dict, List, Optional, Type, Union

# Ensure in-memory TestClient is available for FastAPI/Starlette test imports
try:
    from app.testing.client import InMemoryTestClient
    for mod_name in ("fastapi.testclient", "starlette.testclient"):
        shim_mod = types.ModuleType(mod_name)
        shim_mod.TestClient = InMemoryTestClient
        sys.modules[mod_name] = shim_mod
except Exception:
    pass


class ApproxScalar:
    """Float approximation comparator matching pytest.approx behavior."""

    def __init__(self, expected: float, rel: float = 1e-6, abs: float = 1e-12, nan_ok: bool = False):
        self.expected = expected
        self.rel = rel
        self.abs = abs
        self.nan_ok = nan_ok

    def __eq__(self, actual: Any) -> bool:
        if isinstance(actual, (int, float)):
            if math.isnan(self.expected):
                return math.isnan(actual) if self.nan_ok else False
            diff = builtins_abs(actual - self.expected)
            tol = max(self.rel * max(builtins_abs(actual), builtins_abs(self.expected)), self.abs)
            return diff <= tol
        return False

    def __ne__(self, actual: Any) -> bool:
        return not (self == actual)

    def __repr__(self) -> str:
        return f"{self.expected} ± {self.abs}"


builtins_abs = abs


def approx(expected: float, rel: float = 1e-6, abs: float = 1e-12, nan_ok: bool = False) -> ApproxScalar:
    """Returns an ApproxScalar for floating-point comparison."""
    return ApproxScalar(expected, rel=rel, abs=abs, nan_ok=nan_ok)


class _RaisesContext:
    """Context manager for asserting expected exceptions matching pytest.raises."""

    def __init__(self, expected_exception: Union[Type[BaseException], tuple], match: Optional[str] = None):
        self.expected_exception = expected_exception
        self.match = match
        self.value: Optional[BaseException] = None

    def __enter__(self) -> _RaisesContext:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> bool:
        if exc_type is None:
            raise AssertionError(f"DID NOT RAISE {self.expected_exception}")
        if not issubclass(exc_type, self.expected_exception):
            return False  # Let unexpected exception propagate
        self.value = exc_val
        if self.match is not None:
            pattern = re.compile(self.match)
            if not pattern.search(str(exc_val)):
                raise AssertionError(
                    f"Pattern {self.match!r} does not match {str(exc_val)!r}"
                )
        return True


def raises(expected_exception: Union[Type[BaseException], tuple], *args: Any, match: Optional[str] = None, **kwargs: Any) -> _RaisesContext:
    """Assert that a code block raises a specific exception."""
    return _RaisesContext(expected_exception, match=match)


def fixture(
    callable_or_scope: Optional[Union[Callable, str]] = None,
    *args: Any,
    scope: str = "function",
    params: Optional[Any] = None,
    autouse: bool = False,
    ids: Optional[Any] = None,
    name: Optional[str] = None,
    **kwargs: Any
) -> Callable:
    """
    Pytest fixture decorator.
    Supports both @pytest.fixture and @pytest.fixture(autouse=True, scope='module', ...).
    """
    if callable(callable_or_scope):
        fn = callable_or_scope
        fn._is_pytest_fixture = True
        fn._fixture_autouse = False
        fn._fixture_scope = scope
        fn._fixture_name = name or fn.__name__
        return fn

    def decorator(fn: Callable) -> Callable:
        fn._is_pytest_fixture = True
        fn._fixture_autouse = autouse
        fn._fixture_scope = scope
        fn._fixture_name = name or fn.__name__
        return fn

    return decorator


class _MarkDecorator:
    """Dynamic pytest mark generator."""

    def __getattr__(self, mark_name: str) -> Callable:
        def mark_wrapper(*args: Any, **kwargs: Any) -> Callable:
            def decorator(fn: Callable) -> Callable:
                marks = getattr(fn, "_pytest_marks", [])
                marks.append((mark_name, args, kwargs))
                fn._pytest_marks = marks
                return fn

            if len(args) == 1 and callable(args[0]) and not kwargs:
                return decorator(args[0])
            return decorator

        return mark_wrapper


mark = _MarkDecorator()


class MonkeyPatch:
    """Implementation of pytest.MonkeyPatch for isolated attribute/env patching."""

    def __init__(self):
        self._undo_actions: List[Callable[[], None]] = []

    def setattr(self, target: Any, name: Union[str, Any] = None, value: Any = None, raising: bool = True) -> None:
        if value is None and isinstance(target, str) and name is not None:
            # Handle setattr("pkg.mod.attr", value)
            target_path, attr_name = target.rsplit(".", 1)
            target = sys.modules.get(target_path) or __import__(target_path, fromlist=[attr_name])
            value = name
            name = attr_name

        had_attr = hasattr(target, name)
        old_val = getattr(target, name, None)

        if not had_attr and raising:
            pass  # Python allows setting new attributes, but raising is checked on delattr

        setattr(target, name, value)

        if had_attr:
            self._undo_actions.append(lambda: setattr(target, name, old_val))
        else:
            self._undo_actions.append(lambda: delattr(target, name) if hasattr(target, name) else None)

    def delattr(self, target: Any, name: str, raising: bool = True) -> None:
        if not hasattr(target, name):
            if raising:
                raise AttributeError(f"{target} has no attribute {name}")
            return
        old_val = getattr(target, name)
        delattr(target, name)
        self._undo_actions.append(lambda: setattr(target, name, old_val))

    def setenv(self, name: str, value: str, prepend: Optional[str] = None) -> None:
        had_env = name in os.environ
        old_val = os.environ.get(name)
        new_val = str(value)
        if prepend and had_env and old_val is not None:
            new_val = f"{new_val}{prepend}{old_val}"
        os.environ[name] = new_val

        if had_env and old_val is not None:
            self._undo_actions.append(lambda: os.environ.__setitem__(name, old_val))
        else:
            self._undo_actions.append(lambda: os.environ.pop(name, None))

    def delenv(self, name: str, raising: bool = True) -> None:
        if name not in os.environ:
            if raising:
                raise KeyError(name)
            return
        old_val = os.environ.pop(name)
        self._undo_actions.append(lambda: os.environ.__setitem__(name, old_val))

    def syspath_prepend(self, path: str) -> None:
        p = str(path)
        sys.path.insert(0, p)
        self._undo_actions.append(lambda: sys.path.remove(p) if p in sys.path else None)

    def undo(self) -> None:
        """Undoes all modifications made by this MonkeyPatch instance."""
        for action in reversed(self._undo_actions):
            try:
                action()
            except Exception:
                pass
        self._undo_actions.clear()

    def __enter__(self) -> MonkeyPatch:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.undo()


@fixture
def monkeypatch():
    """Built-in monkeypatch fixture."""
    mp = MonkeyPatch()
    yield mp
    mp.undo()


@fixture
def tmp_path():
    """Built-in tmp_path fixture returning a pathlib.Path to a temporary directory."""
    import tempfile
    import pathlib
    with tempfile.TemporaryDirectory() as td:
        yield pathlib.Path(td)


class PytestSkip(Exception):
    """Raised when a test is skipped."""
    pass


def skip(msg: str = "") -> None:
    """Skip the executing test with a message."""
    raise PytestSkip(msg)


def fail(msg: str = "") -> None:
    """Explicitly fail the executing test with a message."""
    raise AssertionError(msg)


def main(args: Optional[list[str]] = None) -> int:
    """CLI entrypoint that executes the AgentFlow test suite with argument support."""
    from run_tests import run_all_tests
    cmd_args = list(args if args is not None else sys.argv[1:])
    return run_all_tests(cmd_args)


if __name__ == "__main__":
    sys.exit(main())
