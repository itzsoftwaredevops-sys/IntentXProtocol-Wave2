import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      metadata: {
        bytecodeHash: "ipfs",
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    blockdag: {
      url: process.env.BLOCKDAG_RPC_URL || "https://rpc.testnet.blockdag.network",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ["0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 808080,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/YOUR_KEY",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ["0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 5,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ["0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 80001,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
  },
};

export default config;
