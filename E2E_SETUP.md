# IntentX E2E Setup Instructions

## Quick Start

The E2E test suite is ready! To use it, you need to:

### Option 1: Direct Node Command (Works Now ✅)

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Run E2E tests
node scripts/e2e_runner.js
```

This will:
1. Deploy contracts to Hardhat
2. Run integration tests
3. Generate `WAVE3_E2E_SUMMARY.json`

### Option 2: Add to package.json (Manual)

Edit `package.json` and add this to the `"scripts"` section:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "...",
  "e2e": "node scripts/e2e_runner.js"
}
```

Then run:
```bash
npm run e2e
```

## Files Created

| File | Purpose |
|------|---------|
| `scripts/e2e_runner.js` | Main E2E orchestrator (270+ lines) |
| `scripts/README-e2e.md` | Complete E2E documentation |
| `WAVE3_E2E_SUMMARY.json` | Sample test results |
| `E2E_SETUP.md` | This file |

## What the E2E Suite Tests

✅ **Contract Deployment** - Deploys MockDEX, IntentRegistry, Vault  
✅ **Intent Parsing** - POST /api/intent/parse with sample swap intent  
✅ **Assistant Chat** - POST /api/assistant/query for strategy suggestions  
✅ **Vault Mock** - Simulated vault deposit interaction  
✅ **Event Logging** - GET /api/assistant/parsed-intents verification  

## Expected Output

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

## For Judges

Judges can reproduce the full pipeline with:

```bash
# Start backend in one terminal
npm run dev

# Run E2E in another terminal
node scripts/e2e_runner.js
```

View results:
```bash
cat WAVE3_E2E_SUMMARY.json | jq .
```

## Documentation

- **Full Guide**: See `scripts/README-e2e.md`
- **Contracts**: See `WAVE3_SMART_CONTRACTS.md`
- **Web3 Integration**: See `client/README-integration.md`
- **AI Assistant**: See `server/README-assistant.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: November 29, 2025
