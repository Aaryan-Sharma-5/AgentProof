// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Controls autonomous agent spending under an immutable per-payment cap.
contract AgentWallet {
    address public immutable agent;
    uint256 public immutable maxPayment;

    event PaymentSettled(address indexed provider, uint256 amount);

    error NotAuthorizedAgent();
    error ZeroAmount();
    error AmountExceedsMaxPayment();
    error InsufficientBalance();
    error TransferFailed();
    error ZeroAgent();
    error ZeroMaxPayment();

    constructor(address _agent, uint256 _maxPayment) {
        if (_agent == address(0)) revert ZeroAgent();
        if (_maxPayment == 0) revert ZeroMaxPayment();

        agent = _agent;
        maxPayment = _maxPayment;
    }

    receive() external payable {}

    function deposit() external payable {}

    function payService(address payable provider, uint256 amount) external {
        if (msg.sender != agent) revert NotAuthorizedAgent();
        if (amount == 0) revert ZeroAmount();
        if (amount > maxPayment) revert AmountExceedsMaxPayment();
        if (address(this).balance < amount) revert InsufficientBalance();

        (bool success, ) = provider.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PaymentSettled(provider, amount);
    }
}
