import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    peaq: {
      url: process.env.PEAQ_RPC_URL || "https://evm-rpc.peaq.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 3338,
    },
    peaqTestnet: {
      url: process.env.PEAQ_TESTNET_RPC || "https://evm-rpc-testnet.peaq.network",
      accounts: process.env.TEST_PRIVATE_KEY ? [process.env.TEST_PRIVATE_KEY] : [],
      chainId: 3339,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      peaq: process.env.PEAQSCAN_API_KEY || "abc",
      peaqTestnet: process.env.PEAQSCAN_API_KEY || "abc",
    },
    customChains: [
      {
        network: "peaq",
        chainId: 3338,
        urls: {
          apiURL: "https://peaqscan.io/api",
          browserURL: "https://peaqscan.io",
        },
      },
      {
        network: "peaqTestnet",
        chainId: 3339,
        urls: {
          apiURL: "https://testnet.peaqscan.io/api",
          browserURL: "https://testnet.peaqscan.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};

export default config;