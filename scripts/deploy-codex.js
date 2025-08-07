// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // 1. Get the deployer's address
  // Hardhat provides an array of signers, the first one is the deployer by default.
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. Get the Contract Factory for AethelredCodex
  // A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts.
  const AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");

  // 3. Deploy the contract
  // We pass the deployer's address as the `initialOwner` for the constructor.
  console.log("Deploying AethelredCodex...");
  const aethelredCodex = await AethelredCodex.deploy(deployer.address);

  // 4. Wait for the deployment to be confirmed
  await aethelredCodex.waitForDeployment();

  // 5. Log the contract's address
  // This address is the unique identifier for our deployed contract on the blockchain.
  // We will need this address to interact with the contract later.
  console.log(`AethelredCodex deployed to: ${aethelredCodex.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});