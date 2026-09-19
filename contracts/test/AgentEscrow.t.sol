// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";

contract AgentEscrowTest is Test {
    AgentEscrow escrow;

    uint256 verifierKey = 0xA11CE;
    uint256 otherKey = 0xB0B1E;
    address verifier;
    address worker = address(0xB0B);
    address otherWorker = address(0xD00D);
    address creator = address(0xC0FFEE);

    uint256 constant REWARD = 0.05 ether;

    function setUp() public {
        verifier = vm.addr(verifierKey);
        escrow = new AgentEscrow(verifier);
        vm.deal(creator, 10 ether);
    }

    function _createTask(bytes32 taskId) internal {
        vm.prank(creator);
        escrow.createTask{value: REWARD}(taskId);
    }

    function _digest(bytes32 taskId, address who, bytes32 resultHash) internal view returns (bytes32) {
        bytes32 raw = keccak256(abi.encode(block.chainid, address(escrow), taskId, who, resultHash));
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", raw));
    }

    function _signWith(uint256 key, bytes32 digest) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        (v, r, s) = vm.sign(key, digest);
    }

    function test_ValidProofPaysWorker() public {
        bytes32 taskId = keccak256("task-1");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        bytes32 digest = _digest(taskId, worker, resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        uint256 before = worker.balance;

        vm.prank(worker);
        escrow.settleTask(taskId, resultHash, v, r, s);

        assertEq(worker.balance, before + REWARD);
        (, , bool settled) = escrow.tasks(taskId);
        assertTrue(settled);
    }

    function test_TamperedResultHashReverts() public {
        bytes32 taskId = keccak256("task-2");
        _createTask(taskId);

        bytes32 signedResultHash = keccak256("result-A");
        bytes32 submittedResultHash = keccak256("result-B");
        bytes32 digest = _digest(taskId, worker, signedResultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, submittedResultHash, v, r, s);

        (, uint256 reward, bool settled) = escrow.tasks(taskId);
        assertFalse(settled);
        assertEq(reward, REWARD);
        assertEq(address(escrow).balance, REWARD);
    }

    function test_WrongWorkerSignatureReverts() public {
        bytes32 taskId = keccak256("task-3");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        // Signed for `worker`, but `otherWorker` submits it.
        bytes32 digest = _digest(taskId, worker, resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(otherWorker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);
    }

    function test_WrongTaskSignatureReverts() public {
        bytes32 taskId1 = keccak256("task-4a");
        bytes32 taskId2 = keccak256("task-4b");
        _createTask(taskId1);
        _createTask(taskId2);

        bytes32 resultHash = keccak256("result-A");
        // Signed for taskId1, submitted against taskId2.
        bytes32 digest = _digest(taskId1, worker, resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId2, resultHash, v, r, s);
    }

    function test_WrongEvaluatorSignatureReverts() public {
        bytes32 taskId = keccak256("task-5");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        bytes32 digest = _digest(taskId, worker, resultHash);
        // Signed by someone other than the trusted verifier.
        (uint8 v, bytes32 r, bytes32 s) = _signWith(otherKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);
    }

    function test_DoubleSettlementReverts() public {
        bytes32 taskId = keccak256("task-6");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        bytes32 digest = _digest(taskId, worker, resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        escrow.settleTask(taskId, resultHash, v, r, s);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.TaskAlreadySettled.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);
    }

    function test_ZeroValueTaskReverts() public {
        vm.prank(creator);
        vm.expectRevert(AgentEscrow.ZeroReward.selector);
        escrow.createTask{value: 0}(keccak256("task-7"));
    }

    function test_MalformedSignatureReverts() public {
        bytes32 taskId = keccak256("task-8");
        _createTask(taskId);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, keccak256("result-A"), 0, bytes32(0), bytes32(0));
    }

    function test_TaskCannotBeCreatedTwice() public {
        bytes32 taskId = keccak256("task-9");
        _createTask(taskId);

        vm.prank(creator);
        vm.expectRevert(AgentEscrow.TaskAlreadyExists.selector);
        escrow.createTask{value: REWARD}(taskId);
    }

    function test_NonexistentTaskCannotBeSettled() public {
        bytes32 taskId = keccak256("task-10");
        bytes32 resultHash = keccak256("result-A");
        bytes32 digest = _digest(taskId, worker, resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.TaskNotFound.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);
    }

    function test_ConstructorRejectsZeroVerifier() public {
        vm.expectRevert(AgentEscrow.ZeroVerifier.selector);
        new AgentEscrow(address(0));
    }

    /// Signs a digest as if block.chainid were `wrongChainId`, while the real chain (and therefore the contract's own block.chainid) is unchanged. This proves chain binding: a signature minted for chain A is rejected when submitted on chain B, without ever mutating the test's actual chain ID.
    function test_WrongChainIdSignatureFails() public {
        bytes32 taskId = keccak256("task-11");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        uint256 wrongChainId = block.chainid + 1;

        bytes32 raw = keccak256(
            abi.encode(wrongChainId, address(escrow), taskId, worker, resultHash)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", raw));
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);

        (, uint256 reward, bool settled) = escrow.tasks(taskId);
        assertFalse(settled);
        assertEq(reward, REWARD);
        assertEq(address(escrow).balance, REWARD);
    }

    /// Deploys a second AgentEscrow and proves a signature bound to one instance's address cannot be accepted by the other, demonstrating address(this) binding.
    function test_CrossContractReplayFails() public {
        AgentEscrow otherEscrow = new AgentEscrow(verifier);

        bytes32 taskId = keccak256("task-12");
        _createTask(taskId);
        vm.deal(creator, REWARD);
        vm.prank(creator);
        otherEscrow.createTask{value: REWARD}(taskId);

        bytes32 resultHash = keccak256("result-A");

        // Signed for `otherEscrow`'s address, submitted to the original `escrow`.
        bytes32 raw = keccak256(
            abi.encode(block.chainid, address(otherEscrow), taskId, worker, resultHash)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", raw));
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(worker);
        vm.expectRevert(AgentEscrow.InvalidSignature.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);

        (, uint256 reward, bool settled) = escrow.tasks(taskId);
        assertFalse(settled);
        assertEq(reward, REWARD);
        assertEq(address(escrow).balance, REWARD);
    }

    function test_FailedWorkerPayoutLeavesStateUntouched() public {
        RevertingWorker badWorker = new RevertingWorker();

        bytes32 taskId = keccak256("task-13");
        _createTask(taskId);

        bytes32 resultHash = keccak256("result-A");
        bytes32 digest = _digest(taskId, address(badWorker), resultHash);
        (uint8 v, bytes32 r, bytes32 s) = _signWith(verifierKey, digest);

        vm.prank(address(badWorker));
        vm.expectRevert(AgentEscrow.TransferFailed.selector);
        escrow.settleTask(taskId, resultHash, v, r, s);

        (, uint256 reward, bool settled) = escrow.tasks(taskId);
        assertFalse(settled);
        assertEq(reward, REWARD);
        assertEq(address(escrow).balance, REWARD);
    }
}

contract RevertingWorker {
    receive() external payable {
        revert("nope");
    }
}
