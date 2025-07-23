import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20", // Changed to 0.8.19 to match our contract
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    morphHolesky: {
      url: "https://rpc-quicknode-holesky.morphl2.io",
      chainId: 2810,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    // Add regular Holesky for testing if needed
    holesky: {
      url: "https://ethereum-holesky-rpc.publicnode.com/",
      chainId: 17000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      morphHolesky: "no-api-key-needed", // Morph doesn't require API key
      holesky: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "morphHolesky",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-api-holesky.morphl2.io/api",
          browserURL: "https://explorer-holesky.morphl2.io/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;