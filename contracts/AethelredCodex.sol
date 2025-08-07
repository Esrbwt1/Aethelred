// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AethelredCodex is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    struct RuleSet {
        uint8 riskTolerance;
        uint8 maxAllocationPerProtocol;
    }

    mapping(uint256 => RuleSet) public rules;

    // --- NEW ---
    // Mapping from a protocol's contract address to its whitelisted status.
    mapping(address => bool) public isWhitelisted;

    event RuleUpdated(uint256 indexed tokenId, string rule, uint256 newValue);
    // --- NEW ---
    event WhitelistUpdated(address indexed protocol, bool status);

    constructor(address initialOwner) ERC721("Aethelred Codex", "AEDX") Ownable(initialOwner) {}

    function mintCodex() public {
        uint256 tokenId = _nextTokenId;
        _mint(msg.sender, tokenId);
        rules[tokenId] = RuleSet({ riskTolerance: 5, maxAllocationPerProtocol: 25 });
        _nextTokenId++;
    }

    function updateRiskTolerance(uint256 tokenId, uint8 newRiskTolerance) public {
        require(ownerOf(tokenId) == msg.sender, "AethelredCodex: Caller is not the owner of this token.");
        require(newRiskTolerance >= 1 && newRiskTolerance <= 10, "AethelredCodex: Risk tolerance must be between 1 and 10.");
        rules[tokenId].riskTolerance = newRiskTolerance;
        emit RuleUpdated(tokenId, "RiskTolerance", newRiskTolerance);
    }

    // =========================================================================
    //                         GUARDIAN AGENT LOGIC
    // =========================================================================
    
    /**
     * @notice Allows the contract owner to add or remove a protocol from the whitelist.
     * @dev Only the owner of the entire AethelredCodex contract can call this.
     * @param protocolAddress The address of the protocol's main contract.
     * @param status The desired whitelisted status (true or false).
     */
    function setWhitelistStatus(address protocolAddress, bool status) public onlyOwner {
        isWhitelisted[protocolAddress] = status;
        emit WhitelistUpdated(protocolAddress, status);
    }


    // =========================================================================
    //                     CORE OVERRIDE FOR NON-TRANSFERABILITY
    // =========================================================================
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from == address(0) || to == address(0)) {
            return super._update(to, tokenId, auth);
        }
        revert("AethelredCodex: This token is non-transferable.");
    }
}