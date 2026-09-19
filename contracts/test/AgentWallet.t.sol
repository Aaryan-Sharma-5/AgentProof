// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AgentWallet} from "../src/AgentWallet.sol";

contract RevertingReceiver {
    receive() external payable {
        revert("nope");
    }
}

contract AgentWalletTest is Test {
    AgentWallet wallet;

    address agent = address(0xA6E7);
    address stranger = address(0xBAD);
    address payable provider = payable(address(0xCAFE));

    uint256 constant MAX_PAYMENT = 0.02 ether;

    event PaymentSettled(address indexed provider, uint256 amount);

    function setUp() public {
        wallet = new AgentWallet(agent, MAX_PAYMENT);
    }

    function test_DepositSucceeds() public {
        wallet.deposit{value: 1 ether}();
        assertEq(address(wallet).balance, 1 ether);
    }

    function test_SuccessfulPayment() public {
        wallet.deposit{value: 1 ether}();

        uint256 providerBalanceBefore = provider.balance;

        vm.prank(agent);
        wallet.payService(provider, 0.01 ether);

        assertEq(provider.balance, providerBalanceBefore + 0.01 ether);
        assertEq(address(wallet).balance, 1 ether - 0.01 ether);
    }

    function test_UnauthorizedPaymentReverts() public {
        wallet.deposit{value: 1 ether}();

        vm.prank(stranger);
        vm.expectRevert(AgentWallet.NotAuthorizedAgent.selector);
        wallet.payService(provider, 0.01 ether);
    }

    function test_ZeroAmountReverts() public {
        wallet.deposit{value: 1 ether}();

        vm.prank(agent);
        vm.expectRevert(AgentWallet.ZeroAmount.selector);
        wallet.payService(provider, 0);
    }

    function test_PaymentAboveCapReverts() public {
        wallet.deposit{value: 1 ether}();

        vm.prank(agent);
        vm.expectRevert(AgentWallet.AmountExceedsMaxPayment.selector);
        wallet.payService(provider, MAX_PAYMENT + 1);
    }

    function test_PaymentAboveBalanceReverts() public {
        wallet.deposit{value: 0.005 ether}();

        vm.prank(agent);
        vm.expectRevert(AgentWallet.InsufficientBalance.selector);
        wallet.payService(provider, 0.01 ether);
    }

    function test_FailedProviderTransferReverts() public {
        wallet.deposit{value: 1 ether}();
        RevertingReceiver badProvider = new RevertingReceiver();

        vm.prank(agent);
        vm.expectRevert(AgentWallet.TransferFailed.selector);
        wallet.payService(payable(address(badProvider)), 0.01 ether);
    }

    function test_PaymentSettledEventEmitted() public {
        wallet.deposit{value: 1 ether}();

        vm.expectEmit(true, false, false, true);
        emit PaymentSettled(provider, 0.01 ether);

        vm.prank(agent);
        wallet.payService(provider, 0.01 ether);
    }
}
