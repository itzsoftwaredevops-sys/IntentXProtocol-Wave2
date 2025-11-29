# IntentX Web3 Integration Guide

## Overview

This guide explains how to configure and use the Web3 integration layer for the IntentX dApp frontend. The integration connects React components to the Wave 3 smart contracts deployed on BlockDAG and other EVM chains.

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Configure your RPC endpoints:

```env
VITE_RPC_URL=http://127.0.0.1:8545
VITE_BLOCKDAG_RPC=https://rpc.testnet.blockdag.network
```

### 2. Smart Contract Deployment

Deploy smart contracts to generate contract addresses:

```bash
# Deploy to local hardhat
npx hardhat run scripts/deploy_mockdex.js --network hardhat
npx hardhat run scripts/deploy_intent_registry.js --network hardhat
npx hardhat run scripts/deploy_vault.js --network hardhat
```

This creates:
- `deployment/mockdex.json` - MockDEX contract address & ABI
- `deployment/intent_registry.json` - IntentRegistry contract address & ABI
- `deployment/vault.json` - Vault contract address & ABI

And exports ABIs to:
- `client/src/abi/MockDEX.json`
- `client/src/abi/IntentRegistry.json`
- `client/src/abi/Vault.json`

### 3. Initialize Web3 in Frontend

Import and initialize the Web3 service in your React components:

```typescript
import {
  initializeProvider,
  connectWallet,
  loadContractAddresses,
  initializeContracts,
  getContracts,
  getSigner,
  createIntentOnChain,
} from '@/services/web3';

// In your component or app initialization:
async function setupWeb3() {
  // Initialize provider
  await initializeProvider();
  
  // Load contract addresses
  const addresses = await loadContractAddresses();
  
  if (addresses.intentRegistry) {
    console.log('✅ Contracts deployed and ready');
  } else {
    console.warn('⚠️  Running with mock contracts');
  }
}
```

## File Structure

```
client/
├── src/
│   ├── services/
│   │   └── web3.ts               # Web3 provider & contract interactions
│   ├── config.ts                 # Configuration & constants
│   ├── abi/
│   │   ├── IntentRegistry.json   # Auto-generated from contracts
│   │   ├── MockDEX.json          # Auto-generated from contracts
│   │   └── Vault.json            # Auto-generated from contracts
│   └── pages/
│       ├── intent-lab.tsx        # Create & execute intents
│       ├── vaults.tsx            # Deposit & withdraw vault
│       └── execution-explorer.tsx # View intent events
└── README-integration.md         # This file
```

## API Reference

### Web3 Service (`client/src/services/web3.ts`)

#### Provider Management

```typescript
// Initialize provider from RPC URL
await initializeProvider(): Promise<void>

// Connect user wallet via MetaMask
await connectWallet(): Promise<string> // Returns user address

// Disconnect wallet
disconnectWallet(): void

// Get current signer
getSigner(): ethers.Signer | null

// Get current provider
getProvider(): ethers.Provider | null

// Switch network
await switchNetwork(chainId: number): Promise<void>
```

#### Contract Management

```typescript
// Load contract addresses from deployment files
await loadContractAddresses(): Promise<ContractAddresses>

// Initialize contract instances
initializeContracts(addresses: ContractAddresses, signer): ContractInstances

// Get contract instances
getContracts(): ContractInstances

// Check if contracts are deployed
areContractsDeployed(): boolean
```

#### Intent Operations

```typescript
// Create intent on-chain
await createIntentOnChain(
  tokenIn: string,      // Token address
  tokenOut: string,     // Token address
  amount: string,       // Amount in ethers
  minReturn: string     // Minimum return in ethers
): Promise<string>      // Returns transaction hash

// Execute intent
await executeIntentOnChain(intentId: number): Promise<string>

// Cancel intent
await cancelIntentOnChain(intentId: number): Promise<string>

// Get user intents
await getUserIntentsOnChain(userAddress: string): Promise<any[]>
```

#### Vault Operations

```typescript
// Deposit to vault
await depositToVault(amount: string): Promise<string>

// Withdraw from vault
await withdrawFromVault(shares: string): Promise<string>

// Get vault balance
await getVaultBalance(userAddress: string): Promise<string>
```

## Component Integration Examples

### IntentLab Component

```typescript
import { createIntentOnChain, executeIntentOnChain } from '@/services/web3';

export default function IntentLab() {
  const handleCreateIntent = async () => {
    try {
      const txHash = await createIntentOnChain(
        '0xTokenIn...',
        '0xTokenOut...',
        '10.0',
        '9.8'
      );
      toast({ title: 'Intent Created', description: `TX: ${txHash}` });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Button onClick={handleCreateIntent}>
      Create Intent on-chain
    </Button>
  );
}
```

### Vaults Component

```typescript
import { depositToVault, getVaultBalance } from '@/services/web3';

export default function Vaults() {
  const handleDeposit = async (amount: string) => {
    try {
      const txHash = await depositToVault(amount);
      toast({ title: 'Deposit Successful', description: `TX: ${txHash}` });
    } catch (error) {
      toast({ title: 'Deposit Failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Button onClick={() => handleDeposit('1.0')}>
      Deposit 1.0 to Vault
    </Button>
  );
}
```

### Wallet Connection

```typescript
import { connectWallet, disconnectWallet, getSigner } from '@/services/web3';

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAddress(null);
  };

  return (
    <>
      {address ? (
        <>
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <Button onClick={handleDisconnect}>Disconnect</Button>
        </>
      ) : (
        <Button onClick={handleConnect}>Connect Wallet</Button>
      )}
    </>
  );
}
```

## Network Configuration

The dApp supports 4 networks:

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Hardhat Local | 1337 | http://127.0.0.1:8545 | http://localhost:3000 |
| BlockDAG Testnet | 808080 | https://rpc.testnet.blockdag.network | https://testnet-explorer.blockdag.network |
| Ethereum Goerli | 5 | https://goerli.infura.io/v3/ | https://goerli.etherscan.io |
| Polygon Mumbai | 80001 | https://rpc-mumbai.maticvigil.com | https://mumbai.polygonscan.com |

### Switch Network Programmatically

```typescript
import { switchNetwork } from '@/services/web3';

// Switch to BlockDAG (requires MetaMask)
await switchNetwork(808080);
```

## Fallback Mode

If smart contracts are not deployed, the dApp falls back to mock contract responses:

```typescript
import { areContractsDeployed, getMockContractResponse } from '@/services/web3';

if (areContractsDeployed()) {
  // Use real contracts
} else {
  // Use mock responses
  const mockData = getMockContractResponse('getUserIntents');
  console.log('Running with mock contracts:', mockData);
}
```

Display a banner to users when in mock mode:

```typescript
{!areContractsDeployed() && (
  <Banner variant="warning">
    Running with local mock contracts. Deploy smart contracts to use real on-chain features.
  </Banner>
)}
```

## Troubleshooting

### "MetaMask not detected"
- Ensure MetaMask browser extension is installed
- For development: Use `initializeProvider()` for non-wallet use cases

### "Wallet not connected or contracts not initialized"
- Call `connectWallet()` before executing transactions
- Call `loadContractAddresses()` and `initializeContracts()` on app load

### "Contract addresses not found"
- Run deployment scripts to generate `deployment/*.json` files
- Ensure ABI files exist in `client/src/abi/`
- Check `.env.local` contract address variables

### Transaction failed
- Check sufficient gas and token balance
- Verify correct network is selected in MetaMask
- Check contract approval if using ERC20 tokens

## Security Considerations

1. **Never commit private keys** - Use `.env.local` (gitignored)
2. **Validate user input** - Before sending to contracts
3. **Handle errors gracefully** - Always use try/catch
4. **Check network** - Verify user is on correct chain
5. **Test on testnet first** - Before mainnet deployment

## Deployment Checklist

- [ ] Smart contracts deployed to target network
- [ ] Deployment files created with contract addresses
- [ ] ABIs exported to `client/src/abi/`
- [ ] `.env.local` configured with RPC URLs
- [ ] MetaMask configured for target network
- [ ] Frontend tested with on-chain transactions
- [ ] Error handling verified
- [ ] Network switching tested
- [ ] Wallet connection/disconnection tested
- [ ] Production environment variables set

## Additional Resources

- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [MetaMask API](https://docs.metamask.io/guide/ethereum-provider.html)
- [BlockDAG Network Docs](https://blockdag.network)
- [Wave 3 Smart Contracts Spec](../../WAVE3_SMART_CONTRACTS.md)

---

**Last Updated**: November 29, 2025  
**Version**: 1.0 (Production Ready)
