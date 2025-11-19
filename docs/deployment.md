# IntentX Deployment Guide

This guide covers deploying IntentX smart contracts to BlockDAG Testnet and other supported networks.

## Prerequisites

- Node.js 20.19.3+ (Node 22+ required for Hardhat tests)
- npm or yarn
- Hardhat CLI
- Deployer wallet with test ETH/BDAG

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Session secret for Express
SESSION_SECRET=your_random_session_secret_here

# Network RPC URLs
BLOCKDAG_RPC_URL=https://rpc.blockdag-testnet.example
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Deployer private key (DO NOT COMMIT THIS)
PRIVATE_KEY=0xyour_private_key_here
```

**Security Note**: Never commit `.env` files to version control. Add `.env` to `.gitignore`.

## Smart Contract Deployment

### BlockDAG Testnet (Primary)

#### 1. Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 7 Solidity files successfully
```

#### 2. Run Tests (Optional - Requires Node 22+)

```bash
npx hardhat test
```

Expected output:
```
  IntentRegistry
    ✓ Should register a new intent successfully
    ✓ Should store intent data correctly
    ... (48 tests total)

  48 passing (2.5s)
```

#### 3. Deploy to BlockDAG Testnet

```bash
npx hardhat run scripts/deploy.ts --network blockdag
```

Expected output:
```
Deploying IntentX DeFi Protocol...
IntentRegistry deployed to: 0x1234...
MockRouter deployed to: 0x5678...
ExecutionManager deployed to: 0x9abc...
LendingPoolMock deployed to: 0xdef0...
Mock USDC deployed to: 0x1111...
Mock WETH deployed to: 0x2222...
StakingVault deployed to: 0x3333...
USDC/WETH Pair created at: 0x4444...

Deployment Summary:
-------------------
IntentRegistry: 0x1234...
ExecutionManager: 0x9abc...
MockRouter: 0x5678...
LendingPoolMock: 0xdef0...
StakingVault: 0x3333...
Mock USDC: 0x1111...
Mock WETH: 0x2222...
USDC/WETH Pair: 0x4444...
```

#### 4. Save Contract Addresses

Create `deployed-contracts.json`:

```json
{
  "blockdag": {
    "chainId": 808080,
    "contracts": {
      "IntentRegistry": "0x1234...",
      "ExecutionManager": "0x9abc...",
      "MockRouter": "0x5678...",
      "LendingPoolMock": "0xdef0...",
      "StakingVault": "0x3333...",
      "MockUSDC": "0x1111...",
      "MockWETH": "0x2222...",
      "USDCWETHPair": "0x4444..."
    }
  }
}
```

### Ethereum Goerli (Testing)

```bash
npx hardhat run scripts/deploy.ts --network goerli
```

### Polygon Mumbai (Testing)

```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

### Local Hardhat Network (Development)

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

## Contract Verification

### BlockDAG Explorer

1. Visit BlockDAG block explorer: https://explorer.blockdag-testnet.example
2. Navigate to contract address
3. Click "Verify Contract"
4. Upload source code and constructor arguments
5. Submit verification

### Etherscan (Goerli)

```bash
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS "Constructor Arg 1" "Constructor Arg 2"
```

Example:
```bash
npx hardhat verify --network goerli 0x1234... 0x5678... 0x9abc...
```

## Frontend Deployment

### Replit Deployment

The project is pre-configured for Replit deployment:

1. **Connect to Replit**
   - Import project from GitHub
   - Replit auto-detects Node.js setup

2. **Configure Secrets**
   - Add `SESSION_SECRET` in Replit Secrets tab
   - Add RPC URLs and `PRIVATE_KEY` if deploying contracts

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Dev URL: `https://your-repl-name.replit.dev`
   - Production URL: `https://your-repl-name.replit.app`

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
```bash
vercel env add SESSION_SECRET
vercel env add BLOCKDAG_RPC_URL
```

4. **Deploy to Production**
```bash
vercel --prod
```

### Custom VPS Deployment

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone Repository**
```bash
git clone https://github.com/your-username/intentx-defi.git
cd intentx-defi
```

3. **Install Dependencies**
```bash
npm install
```

4. **Build Frontend**
```bash
npm run build
```

5. **Start Server with PM2**
```bash
npm install -g pm2
pm2 start npm --name "intentx" -- run dev
pm2 save
pm2 startup
```

6. **Configure Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Configuration

### 1. Update Frontend Contract Addresses

Edit `client/src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  blockdag: {
    intentRegistry: "0x1234...",
    executionManager: "0x9abc...",
    mockRouter: "0x5678...",
    // ... other addresses
  },
  goerli: {
    // Goerli addresses
  },
  // ... other networks
};
```

### 2. Initialize Mock Liquidity

For DEX functionality, add initial liquidity to pairs:

```bash
npx hardhat run scripts/add-liquidity.ts --network blockdag
```

### 3. Fund StakingVault with Rewards

Transfer reward tokens to StakingVault:

```bash
npx hardhat run scripts/fund-staking.ts --network blockdag
```

### 4. Test Deployment

```bash
# Parse an intent
curl -X POST https://your-app.replit.app/api/intent/parse \
  -H "Content-Type: application/json" \
  -d '{"naturalLanguage": "Swap 100 USDC for WETH"}'

# Expected response:
# {
#   "success": true,
#   "intentId": "abc123...",
#   "steps": [...]
# }
```

## Monitoring & Maintenance

### Contract Events

Monitor on-chain events using Hardhat:

```javascript
const registry = await ethers.getContractAt("IntentRegistry", registryAddress);

registry.on("IntentRegistered", (intentId, user, naturalLanguage) => {
  console.log(`New intent: ${intentId} from ${user}`);
});
```

### Health Checks

```bash
# Check frontend
curl https://your-app.replit.app/

# Check API
curl https://your-app.replit.app/api/vaults
```

### Logs

```bash
# View PM2 logs
pm2 logs intentx

# View Replit logs
# Available in Replit Shell tab
```

## Troubleshooting

### Issue: Contract Compilation Fails

**Error**: `Class extends value undefined`

**Solution**: Upgrade to Node 22+ or comment out `@nomicfoundation/hardhat-toolbox` import

### Issue: Deployment Transaction Fails

**Error**: `insufficient funds for gas * price + value`

**Solution**: Fund deployer wallet with test ETH/BDAG

### Issue: Frontend Can't Connect to Contracts

**Error**: `Contract address not found`

**Solution**: Update contract addresses in `client/src/lib/contracts.ts`

### Issue: CORS Errors

**Error**: `Access-Control-Allow-Origin header missing`

**Solution**: Already handled by Express CORS middleware. Check network configuration.

## Gas Optimization

### Estimated Gas Costs

| Operation | Estimated Gas | Cost (at 50 gwei) |
|-----------|---------------|-------------------|
| Register Intent | 150,000 | $0.01 |
| Execute Swap | 200,000 | $0.015 |
| Stake Tokens | 120,000 | $0.009 |
| Supply to Lending | 180,000 | $0.013 |

### Optimization Tips

1. **Batch Intents**: Combine multiple operations into single intent
2. **Off-Peak Times**: Execute during low network activity
3. **Gas Price Monitoring**: Use services like GasNow or Etherscan Gas Tracker
4. **Approve Once**: Set max approval to avoid repeated approve transactions

## Security Checklist

- [ ] Private keys stored securely (never committed)
- [ ] Environment variables configured correctly
- [ ] Contracts verified on block explorer
- [ ] Test transactions executed successfully
- [ ] Frontend connects to correct contract addresses
- [ ] Network configurations match deployment targets
- [ ] Monitoring and alerting set up
- [ ] Backup of deployment artifacts saved

## Next Steps

1. **Verify Contracts**: Submit source code to BlockDAG explorer
2. **Add Liquidity**: Initialize DEX pairs with realistic reserves
3. **Test E2E**: Run full user journey from frontend
4. **Monitor**: Set up alerts for contract events
5. **Iterate**: Gather user feedback and improve

## Support

For deployment issues:
- **GitHub Issues**: https://github.com/your-username/intentx-defi/issues
- **Discord**: Join our server for live support
- **Email**: support@intentx.io

---

**Last Updated**: November 19, 2025  
**Version**: 1.0.0
