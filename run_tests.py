"""
AgentFlow Comprehensive Test Runner.
Executes all unit, graph, integration, security, and edge-case test suites.
Can be run standalone with `python run_tests.py` or via `pytest` / `python -m pytest`.
Supports CLI arguments:
  python run_tests.py [paths...] [-k pattern] [-v] [-x]
"""

from __future__ import annotations
import sys
import os
import re
import glob
import inspect
import asyncio
import pathlib
import traceback
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

# Reconfigure standard streams for UTF-8 on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure current directory is in sys.path
# The suite is hermetic: it must never dispatch to the canonical agent service or touch a real
# chain. Mock payments are opted into here, explicitly, before app.config.settings is imported.
# Production and local demo default to USE_MOCK_PAYMENTS=false (see app/config/settings.py).
os.environ.setdefault("USE_MOCK_PAYMENTS", "true")
os.environ.setdefault("ENVIRONMENT", "test")

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


# Default canonical test suites matching the specification
DEFAULT_TEST_MODULES = [
    "tests.unit.test_requirement_agent",
    "tests.unit.test_discovery_agent",
    "tests.unit.test_policy_engine",
    "tests.unit.test_risk_engine",
    "tests.unit.test_api_executor",
    "tests.unit.test_verification_agent",
    "tests.unit.test_payment_service",
    "tests.graph.test_agentflow_graph",
    "tests.graph.test_graph_routing",
    "tests.graph.test_graph_failures",
    "tests.security.test_ssrf",
    "tests.security.test_prompt_injection",
    "tests.security.test_idempotency",
    "tests.edge_cases.test_all_edge_cases",
    "tests.integration.test_request_flow",
    "tests.integration.test_marketplace_flow",
    "tests.integration.test_payment_flow",
    "tests.integration.test_canonical_execution",
]


def _path_to_module_name(file_path: str) -> Optional[str]:
    """Converts a filesystem path to a python importable module name."""
    abs_path = os.path.abspath(file_path)
    if not abs_path.endswith(".py"):
        return None
    rel = os.path.relpath(abs_path, BASE_DIR)
    rel_without_ext = os.path.splitext(rel)[0]
    return rel_without_ext.replace(os.path.sep, "/").replace("/", ".")


def _resolve_builtin_fixture(name: str, resolved_cache: Dict[str, Any], active_teardowns: List[Callable[[], None]]) -> Any:
    """Provides standard built-in fixtures when requested by test functions."""
    if name in resolved_cache:
        return resolved_cache[name]

    if name == "fresh_store":
        from app.repositories.in_memory import InMemoryStore
        val = InMemoryStore()
        resolved_cache[name] = val
        return val

    elif name == "mock_gateway":
        from app.blockchain.adapter import MockPaymentAdapter
        val = MockPaymentAdapter(balance_mon=1.0)
        resolved_cache[name] = val
        return val

    elif name == "payment_service":
        from app.services.payment_service import PaymentService
        gw = _resolve_fixture("mock_gateway", None, resolved_cache, active_teardowns)
        st = _resolve_fixture("fresh_store", None, resolved_cache, active_teardowns)
        val = PaymentService(gateway=gw, data_store=st)
        resolved_cache[name] = val
        return val

    elif name == "agent":
        from app.agents.requirement.agent import RequirementAgent
        val = RequirementAgent(use_llm_if_available=False)
        resolved_cache[name] = val
        return val

    elif name == "discovery_agent":
        from app.agents.discovery.agent import ApiDiscoveryAgent
        from app.services.marketplace_service import MarketplaceService
        st = _resolve_fixture("fresh_store", None, resolved_cache, active_teardowns)
        val = ApiDiscoveryAgent(marketplace_service=MarketplaceService(data_store=st))
        resolved_cache[name] = val
        return val

    elif name == "policy_service":
        from app.services.policy_service import PolicyService
        val = PolicyService()
        resolved_cache[name] = val
        return val

    elif name == "sample_policy":
        from app.models.domain import AgentPolicy
        val = AgentPolicy(
            agent_id="agent-1",
            max_transaction_mon=0.10,
            daily_limit_mon=1.00,
            auto_approve=True,
            allowed_categories=["crypto_price", "weather"],
            require_human_above_mon=0.08,
            blocked_providers=["provider_bad"]
        )
        resolved_cache[name] = val
        return val

    elif name == "risk_engine":
        from app.agents.risk.engine import RiskEngine
        val = RiskEngine()
        resolved_cache[name] = val
        return val

    elif name == "base_provider":
        from app.models.domain import Provider
        val = Provider(
            id="prov_1",
            name="Reliable Oracle",
            description="Trusted data provider",
            payment_address="0x123",
            is_active=True,
            is_suspended=False,
            reputation_score=0.98,
            verification_success_rate=0.99
        )
        resolved_cache[name] = val
        return val

    elif name == "base_api":
        from app.models.domain import ApiRecord
        val = ApiRecord(
            id="api_1",
            provider_id="prov_1",
            name="Price Feed",
            category="crypto_price",
            price_mon=0.01,
            endpoint="https://oracle.io/price"
        )
        resolved_cache[name] = val
        return val

    elif name == "base_policy":
        from app.models.domain import AgentPolicy
        val = AgentPolicy(agent_id="agent-1", max_transaction_mon=0.10, daily_limit_mon=1.00)
        resolved_cache[name] = val
        return val

    elif name == "executor":
        from app.services.api_execution_service import ApiExecutionService
        val = ApiExecutionService(allow_local_mock=False)
        resolved_cache[name] = val
        return val

    elif name == "verifier":
        from app.agents.verification.agent import VerificationAgent
        val = VerificationAgent()
        resolved_cache[name] = val
        return val

    elif name == "weather_api":
        from app.models.domain import ApiRecord
        val = ApiRecord(
            id="api_weather",
            provider_id="prov_weather",
            name="Weather Feed",
            category="weather",
            price_mon=0.01,
            endpoint="https://weather.io",
            output_schema={"type": "object", "required": ["city", "temperature", "condition"]}
        )
        resolved_cache[name] = val
        return val

    elif name == "crypto_api":
        from app.models.domain import ApiRecord
        val = ApiRecord(
            id="api_crypto",
            provider_id="prov_crypto",
            name="Crypto Feed",
            category="crypto_price",
            price_mon=0.02,
            endpoint="https://crypto.io",
            output_schema={"type": "object", "required": ["price", "asset"]}
        )
        resolved_cache[name] = val
        return val

    elif name == "client":
        from app.testing.client import InMemoryTestClient
        from app.main import app
        val = InMemoryTestClient(app)
        resolved_cache[name] = val
        return val

    elif name == "monkeypatch":
        from pytest import MonkeyPatch
        mp = MonkeyPatch()
        active_teardowns.append(mp.undo)
        resolved_cache[name] = mp
        return mp

    elif name == "tmp_path":
        import tempfile
        td = tempfile.TemporaryDirectory()
        active_teardowns.append(td.cleanup)
        p = pathlib.Path(td.name)
        resolved_cache[name] = p
        return p

    raise KeyError(f"No fixture found matching '{name}'")


def _resolve_fixture(
    name: str,
    module: Optional[Any],
    resolved_cache: Dict[str, Any],
    active_teardowns: List[Callable[[], None]],
    resolution_stack: Optional[Set[str]] = None
) -> Any:
    """Recursively resolves a fixture by name from the test module or built-in registry."""
    if resolution_stack is None:
        resolution_stack = set()
    if name in resolution_stack:
        raise RuntimeError(f"Cyclic fixture dependency detected: {' -> '.join(resolution_stack)} -> {name}")
    resolution_stack.add(name)

    if name in resolved_cache:
        return resolved_cache[name]

    # Check if defined in the test module
    fixture_fn = None
    if module is not None and hasattr(module, name):
        candidate = getattr(module, name)
        if callable(candidate) and getattr(candidate, "_is_pytest_fixture", False):
            fixture_fn = candidate

    if fixture_fn is not None:
        sig = inspect.signature(fixture_fn)
        sub_kwargs = {}
        for p in sig.parameters.keys():
            sub_kwargs[p] = _resolve_fixture(p, module, resolved_cache, active_teardowns, resolution_stack.copy())

        if inspect.isgeneratorfunction(fixture_fn):
            gen = fixture_fn(**sub_kwargs)
            val = next(gen)
            def teardown():
                try:
                    next(gen)
                except StopIteration:
                    pass
            active_teardowns.append(teardown)
            resolved_cache[name] = val
            return val
        else:
            val = fixture_fn(**sub_kwargs)
            resolved_cache[name] = val
            return val

    # Fallback to built-in fixtures
    return _resolve_builtin_fixture(name, resolved_cache, active_teardowns)


def _run_autouse_fixtures(module: Any, active_teardowns: List[Callable[[], None]]):
    """Discovers and executes all autouse=True fixtures defined in module."""
    if module is None:
        return
    for attr in dir(module):
        candidate = getattr(module, attr)
        if callable(candidate) and getattr(candidate, "_is_pytest_fixture", False) and getattr(candidate, "_fixture_autouse", False):
            resolved_cache: Dict[str, Any] = {}
            sig = inspect.signature(candidate)
            sub_kwargs = {}
            for p in sig.parameters.keys():
                sub_kwargs[p] = _resolve_fixture(p, module, resolved_cache, active_teardowns)

            if inspect.isgeneratorfunction(candidate):
                gen = candidate(**sub_kwargs)
                next(gen)
                def teardown():
                    try:
                        next(gen)
                    except StopIteration:
                        pass
                active_teardowns.append(teardown)
            else:
                candidate(**sub_kwargs)


def _get_parametrize_cases(fn: Callable) -> List[Tuple[str, Dict[str, Any]]]:
    """Inspects function marks for @pytest.mark.parametrize and generates parameter bindings."""
    marks = getattr(fn, "_pytest_marks", [])
    param_marks = [m for m in marks if m[0] == "parametrize"]
    if not param_marks:
        return [("", {})]

    # For each parametrize mark, extract argnames and argvalues
    all_cases: List[Tuple[str, Dict[str, Any]]] = [("", {})]

    for _, args, _ in param_marks:
        if len(args) < 2:
            continue
        argnames_raw, argvalues = args[0], args[1]
        if isinstance(argnames_raw, str):
            argnames = [k.strip() for k in argnames_raw.split(",") if k.strip()]
        else:
            argnames = list(argnames_raw)

        new_cases: List[Tuple[str, Dict[str, Any]]] = []
        for case_label, existing_dict in all_cases:
            for val_idx, val in enumerate(argvalues):
                val_dict = dict(existing_dict)
                if len(argnames) == 1:
                    val_dict[argnames[0]] = val
                    label_part = str(val)
                else:
                    for k, v in zip(argnames, val):
                        val_dict[k] = v
                    label_part = "-".join(str(v) for v in val)

                sub_label = f"{case_label}[{label_part}]" if case_label else f"[{label_part}]"
                new_cases.append((sub_label, val_dict))

        all_cases = new_cases

    return all_cases


def run_all_tests(argv: Optional[List[str]] = None) -> int:
    """
    Main test orchestrator with full CLI argument, path discovery,
    and filter options support.
    """
    if argv is None:
        argv = sys.argv[1:]

    # Parse CLI flags
    k_pattern: Optional[str] = None
    verbose: bool = False
    exit_first: bool = False
    positional_paths: List[str] = []

    idx = 0
    while idx < len(argv):
        arg = argv[idx]
        if arg in ("-k", "--keyword") and idx + 1 < len(argv):
            k_pattern = argv[idx + 1]
            idx += 2
        elif arg.startswith("-k="):
            k_pattern = arg.split("=", 1)[1]
            idx += 1
        elif arg in ("-v", "--verbose"):
            verbose = True
            idx += 1
        elif arg in ("-x", "--exitfirst"):
            exit_first = True
            idx += 1
        elif arg in ("-s", "--capture=no"):
            idx += 1
        elif arg in ("-h", "--help"):
            print("AgentFlow Test Runner\nUsage: python run_tests.py [paths...] [-k pattern] [-v] [-x]")
            return 0
        elif not arg.startswith("-"):
            positional_paths.append(arg)
            idx += 1
        else:
            idx += 1

    # Determine test modules to execute
    target_modules: List[str] = []
    target_specific_tests: Dict[str, Optional[str]] = {}

    if positional_paths:
        for p in positional_paths:
            # Handle path::function selector (e.g. tests/unit/test_foo.py::test_bar)
            specific_test = None
            if "::" in p:
                file_part, specific_test = p.split("::", 1)
                p = file_part

            p_norm = os.path.normpath(p)
            if os.path.isfile(p_norm):
                mod_name = _path_to_module_name(p_norm)
                if mod_name:
                    target_modules.append(mod_name)
                    target_specific_tests[mod_name] = specific_test
            elif os.path.isdir(p_norm):
                for root, _, files in os.walk(p_norm):
                    for f in files:
                        if f.startswith("test_") and f.endswith(".py"):
                            full_f = os.path.join(root, f)
                            mod_name = _path_to_module_name(full_f)
                            if mod_name:
                                target_modules.append(mod_name)
            else:
                # Might be module name directly (e.g. tests.unit.test_api_executor)
                target_modules.append(p)
                target_specific_tests[p] = specific_test
    else:
        target_modules = list(DEFAULT_TEST_MODULES)

    # De-duplicate while preserving ordering
    seen_mods = set()
    modules_to_run = []
    for m in target_modules:
        if m not in seen_mods:
            seen_mods.add(m)
            modules_to_run.append(m)

    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    skipped_tests = 0
    errors: List[Tuple[str, str, str]] = []

    print("=" * 70)
    print("RUNNING AGENTFLOW TEST SUITE")
    print("=" * 70)

    for mod_name in modules_to_run:
        print(f"\n[Suite] {mod_name}")
        try:
            mod = __import__(mod_name, fromlist=["*"])
        except Exception as e:
            print(f"  [FAIL] to import {mod_name}: {e}")
            traceback.print_exc()
            failed_tests += 1
            errors.append((mod_name, "IMPORT_ERROR", str(e)))
            if exit_first:
                break
            continue

        specific_target = target_specific_tests.get(mod_name)

        # Collect test_ functions in deterministic order
        test_fns = [
            (attr_name, getattr(mod, attr_name))
            for attr_name in sorted(dir(mod))
            if attr_name.startswith("test_") and callable(getattr(mod, attr_name))
        ]

        for attr_name, fn in test_fns:
            if specific_target and attr_name != specific_target:
                continue

            # Apply -k keyword filter if specified
            if k_pattern and (k_pattern not in attr_name and k_pattern not in mod_name):
                continue

            # Expand parametrized test cases
            cases = _get_parametrize_cases(fn)

            for case_label, param_bindings in cases:
                test_display_name = f"{attr_name}{case_label}"
                total_tests += 1
                active_teardowns: List[Callable[[], None]] = []
                resolved_fixtures: Dict[str, Any] = dict(param_bindings)

                try:
                    # 1. Run autouse fixtures
                    _run_autouse_fixtures(mod, active_teardowns)

                    # 2. Resolve parameters for the test function
                    sig = inspect.signature(fn)
                    call_kwargs = {}
                    for p in sig.parameters.keys():
                        if p in resolved_fixtures:
                            call_kwargs[p] = resolved_fixtures[p]
                        else:
                            call_kwargs[p] = _resolve_fixture(p, mod, resolved_fixtures, active_teardowns)

                    # 3. Execute test (support async tests and sync tests)
                    if inspect.iscoroutinefunction(fn):
                        asyncio.run(fn(**call_kwargs))
                    else:
                        fn(**call_kwargs)

                    passed_tests += 1
                    print(f"  [PASS] {test_display_name}")

                except Exception as e:
                    # Check for skip
                    if type(e).__name__ == "PytestSkip":
                        skipped_tests += 1
                        print(f"  [SKIP] {test_display_name}: {e}")
                    else:
                        failed_tests += 1
                        errors.append((mod_name, test_display_name, str(e)))
                        print(f"  [FAIL] {test_display_name}: {e}")
                        traceback.print_exc()
                        if exit_first:
                            break
                finally:
                    # 4. Clean up all generator/teardown fixtures in reverse order
                    for td in reversed(active_teardowns):
                        try:
                            td()
                        except Exception as td_err:
                            print(f"  [TEARDOWN_ERROR] in {test_display_name}: {td_err}")

            if exit_first and failed_tests > 0:
                break
        if exit_first and failed_tests > 0:
            break

    print("\n" + "=" * 70)
    print(f"RESULTS: Total: {total_tests} | Passed: {passed_tests} | Failed: {failed_tests} | Skipped: {skipped_tests}")
    print("=" * 70)

    if errors:
        print("\nFailures:")
        for mod, test, err in errors:
            print(f" - [{mod}] {test}: {err}")
        return 1
    else:
        print("\nALL TESTS PASSED SUCCESSFULLY! [OK]")
        return 0


if __name__ == "__main__":
    sys.exit(run_all_tests())
