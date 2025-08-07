const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AEToken with the account:", deployer.address);

  const AEToken = await hre.ethers.getContractFactory("AEToken");
  
  console.log("Deploying AEToken...");
  // The constructor requires the `initialOwner` address. We pass the deployer's.
  const aeToken = await AEToken.deploy(deployer.address);

  await aeToken.waitForDeployment();

  console.log(`✅ AEToken ($AED) deployed to: ${aeToken.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});