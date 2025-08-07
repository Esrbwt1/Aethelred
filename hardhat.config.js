require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "", // Fallback to empty string if not set
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], // Use array syntax, check if key exists
    },
  },
};