// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AEToken
 * @author Aethelred Protocol
 * @notice The official ERC-20 governance and utility token of the Aethelred ecosystem.
 * Total Supply: 1,000,000,000 $AED.
 */
contract AEToken is ERC20, Ownable {
    /**
     * @notice Deploys the contract and mints the entire total supply
     *         to the deployer's address (the initial owner).
     * @param initialOwner The address to receive the entire token supply and contract ownership.
     */
    constructor(address initialOwner)
        ERC20("Aethelred", "AED")
        Ownable(initialOwner)
    {
        // The total supply will be 1,000,000,000 tokens.
        // Since ERC20 tokens use 18 decimal places by default, we must
        // append 18 zeros to our desired supply.
        uint256 totalSupply = 1_000_000_000 * (10**18);
        
        // _mint is an internal function from the ERC20 contract that creates
        // new tokens and assigns them to an address.
        _mint(initialOwner, totalSupply);
    }
}