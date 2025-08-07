const hre = require("hardhat");
const { ethers } = hre;

// The correct address for the Uniswap V3 SwapRouter02 on Sepolia.
const CORRECT_UNISWAP_ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

// --- The FINAL Codex Address from your diagnostic log ---
const CODEX_CONTRACT_ADDRESS = "0x6777766D0af238D4B9Ed1A542c70346b91416ea4";

async function main() {
  const whitelistedAddress = ethers.getAddress(CORRECT_UNISWAP_ROUTER_ADDRESS);

  const [owner] = await hre.ethers.getSigners();
  console.log("Running admin task with account:", owner.address);
  console.log(`Targeting Codex contract: ${CODEX_CONTRACT_ADDRESS}`);

  const AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");
  const aethelredCodex = AethelredCodex.attach(CODEX_CONTRACT_ADDRESS);

  console.log(`Setting whitelist status for Uniswap Router (${whitelistedAddress}) to TRUE...`);

  const tx = await aethelredCodex.setWhitelistStatus(whitelistedAddress, true);
  
  console.log("Transaction sent. Waiting for confirmation...");
  await tx.wait();

  console.log("Transaction confirmed!");
  console.log("✅ Admin task completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});