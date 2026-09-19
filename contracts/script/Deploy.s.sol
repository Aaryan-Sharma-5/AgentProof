// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AgentWallet} from "../src/AgentWallet.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";

/// @notice Deploys AgentWallet and AgentEscrow using environment-supplied configuration. Reads:
///   DEPLOYER_KEY      - deployer/broadcaster private key
///   AGENT_ADDRESS      - the authorized agent for AgentWallet
///   VERIFIER_ADDRESS   - the trusted evaluator for AgentEscrow
///   MAX_PAYMENT        - AgentWallet's immutable per-payment cap, in wei
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address agentAddress = vm.envAddress("AGENT_ADDRESS");
        address verifierAddress = vm.envAddress("VERIFIER_ADDRESS");
        uint256 maxPayment = vm.envUint("MAX_PAYMENT");

        require(agentAddress != address(0), "AGENT_ADDRESS is zero");
        require(verifierAddress != address(0), "VERIFIER_ADDRESS is zero");
        require(maxPayment > 0, "MAX_PAYMENT is zero");

        address deployer = vm.addr(deployerKey);

        console.log("Deployer:        ", deployer);
        console.log("Agent:           ", agentAddress);
        console.log("Verifier:        ", verifierAddress);
        console.log("Max payment (wei):", maxPayment);
        console.log("Chain ID:        ", block.chainid);

        vm.startBroadcast(deployerKey);

        AgentWallet wallet = new AgentWallet(agentAddress, maxPayment);
        AgentEscrow escrow = new AgentEscrow(verifierAddress);

        vm.stopBroadcast();

        console.log("AgentWallet deployed at:", address(wallet));
        console.log("AgentEscrow deployed at:", address(escrow));
        console.log("Trusted verifier:       ", escrow.trustedVerifier());
        console.log("Agent:                  ", wallet.agent());
        console.log("Max payment (wei):      ", wallet.maxPayment());
    }
}
