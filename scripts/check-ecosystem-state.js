const hre = require("hardhat");

// --- PASTE YOUR FINAL DEPLOYED ADDRESSES HERE ---
const FINAL_CODEX_ADDRESS = "0x4eCCb9eA10B07027c7E9f7C777A632E44f1dd623";
const FINAL_VAULT_ADDRESS = "0x07115a0f5922B6368a6C52b89fD76315ADe37B93";
const UNISWAP_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

async function main() {
  console.log("--- Checking Aethelred Ecosystem State on Sepolia ---");
  const [signer] = await hre.ethers.getSigners();
  
  // 1. Check Codex State
  console.log(`\n[1] Checking Codex at ${FINAL_CODEX_ADDRESS}...`);
  const AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");
  const codex = AethelredCodex.attach(FINAL_CODEX_ADDRESS);
  
  const owner = await codex.owner();
  const whitelistStatus = await codex.isWhitelisted(UNISWAP_ADDRESS);
  console.log(`   - Contract Owner: ${owner}`);
  console.log(`   - Your Address:   ${signer.address}`);
  console.log(`   - Uniswap Whitelisted?: ${whitelistStatus}`);
  if (!whitelistStatus) {
      console.error("   - ❌ ATTENTION: Uniswap is NOT whitelisted on this contract.");
  } else {
      console.log("   - ✅ Whitelist status is correct.");
  }

  // 2. Check Vault State
  console.log(`\n[2] Checking Vault at ${FINAL_VAULT_ADDRESS}...`);
  const AethelredVault = await hre.ethers.getContractFactory("AethelredVault");
  const vault = AethelredVault.attach(FINAL_VAULT_ADDRESS);
  const vaultOwner = await vault.owner();
  const vaultCodex = await vault.codex();
  console.log(`   - Vault Owner: ${vaultOwner}`);
  console.log(`   - Linked Codex Address: ${vaultCodex}`);
  if (vaultCodex.toLowerCase() !== FINAL_CODEX_ADDRESS.toLowerCase()) {
      console.error("   - ❌ ATTENTION: Vault is linked to the WRONG Codex contract.");
  } else {
      console.log("   - ✅ Vault is linked to the correct Codex.");
  }
}

main().catch(console.error);