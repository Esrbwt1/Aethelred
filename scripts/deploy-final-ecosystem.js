const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying final ecosystem with account:", deployer.address);

  // 1. Deploy the Codex
  const AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");
  const codex = await AethelredCodex.deploy(deployer.address);
  await codex.waitForDeployment();
  console.log(`✅ AethelredCodex deployed to: ${codex.target}`);

  // 2. Deploy the Vault, passing the Codex address to its constructor
  const AethelredVault = await hre.ethers.getContractFactory("AethelredVault");
  const vault = await AethelredVault.deploy(deployer.address, codex.target);
  await vault.waitForDeployment();
  console.log(`✅ AethelredVault deployed to: ${vault.target}`);

  console.log("\n--- Ecosystem Deployment Complete ---");
}

main().catch((error) => console.error(error));