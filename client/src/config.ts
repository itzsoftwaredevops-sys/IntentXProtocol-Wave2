// Configuration for IntentX dApp

export const CONFIG = {
  // Network settings
  DEFAULT_NETWORK: 'blockdag',
  NETWORKS: {
    hardhat: {
      chainId: 1337,
      name: 'Hardhat Local',
      rpc: 'http://127.0.0.1:8545',
      explorer: 'http://localhost:3000',
    },
    blockdag: {
      chainId: 808080,
      name: 'BlockDAG Testnet',
      rpc: import.meta.env.VITE_BLOCKDAG_RPC || 'https://rpc.testnet.blockdag.network',
      explorer: 'https://testnet-explorer.blockdag.network',
    },
    goerli: {
      chainId: 5,
      name: 'Ethereum Goerli',
      rpc: import.meta.env.VITE_GOERLI_RPC || 'https://goerli.infura.io/v3/',
      explorer: 'https://goerli.etherscan.io',
    },
    mumbai: {
      chainId: 80001,
      name: 'Polygon Mumbai',
      rpc: import.meta.env.VITE_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
      explorer: 'https://mumbai.polygonscan.com',
    },
  },

  // Contract addresses (loaded from deployment files)
  CONTRACTS: {
    INTENT_REGISTRY: import.meta.env.VITE_INTENT_REGISTRY_ADDRESS || '',
    MOCK_DEX: import.meta.env.VITE_MOCK_DEX_ADDRESS || '',
    VAULT: import.meta.env.VITE_VAULT_ADDRESS || '',
  },

  // API endpoints
  API: {
    PARSE_INTENT: '/api/intent/parse',
    EXECUTE_INTENT: '/api/intent/execute',
    CANCEL_INTENT: '/api/intent/cancel',
    GET_INTENTS: '/api/intent/list',
    GET_ANALYTICS: '/api/analytics',
  },

  // UI settings
  UI: {
    TOAST_DURATION: 3000,
    LOADING_TIMEOUT: 30000,
    CONFIRMATION_BLOCKS: 1,
  },

  // Feature flags
  FEATURES: {
    ENABLE_BLOCKCHAIN: true,
    ENABLE_MOCK_CONTRACTS: true, // Fallback to mocks if contracts not deployed
    ENABLE_BATCH_PROCESSING: true,
    ENABLE_AA_GASLESS: true,
  },
};

// Export for use in components
export default CONFIG;
