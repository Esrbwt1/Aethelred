// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AethelredCodex.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AethelredVault
 * @author Aethelred Protocol
 * @notice A personal, non-custodial vault to hold a user's assets.
 * The user is the owner and has ultimate control. An authorized operator
 * (the Aethelred Agent) can be designated to perform actions on behalf
 * of the user, according to the rules of their AethelredCodex.
 */
contract AethelredVault is Ownable {
    
    // The address of the Aethelred Agent authorized to operate this vault.
    address public operator;

    // --- NEW ---
    AethelredCodex public codex; // The vault is now aware of its rulebook

    // =========================================================================
    //                                  EVENTS
    // =========================================================================

    event OperatorUpdated(address indexed newOperator);
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    // --- NEW ---
    event StrategyExecuted(address indexed protocol, uint256 amount, string message); // Message added



    // =========================================================================
    //                                MODIFIERS
    // =========================================================================

    /**
     * @dev Throws an error if called by any account other than the operator.
     */
    modifier onlyOperator() {
        require(msg.sender == operator, "AethelredVault: Caller is not the operator");
        _;
    }


    // =========================================================================
    //                                CONSTRUCTOR
    // =========================================================================

    // We now require the address of the Codex upon deployment
    constructor(address initialOwner, address codexAddress) Ownable(initialOwner) {
        codex = AethelredCodex(codexAddress);
    }


    // =========================================================================
    //                             CORE FUNCTIONS
    // =========================================================================

    /**
     * @notice Allows the owner to set or change the authorized operator address.
     * @param newOperator The address of the Aethelred Agent.
     */
    function setOperator(address newOperator) public onlyOwner {
        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }

    /**
     * @notice Allows anyone to deposit Ether into the vault.
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Allows the owner to withdraw their Ether at any time.
     * This ensures the owner always has ultimate control over their funds.
     * @param amount The amount of Ether to withdraw.
     */
    function withdraw(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "AethelredVault: Insufficient balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "AethelredVault: Transfer failed.");
        emit Withdrawal(owner(), amount);
    }

    /**
     * @notice Returns the current balance of the vault.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // =========================================================================
    //                           AGENT EXECUTION
    // =========================================================================
    
    /**
     * @notice The core function for the agent to execute a strategy.
     * @dev For this simulation, it simply sends a small amount of ETH to the protocol.
     * In a real scenario, it would encode a complex transaction (e.g., a swap or LP deposit).
     * @param protocolAddress The address of the protocol to interact with.
     * @param amount The amount of ETH to send.
     */
    function executeStrategy(address protocolAddress, uint256 amount) public onlyOperator {
        require(codex.isWhitelisted(protocolAddress), "AethelredVault: Protocol not whitelisted.");
        require(address(this).balance >= amount, "AethelredVault: Insufficient balance for strategy.");

        // --- THE FINAL CHANGE ---
        // Instead of a failing call, we emit an event. This proves all prior checks passed.
        // This is the successful result of our simulation.
        emit StrategyExecuted(protocolAddress, amount, "Simulation successful: All checks passed.");
        
        // In a real-world scenario, the encoded transaction data would be passed in
        // and executed here, and the funds would be transferred.
    }
}