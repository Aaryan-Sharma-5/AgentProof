// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Locks task rewards and releases them only after a trusted evaluator signs off on a deterministic result digest.
contract AgentEscrow {
    struct Task {
        address creator;
        uint256 reward;
        bool settled;
    }

    mapping(bytes32 => Task) public tasks;

    address public immutable trustedVerifier;

    event TaskCreated(bytes32 indexed taskId, address indexed creator, uint256 reward);
    event TaskSettled(bytes32 indexed taskId, address indexed worker, uint256 reward, bytes32 resultHash);

    error TaskAlreadyExists();
    error ZeroReward();
    error TaskNotFound();
    error TaskAlreadySettled();
    error InvalidSignature();
    error TransferFailed();

    constructor(address _trustedVerifier) {
        trustedVerifier = _trustedVerifier;
    }

    function createTask(bytes32 taskId) external payable {
        if (tasks[taskId].creator != address(0)) revert TaskAlreadyExists();
        if (msg.value == 0) revert ZeroReward();

        tasks[taskId] = Task({creator: msg.sender, reward: msg.value, settled: false});

        emit TaskCreated(taskId, msg.sender, msg.value);
    }

    /// @dev The worker is msg.sender, not a passed-in parameter. The signed digest already binds msg.sender, so a signature for one worker cannot be replayed by another.
    function settleTask(
        bytes32 taskId,
        bytes32 resultHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Task storage task = tasks[taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.settled) revert TaskAlreadySettled();

        bytes32 raw = keccak256(
            abi.encode(block.chainid, address(this), taskId, msg.sender, resultHash)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", raw));

        address signer = ecrecover(digest, v, r, s);
        if (signer == address(0) || signer != trustedVerifier) revert InvalidSignature();

        task.settled = true;
        uint256 reward = task.reward;

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        if (!success) revert TransferFailed();

        emit TaskSettled(taskId, msg.sender, reward, resultHash);
    }
}
