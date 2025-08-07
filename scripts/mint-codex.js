const hre = require("hardhat");

async function main() {
  // Define the address of the deployed AethelredCodex contract.
  const CODEX_CONTRACT_ADDRESS = "0x4eCCb9eA10B07027c7E9f7C777A632E44f1dd623"; // <-- YOUR DEPLOYED ADDRESS

  // Get the signer (your account).
  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with contract as account:", signer.address);

  // Get the contract factory and attach it to the deployed address.
  // This creates a local Ethers contract object that represents the deployed contract.
  const AethelredCodex = await hre.ethers.getContractFactory("AethelredCodex");
  const aethelredCodex = AethelredCodex.attach(CODEX_CONTRACT_ADDRESS);

  console.log("Minting your personal Aethelred Codex...");
  
  // Call the mintCodex function.
  // This sends a real transaction to the Sepolia network.
  const tx = await aethelredCodex.connect(signer).mintCodex();

  // Wait for the transaction to be mined and confirmed.
  console.log("Transaction sent. Waiting for confirmation...");
  const receipt = await tx.wait();

  // Log the transaction hash and a success message.
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Successfully minted Token ID #1 to your address.");
  console.log(`View your transaction on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});