const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Vault with the account:", deployer.address);

  const AethelredVault = await hre.ethers.getContractFactory("AethelredVault");
  
  console.log("Deploying AethelredVault...");
  // We pass the deployer's address as the `initialOwner`.
  const aethelredVault = await AethelredVault.deploy(deployer.address);

  await aethelredVault.waitForDeployment();

  console.log(`✅ AethelredVault deployed to: ${aethelredVault.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});