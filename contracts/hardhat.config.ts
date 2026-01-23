import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


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
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    peaq: {
      url: process.env.PEAQ_RPC_URL || "https://quicknode1.peaq.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 3338,
    }as any,
    peaqTestnet: {
      url: process.env.PEAQ_TESTNET_RPC || "https://wss-async-agung.peaq.xyz",
      accounts: process.env.TEST_PRIVATE_KEY ? [process.env.TEST_PRIVATE_KEY] : [],
      chainId: 9990,
    }as any,
    hardhat: {
      chainId: 31337,
    }as any,
  },
  // etherscan: {
  //   apiKey: {
  //     peaq: process.env.PEAQSCAN_API_KEY || "abc",
  //   },
  // },
};

export default config;