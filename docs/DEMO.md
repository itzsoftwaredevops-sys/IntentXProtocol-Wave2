# IntentX Interactive Demo

This guide walks through all key features of IntentX with step-by-step instructions.

## Getting Started

### Access the Live Demo

**URL**: https://intentx-defi.replit.app

The demo is fully functional with mock data, allowing you to experience the complete user journey without connecting a real wallet or spending real funds.

## Feature Walkthrough

### 1. Dashboard Overview

**Location**: Homepage (`/`)

#### What You'll See

- **4 Stats Cards**
  - Total Value: $124,567.89
  - Active Intents: 23
  - Total Volume: $2,456,789.12
  - Success Rate: 98.5%

- **Recent Transaction Feed**
  - 8 recent transactions with status indicators
  - Each showing: Type, Amount, Network, Time, Transaction hash link

#### Try It

1. Click on any transaction hash (blue link)
2. Notice it opens the correct block explorer for that network:
   - BlockDAG transactions → BlockDAG explorer
   - Ethereum transactions → Etherscan
   - Polygon transactions → Polygonscan

**Key Feature**: Network-aware explorer links demonstrate multi-chain support

---

### 2. Intent Lab - Natural Language DeFi

**Location**: Intent Lab page (`/intent-lab`)

This is the core innovation of IntentX - expressing DeFi operations in plain English.

#### Example Intent 1: Token Swap

**Step 1: Enter Intent**
```
Swap 100 USDC for WETH on Uniswap
```

**Step 2: Click "Parse Intent"**
- Wait 1 second (simulated parsing)
- See parsed steps appear:
  ```
  Step 1: Swap
  Protocol: Uniswap V2
  Token In: USDC (100.00)
  Token Out: WETH
  Estimated Gas: 150,000
  
  Total Gas Estimate: 150,000 (0.005 ETH)
  ```

**Step 3: Click "Execute Intent"**
- Watch loading state (1.5 seconds)
- See success message with:
  - Transaction hash
  - Explorer link (network-specific)
  - Status: Completed

**Total Time**: ~2.5 seconds (perceived execution)

#### Example Intent 2: Staking

**Step 1: Enter Intent**
```
Stake 50 ETH in Lido
```

**Step 2: Parse**
- See parsed step:
  ```
  Step 1: Stake
  Protocol: Lido
  Token In: ETH (50.00)
  Estimated Gas: 120,000
  ```

**Step 3: Execute**
- Instant optimistic update
- Transaction confirmed

#### Example Intent 3: Multi-Step

**Step 1: Enter Intent**
```
Supply 5000 USDC to Aave and borrow 2 ETH
```

**Step 2: Parse**
- See 2 parsed steps:
  ```
  Step 1: Supply
  Protocol: Aave
  Token In: USDC (5000.00)
  Estimated Gas: 180,000
  
  Step 2: Borrow
  Protocol: Aave
  Token Out: ETH (2.00)
  Estimated Gas: 200,000
  
  Total Gas Estimate: 380,000 (0.012 ETH)
  ```

**Step 3: Execute**
- Both steps executed sequentially
- Total confirmation time: ~2.5 seconds

#### Try These Variations

```
Trade 1000 DAI to USDC
Exchange 0.5 ETH for USDT on Sushiswap
Deposit 10000 USDC to Compound
Withdraw 5 ETH from Aave
Borrow 1000 USDC from Compound
```

**Key Features Demonstrated**:
- Natural language parsing
- Multi-protocol support
- Gas estimation
- Multi-step execution
- Optimistic UI

---

### 3. Vaults - Staking & Yield Farming

**Location**: Vaults page (`/vaults`)

#### Available Vaults (6 total)

1. **ETH Staking - Lido** (5.2% APY)
   - TVL: $8,456,789
   - Your Staked: 12.5 ETH

2. **USDC Lending - Aave** (8.5% APY)
   - TVL: $12,345,678
   - Your Staked: 5,000 USDC

3. **WETH Staking - Uniswap** (12.3% APY)
   - TVL: $6,789,012
   - Your Staked: 8.3 WETH

4. **DAI Lending - Compound** (7.8% APY)
   - TVL: $9,876,543
   - Your Staked: 3,200 DAI

5. **stETH Staking - Lido** (6.4% APY)
   - TVL: $5,432,109
   - Your Staked: 6.7 stETH

6. **USDT Lending - Aave** (18.5% APY)
   - TVL: $15,678,901
   - Your Staked: 8,500 USDT

#### Try: Staking Tokens

**Step 1: Select Vault**
- Click on any vault card (e.g., "ETH Staking - Lido")
- Modal opens with vault details

**Step 2: Enter Amount**
- Type amount to stake (e.g., `10`)
- See APY calculation update

**Step 3: Click "Stake"**
- Watch loading state
- See success message
- Notice "Your Staked" balance updates

**Step 4: View Transaction**
- Click transaction hash
- Opens BlockDAG explorer

#### Try: Unstaking

**Step 1: Switch to Unstake Tab**
- Click "Unstake" button in vault modal

**Step 2: Enter Amount**
- Type amount to unstake (e.g., `5`)
- Must be ≤ your staked balance

**Step 3: Click "Unstake"**
- Instant optimistic update
- Balance decreases

**Key Features**:
- Real-time APY calculations
- Optimistic balance updates
- Transaction confirmation with explorer links

---

### 4. Analytics - Performance Metrics

**Location**: Analytics page (`/analytics`)

#### Charts & Metrics

1. **Portfolio Value Over Time**
   - Line chart showing 7-day portfolio growth
   - Mock data: $100K → $124.5K

2. **Protocol Distribution**
   - Pie chart showing allocation:
     - Uniswap: 45% ($56,055)
     - Aave: 30% ($37,370)
     - Lido: 25% ($31,142)

3. **Transaction Volume**
   - Bar chart showing daily volume
   - Past 7 days with hover tooltips

4. **Detailed Metrics Grid**
   ```
   Total Value Locked    $45.2M
   24h Volume            $12.8M
   Active Users          15,234
   Total Transactions    892,456
   Success Rate          98.5%
   Average Gas           0.005 ETH
   Protocols Integrated  12
   Networks Supported    4
   ```

#### Try It

- Hover over charts to see tooltips
- Notice responsive design on mobile
- Check how data updates reflect recent actions

**Key Features**:
- Visual data representation
- Real-time metrics
- Multi-protocol aggregation

---

### 5. FAQ - Self-Service Help

**Location**: FAQ page (`/faq`)

#### Topics Covered (8 Q&A entries)

1. **What is IntentX?**
   - Overview of intent-based DeFi aggregation

2. **How does it work?**
   - Technical explanation of parsing → optimization → execution

3. **Which blockchain networks are supported?**
   - BlockDAG, Ethereum, Polygon, Hardhat

4. **Is IntentX secure?**
   - Security measures and audits

5. **What fees does IntentX charge?**
   - Fee structure and gas costs

6. **How does gas optimization work?**
   - Batching, routing, and off-peak execution

7. **What happens if my intent fails?**
   - Error handling and refund policy

8. **Can I execute multi-step intents?**
   - Complex operation examples

#### Try It

- Click any question to expand answer
- Click again to collapse
- Notice smooth accordion animations

**Key Feature**: Comprehensive self-service support

---

### 6. Multi-Chain Network Switching

**Location**: Any page (top navigation)

#### Try It

**Step 1: Click Network Selector**
- Current network shown with indicator (e.g., "BlockDAG Testnet")

**Step 2: Select Different Network**
- Choose from:
  - BlockDAG Testnet (808080)
  - Ethereum Goerli (5)
  - Polygon Mumbai (80001)
  - Hardhat Local (1337)

**Step 3: Notice Changes**
- Network indicator updates
- All transaction links now point to new network's explorer
- Dashboard stats reflect new network

**Key Feature**: Seamless multi-chain experience

---

### 7. Dark Mode Toggle

**Location**: Any page (top-right navigation)

#### Try It

1. Click sun/moon icon in top-right
2. Watch entire UI smoothly transition
3. Notice localStorage saves preference
4. Refresh page - preference persists

**Key Feature**: SSR-safe theme persistence

---

## Advanced Usage Scenarios

### Scenario 1: Building a DeFi Position

**Goal**: Create leveraged yield farming position

**Steps**:
1. Go to Intent Lab
2. Enter: `Supply 10000 USDC to Aave`
3. Parse → Execute
4. Enter: `Borrow 5 ETH from Aave`
5. Parse → Execute
6. Enter: `Stake 5 ETH in Lido`
7. Parse → Execute
8. Go to Vaults to see updated balances
9. Check Analytics for position overview

**Result**: 3-step DeFi strategy executed in ~7 seconds

### Scenario 2: Portfolio Rebalancing

**Goal**: Shift allocation from ETH to stablecoins

**Steps**:
1. Go to Vaults
2. Unstake ETH from Lido vault
3. Go to Intent Lab
4. Enter: `Swap 10 ETH for USDC on Uniswap`
5. Execute swap
6. Go to Vaults
7. Stake USDC in Aave lending vault
8. Check Analytics to see new distribution

**Result**: Complete rebalancing in ~10 seconds

### Scenario 3: Cross-Protocol Yield Farming

**Goal**: Maximize yields across multiple protocols

**Steps**:
1. Check Vaults for highest APY (USDT Lending - 18.5%)
2. Go to Intent Lab
3. Enter: `Swap 5000 USDC for USDT`
4. Execute
5. Go to Vaults
6. Stake USDT in Aave vault
7. Monitor Analytics for performance

**Result**: Yield optimized via smart protocol selection

---

## Testing Checklist

Use this checklist to verify all features work correctly:

### Dashboard
- [ ] 4 stats cards display correctly
- [ ] Recent transactions show 8 entries
- [ ] Transaction hashes link to correct explorers
- [ ] Network selector shows active network

### Intent Lab
- [ ] Natural language input accepts text
- [ ] Parse button shows loading state
- [ ] Parsed steps display with gas estimates
- [ ] Execute button triggers confirmation
- [ ] Transaction hash appears
- [ ] Explorer link opens correct network

### Vaults
- [ ] 6 vaults display with APY, TVL, balances
- [ ] Stake modal opens on vault click
- [ ] Stake action updates balance
- [ ] Unstake action decreases balance
- [ ] Transaction confirmation shows

### Analytics
- [ ] Portfolio chart renders
- [ ] Protocol distribution pie chart shows
- [ ] Transaction volume bar chart displays
- [ ] Metrics grid shows all 8 values

### FAQ
- [ ] 8 Q&A entries present
- [ ] Accordion expands/collapses smoothly
- [ ] Content is readable and helpful

### Multi-Chain
- [ ] Network selector shows 4 networks
- [ ] Switching networks updates indicator
- [ ] Explorer links update to match network

### Dark Mode
- [ ] Toggle switches theme
- [ ] Preference persists on refresh
- [ ] All pages respect theme

---

## Performance Metrics

### Load Times
- **Dashboard**: < 1 second
- **Intent Lab**: < 1 second
- **Vaults**: < 1.5 seconds (6 cards)
- **Analytics**: < 2 seconds (charts + data)

### Interaction Times
- **Parse Intent**: 1 second (simulated)
- **Execute Intent**: 1.5 seconds (simulated)
- **Stake Action**: < 1 second (optimistic)
- **Network Switch**: < 0.5 seconds

### Total User Journey
**From landing to completed intent**: ~5-7 seconds

---

## Known Limitations (Demo Mode)

1. **Wallet Connection**: Mock only (no real MetaMask integration yet)
2. **Transactions**: Simulated (no real blockchain interaction)
3. **Balances**: Mock data (not tied to real wallet)
4. **Gas Estimates**: Approximated (not real-time network data)

**Note**: All features are ready for production integration with Web3 providers.

---

## Next Steps

After exploring the demo:

1. **Read Documentation**
   - [README.md](../README.md) for overview
   - [deployment.md](deployment.md) for setup instructions
   - [WAVE2.md](WAVE2.md) for technical details

2. **Try Development Mode**
   ```bash
   git clone https://github.com/your-username/intentx-defi.git
   npm install
   npm run dev
   ```

3. **Deploy Your Own Instance**
   - Follow [deployment.md](deployment.md) guide
   - Configure with your RPC URLs
   - Deploy contracts to testnet

4. **Contribute**
   - Report bugs: GitHub Issues
   - Suggest features: Discord
   - Submit PRs: Follow contribution guidelines

---

**Questions or Issues?**

- **Discord**: [Join our server](https://discord.gg/intentx)
- **Email**: support@intentx.io
- **Twitter**: [@IntentX_DeFi](https://twitter.com/IntentX_DeFi)

---

**Happy Exploring! 🚀**
