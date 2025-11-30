import { ethers } from 'ethers';

// Minimal ABIs for contract interaction
const IntentRegistryABI = [
  "function createIntent(address tokenIn, address tokenOut, uint256 amount, uint256 minReturn) public returns (uint256)",
  "function executeIntent(uint256 intentId) public returns (uint256)",
  "function cancelIntent(uint256 intentId) public",
  "function getIntent(uint256 intentId) public view returns (tuple(uint256 id, address owner, address tokenIn, address tokenOut, uint256 amount, uint256 minReturn, uint256 status))",
  "function getUserIntents(address user) public view returns (uint256[])",
  "event IntentCreated(uint256 indexed intentId, address indexed owner, address tokenIn, address tokenOut, uint256 amount, uint256 minReturn)",
  "event IntentExecuted(uint256 indexed intentId, address indexed owner, uint256 outputAmount, uint256 gasUsed)",
];

const MockDEXABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) public returns (uint256)",
  "function getSwapAmount(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) public",
  "event Swapped(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
];

const VaultABI = [
  "function deposit(uint256 amount) public returns (uint256 shares)",
  "function withdraw(uint256 shares) public returns (uint256 amount)",
  "function totalAssets() public view returns (uint256)",
  "function balanceOf(address user) public view returns (uint256)",
  "function getAPY() public view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 shares, uint256 amount)",
];

// Types
export interface ContractAddresses {
  intentRegistry?: string;
  mockDEX?: string;
  vault?: string;
}

export interface ContractInstances {
  intentRegistry?: ethers.Contract;
  mockDEX?: ethers.Contract;
  vault?: ethers.Contract;
}

// Network configurations
export const NETWORKS = {
  hardhat: { chainId: 1337, name: 'Hardhat', rpc: 'http://127.0.0.1:8545' },
  blockdag: { chainId: 808080, name: 'BlockDAG Testnet', rpc: import.meta.env.VITE_BLOCKDAG_RPC || 'https://rpc.testnet.blockdag.network' },
  goerli: { chainId: 5, name: 'Ethereum Goerli', rpc: import.meta.env.VITE_GOERLI_RPC || 'https://goerli.infura.io/v3/YOUR_KEY' },
  mumbai: { chainId: 80001, name: 'Polygon Mumbai', rpc: import.meta.env.VITE_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com' },
};

// Web3 Service
let provider: ethers.Provider | null = null;
let signer: ethers.Signer | null = null;
let contractAddresses: ContractAddresses = {};
let contracts: ContractInstances = {};
let currentChainId: number | null = null;

/**
 * Initialize Web3 provider from environment
 */
export async function initializeProvider(): Promise<void> {
  try {
    const rpcUrl = import.meta.env.VITE_RPC_URL || NETWORKS.hardhat.rpc;
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify connection
    const network = await provider.getNetwork();
    currentChainId = Number(network.chainId);
    
    console.log(`✅ Provider initialized on chain ${network.name} (${currentChainId})`);
  } catch (error) {
    console.error('Failed to initialize provider:', error);
    throw error;
  }
}

/**
 * Connect wallet via MetaMask
 */
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask.');
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];

    // Create signer from MetaMask
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await browserProvider.getSigner();
    provider = browserProvider;

    // Listen for chain changes
    window.ethereum.on('chainChanged', () => window.location.reload());

    console.log(`✅ Connected wallet: ${userAddress}`);
    return userAddress;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  signer = null;
  console.log('✅ Disconnected wallet');
}

/**
 * Get current signer
 */
export function getSigner(): ethers.Signer | null {
  return signer;
}

/**
 * Get current provider
 */
export function getProvider(): ethers.Provider | null {
  return provider;
}

/**
 * Switch network
 */
export async function switchNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    console.log(`✅ Switched to chain ${chainId}`);
  } catch (error: any) {
    if (error.code === 4902) {
      console.error('Chain not found in MetaMask');
    }
    throw error;
  }
}

/**
 * Load contract addresses from deployment files
 */
export async function loadContractAddresses(): Promise<ContractAddresses> {
  try {
    // Try to load from deployment directory
    const intentRegistryData = await fetch('/deployment/intent_registry.json').then(r => r.json()).catch(() => null);
    const mockDexData = await fetch('/deployment/mockdex.json').then(r => r.json()).catch(() => null);
    const vaultData = await fetch('/deployment/vault.json').then(r => r.json()).catch(() => null);

    contractAddresses = {
      intentRegistry: intentRegistryData?.address,
      mockDEX: mockDexData?.address,
      vault: vaultData?.address,
    };

    console.log('✅ Loaded contract addresses:', contractAddresses);
    return contractAddresses;
  } catch (error) {
    console.warn('Could not load contract addresses from deployment files:', error);
    return {};
  }
}

/**
 * Initialize contract instances
 */
export function initializeContracts(addresses: ContractAddresses, signerOrProvider: ethers.Signer | ethers.Provider): ContractInstances {
  if (addresses.intentRegistry) {
    contracts.intentRegistry = new ethers.Contract(
      addresses.intentRegistry,
      IntentRegistryABI,
      signerOrProvider
    );
  }

  if (addresses.mockDEX) {
    contracts.mockDEX = new ethers.Contract(
      addresses.mockDEX,
      MockDEXABI,
      signerOrProvider
    );
  }

  if (addresses.vault) {
    contracts.vault = new ethers.Contract(
      addresses.vault,
      VaultABI,
      signerOrProvider
    );
  }

  console.log('✅ Initialized contracts:', Object.keys(contracts).filter(k => contracts[k as keyof ContractInstances]));
  return contracts;
}

/**
 * Get contract instances
 */
export function getContracts(): ContractInstances {
  return contracts;
}

/**
 * Create intent on-chain
 */
export async function createIntentOnChain(
  tokenIn: string,
  tokenOut: string,
  amount: string,
  minReturn: string
): Promise<string> {
  if (!signer || !contracts.intentRegistry) {
    throw new Error('Wallet not connected or contracts not initialized');
  }

  const tx = await contracts.intentRegistry.createIntent(
    tokenIn,
    tokenOut,
    ethers.parseEther(amount),
    ethers.parseEther(minReturn)
  );

  const receipt = await tx.wait();
  console.log('✅ Intent created:', receipt?.hash);
  return receipt?.hash || '';
}

/**
 * Execute intent on-chain
 */
export async function executeIntentOnChain(intentId: number): Promise<string> {
  if (!signer || !contracts.intentRegistry) {
    throw new Error('Wallet not connected or contracts not initialized');
  }

  const tx = await contracts.intentRegistry.executeIntent(intentId);
  const receipt = await tx.wait();
  console.log('✅ Intent executed:', receipt?.hash);
  return receipt?.hash || '';
}

/**
 * Cancel intent on-chain
 */
export async function cancelIntentOnChain(intentId: number): Promise<string> {
  if (!signer || !contracts.intentRegistry) {
    throw new Error('Wallet not connected or contracts not initialized');
  }

  const tx = await contracts.intentRegistry.cancelIntent(intentId);
  const receipt = await tx.wait();
  console.log('✅ Intent cancelled:', receipt?.hash);
  return receipt?.hash || '';
}

/**
 * Get user intents from chain
 */
export async function getUserIntentsOnChain(userAddress: string): Promise<any[]> {
  if (!provider || !contracts.intentRegistry) {
    throw new Error('Provider not initialized or contracts not loaded');
  }

  const intents = await contracts.intentRegistry.getUserIntents(userAddress);
  return intents;
}

/**
 * Deposit to vault
 */
export async function depositToVault(amount: string): Promise<string> {
  if (!signer || !contracts.vault) {
    throw new Error('Wallet not connected or vault not initialized');
  }

  const tx = await contracts.vault.deposit(ethers.parseEther(amount));
  const receipt = await tx.wait();
  console.log('✅ Deposit successful:', receipt?.hash);
  return receipt?.hash || '';
}

/**
 * Withdraw from vault
 */
export async function withdrawFromVault(shares: string): Promise<string> {
  if (!signer || !contracts.vault) {
    throw new Error('Wallet not connected or vault not initialized');
  }

  const tx = await contracts.vault.withdraw(ethers.parseEther(shares));
  const receipt = await tx.wait();
  console.log('✅ Withdrawal successful:', receipt?.hash);
  return receipt?.hash || '';
}

/**
 * Get vault balance
 */
export async function getVaultBalance(userAddress: string): Promise<string> {
  if (!provider || !contracts.vault) {
    throw new Error('Provider not initialized or vault not loaded');
  }

  const shares = await contracts.vault.getUserShares(userAddress);
  return ethers.formatEther(shares);
}

/**
 * Check if contracts are deployed
 */
export function areContractsDeployed(): boolean {
  return !!(contractAddresses.intentRegistry && contractAddresses.mockDEX && contractAddresses.vault);
}

/**
 * Get mock contract responses (fallback)
 */
export function getMockContractResponse(action: string): any {
  const mocks: Record<string, any> = {
    createIntent: { id: 1, owner: '0x...', status: 'PENDING' },
    executeIntent: { hash: '0x' + Math.random().toString(16).slice(2) },
    getUserIntents: [
      { id: 1, tokenIn: '0xToken1', tokenOut: '0xToken2', amount: '1.0', status: 'EXECUTED' },
      { id: 2, tokenIn: '0xToken2', tokenOut: '0xToken3', amount: '2.0', status: 'PENDING' },
    ],
    getVaultBalance: '5.25',
  };

  return mocks[action] || null;
}
