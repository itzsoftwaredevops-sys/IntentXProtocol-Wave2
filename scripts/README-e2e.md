# IntentX E2E Test Suite

## Overview

The E2E (End-to-End) test suite exercises the complete IntentX pipeline locally:

1. **Smart Contract Deployment** - Deploy IntentRegistry, MockDEX, and Vault to Hardhat
2. **Backend Startup** - Start Express server with mock contracts
3. **API Testing** - Parse intents, query assistant, interact with vaults
4. **Event Logging** - Verify parsed intents are logged
5. **Results Report** - Generate comprehensive test summary JSON

## Prerequisites

- Node.js 20+ with npm
- All dependencies installed: `npm install`
- Hardhat configured with Solidity 0.8.21

## Quick Start

### Run Full E2E Test Suite

```bash
npm run e2e
```

This will:
1. Start a local Hardhat node
2. Deploy all smart contracts
3. Start the backend server
4. Run integration tests against `/api/intent/parse`, `/api/assistant/query`, etc.
5. Generate `WAVE3_E2E_SUMMARY.json` with results

### Expected Output

```
[E2E] 🚀 Starting IntentX E2E Test Suite
[DEPLOY] ✅ All contracts deployed
[TEST] ✅ Intent Parse: PASSED
[TEST] ✅ Assistant Query: PASSED
[TEST] ✅ Vault Interaction (Mock): PASSED
[TEST] ✅ Event Logging: PASSED

📊 SUMMARY
Total Tests: 4
Passed: 4
Failed: 0
Success Rate: 100.0%
✅ ALL TESTS PASSED
```

## Test Stages

### 1. Contract Deployment

Runs deployment scripts:
```bash
npx hardhat run scripts/deploy_mockdex.js --network hardhat
npx hardhat run scripts/deploy_intent_registry.js --network hardhat
npx hardhat run scripts/deploy_vault.js --network hardhat
```

**Output**: Contract addresses written to `deployment/` directory
- `deployment/mockdex.json`
- `deployment/intent_registry.json`
- `deployment/vault.json`

### 2. Backend Server

The E2E runner expects the backend to be running on `http://localhost:5000`.

**Note**: The runner does NOT start the backend directly (to allow flexibility in deployment).
Start it separately in another terminal:

```bash
npm run dev
```

### 3. API Tests

#### Test 1: Intent Parse
- **Endpoint**: `POST /api/intent/parse`
- **Input**: `{ "intent": "Swap 1 ETH for USDC with low slippage" }`
- **Expected**: Parsed intent with action, tokens, amounts
- **Success**: `action === "swap" && tokenIn === "ETH" && tokenOut === "USDC"`

#### Test 2: Assistant Query
- **Endpoint**: `POST /api/assistant/query`
- **Input**: `{ "message": "What is the best strategy for 1000 USDC?" }`
- **Expected**: Response with suggestions
- **Success**: Response length > 0 && suggestions.length > 0

#### Test 3: Vault Interaction
- **Endpoint**: Mock (real interaction requires MetaMask)
- **Expected**: Simulated deposit response
- **Success**: Always passes (mock mode)

#### Test 4: Event Logging
- **Endpoint**: `GET /api/assistant/parsed-intents`
- **Expected**: Array of recent parsed intents
- **Success**: Array is valid and has valid structure

## Results File

Each run generates `WAVE3_E2E_SUMMARY.json`:

```json
{
  "timestamp": "2025-11-29T04:45:00Z",
  "network": "localhost",
  "tests": [
    {
      "name": "Intent Parse",
      "passed": true,
      "response": {
        "action": "swap",
        "tokenIn": "ETH",
        "tokenOut": "USDC",
        "amount": "1",
        "minReturn": "0.98",
        "route": ["MockDEX"],
        "source": "mock"
      },
      "timestamp": "2025-11-29T04:45:01Z"
    }
  ],
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0
  },
  "deployments": {
    "mockDEX": {
      "deployed": true,
      "address": "0x...",
      "timestamp": "2025-11-29T04:45:00Z"
    }
  }
}
```

## Local Development

### Step 1: Terminal 1 - Start Hardhat Node (Optional)

```bash
npx hardhat node
```

This starts a persistent Hardhat node on `http://127.0.0.1:8545`

### Step 2: Terminal 2 - Start Backend

```bash
npm run dev
```

Server starts on `http://localhost:5000`

### Step 3: Terminal 3 - Run E2E Tests

```bash
npm run e2e
```

Alternatively, run individual deployment steps manually:

```bash
# Deploy contracts
npx hardhat run scripts/deploy_mockdex.js --network hardhat
npx hardhat run scripts/deploy_intent_registry.js --network hardhat
npx hardhat run scripts/deploy_vault.js --network hardhat

# Then run E2E tests
node scripts/e2e_runner.js
```

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Run E2E Tests
  run: npm run e2e
  timeout-minutes: 5
```

The E2E runner automatically:
- Creates necessary directories
- Writes results to `WAVE3_E2E_SUMMARY.json`
- Exits with code 0 on success, 1 on failure

## Troubleshooting

### "Port 8545 is already in use"

Kill the existing process:
```bash
lsof -i :8545
kill -9 <PID>
```

Or use a different port by modifying `scripts/e2e_runner.js`

### "ECONNREFUSED: Connection refused"

Backend is not running. In another terminal:
```bash
npm run dev
```

### "Contracts not deployed"

The deployment scripts must complete before tests run. Check:
1. Are deployment files being created in `deployment/`?
2. Do ABIs exist in `client/src/abi/`?
3. Are there any compilation errors in contracts?

### "Contract address not found"

Ensure deployment scripts write addresses correctly:
```bash
ls -la deployment/
cat deployment/mockdex.json
```

## Performance Notes

- **Full E2E Suite**: ~30-60 seconds
- **Contract Deployment**: ~15-20 seconds
- **API Tests**: ~10-15 seconds
- **Results Writing**: <1 second

## Future Enhancements

- [ ] Real MetaMask wallet integration for vault deposit
- [ ] On-chain event verification
- [ ] Performance benchmarking
- [ ] Load testing with concurrent requests
- [ ] Multi-chain testing
- [ ] Gas cost analysis

## Support

For issues or questions about the E2E test suite, see:
- `WAVE3_SMART_CONTRACTS.md` - Contract specifications
- `client/README-integration.md` - Web3 integration guide
- `server/README-assistant.md` - AI Assistant guide

---

**Version**: 1.0  
**Last Updated**: November 29, 2025  
**Status**: Production Ready
