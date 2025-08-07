const { expect } = require("chai");
const hre = require("hardhat");

describe("AethelredCodex Contract", function () {
  let AethelredCodex, aethelredCodex, owner, addr1;

  // This `beforeEach` block runs before each `it()` test.
  // It deploys a fresh contract for every test to ensure isolation.
  beforeEach(async function () {
    // Get the signers (accounts)
    [owner, addr1] = await hre.ethers.getSigners();

    // Get the ContractFactory and deploy the contract
    AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");
    aethelredCodex = await AethelredCodex.deploy(owner.address);
    await aethelredCodex.waitForDeployment();
  });

  // Test case 1: It should allow a user to mint a Codex.
  it("Should allow a user to mint a Codex and assign ownership", async function () {
    // addr1 (a user other than the contract owner) mints their own Codex.
    await aethelredCodex.connect(addr1).mintCodex();

    // We expect addr1 to now be the owner of Token ID 1.
    // The first token ID is 1 because our counter starts at 1.
    expect(await aethelredCodex.ownerOf(1)).to.equal(addr1.address);
  });

  // Test case 2: It should set the correct default rules upon minting.
  it("Should set default rules upon minting", async function () {
    await aethelredCodex.connect(addr1).mintCodex();
    
    // Retrieve the rules for Token ID 1.
    const rules = await aethelredCodex.rules(1);

    // Check if the rules match the defaults we set in the contract.
    expect(rules.riskTolerance).to.equal(5);
    expect(rules.maxAllocationPerProtocol).to.equal(25);
  });

  // Test case 3: This is the most critical test.
  // It should REVERT when a user tries to transfer their Codex.
  it("Should REVERT when attempting to transfer a Codex", async function () {
    // addr1 mints their Codex.
    await aethelredCodex.connect(addr1).mintCodex();

    // We expect the owner of Token ID 1 to be addr1.
    expect(await aethelredCodex.ownerOf(1)).to.equal(addr1.address);

    // Now, addr1 attempts to transfer the token to the `owner` account.
    // We expect this transaction to be reverted by our `_update` function logic.
    await expect(
      aethelredCodex.connect(addr1).transferFrom(addr1.address, owner.address, 1)
    ).to.be.revertedWith("AethelredCodex: This token is non-transferable.");
  });
});