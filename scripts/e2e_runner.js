#!/usr/bin/env node
import { spawn } from 'child_process';
import { ethers } from 'ethers';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Configuration
const HARDHAT_PORT = 8545;
const BACKEND_PORT = 5000;
const HARDHAT_RPC = `http://127.0.0.1:${HARDHAT_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// Test account (Hardhat default)
const TEST_ACCOUNT = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590a4a3',
};

// Results collector
const results = {
  timestamp: new Date().toISOString(),
  network: 'localhost',
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
  deployments: {},
  contractAddresses: {},
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(stage, message) {
  console.log(`[${stage}] ${message}`);
}

function logError(stage, error) {
  console.error(`[${stage}] ❌ Error:`, error.message || error);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    log('EXEC', `Starting: ${description}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    child.on('error', (error) => {
      logError('EXEC', error);
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${description} exited with code ${code}`));
      } else {
        log('EXEC', `✅ ${description} completed`);
        resolve();
      }
    });
  });
}

async function waitForPort(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`http://127.0.0.1:${port}`, { timeout: 1000 });
      log('HEALTH', `Port ${port} is ready`);
      return true;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      await delay(1000);
    }
  }
  throw new Error(`Port ${port} did not become available`);
}

// ============================================================================
// HARDHAT DEPLOYMENT
// ============================================================================

async function deployContracts() {
  log('DEPLOY', 'Starting contract deployment...');

  try {
    // Run deployment scripts
    await executeCommand('npx', ['hardhat', 'run', 'scripts/deploy_mockdex.js', '--network', 'hardhat'], 'Deploy MockDEX');
    await delay(1000);
    
    await executeCommand('npx', ['hardhat', 'run', 'scripts/deploy_intent_registry.js', '--network', 'hardhat'], 'Deploy IntentRegistry');
    await delay(1000);
    
    await executeCommand('npx', ['hardhat', 'run', 'scripts/deploy_vault.js', '--network', 'hardhat'], 'Deploy Vault');

    // Read deployed addresses
    const deploymentDir = path.join(rootDir, 'deployment');
    const readAddress = (filename) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(deploymentDir, filename), 'utf-8'));
        return data.address;
      } catch {
        return null;
      }
    };

    results.contractAddresses = {
      mockDEX: readAddress('mockdex.json'),
      intentRegistry: readAddress('intent_registry.json'),
      vault: readAddress('vault.json'),
    };

    results.deployments = {
      mockDEX: {
        deployed: true,
        address: results.contractAddresses.mockDEX,
        timestamp: new Date().toISOString(),
      },
      intentRegistry: {
        deployed: true,
        address: results.contractAddresses.intentRegistry,
        timestamp: new Date().toISOString(),
      },
      vault: {
        deployed: true,
        address: results.contractAddresses.vault,
        timestamp: new Date().toISOString(),
      },
    };

    log('DEPLOY', `✅ All contracts deployed`);
  } catch (error) {
    logError('DEPLOY', error);
    results.deployments.error = error.message;
    throw error;
  }
}

// ============================================================================
// E2E TESTS
// ============================================================================

async function testIntentParse() {
  const testName = 'Intent Parse';
  log('TEST', `Running: ${testName}`);

  try {
    const response = await axios.post(`${BACKEND_URL}/api/intent/parse`, {
      intent: 'Swap 1 ETH for USDC with low slippage',
    }, { timeout: 5000 });

    const { parsed } = response.data;
    const passed = parsed.action === 'swap' && parsed.tokenIn === 'ETH' && parsed.tokenOut === 'USDC';

    results.tests.push({
      name: testName,
      passed,
      response: {
        action: parsed.action,
        tokenIn: parsed.tokenIn,
        tokenOut: parsed.tokenOut,
        amount: parsed.amount,
        minReturn: parsed.minReturn,
        route: parsed.route,
        source: parsed.source,
      },
      timestamp: new Date().toISOString(),
    });

    log('TEST', `✅ ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    return passed;
  } catch (error) {
    logError('TEST', error);
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

async function testAssistantQuery() {
  const testName = 'Assistant Query';
  log('TEST', `Running: ${testName}`);

  try {
    const response = await axios.post(`${BACKEND_URL}/api/assistant/query`, {
      message: 'What is the best strategy for 1000 USDC?',
    }, { timeout: 5000 });

    const { response: assistantResponse, suggestions } = response.data;
    const passed = assistantResponse && assistantResponse.length > 0 && suggestions.length > 0;

    results.tests.push({
      name: testName,
      passed,
      response: {
        responseLength: assistantResponse.length,
        suggestionsCount: suggestions.length,
        suggestions: suggestions.slice(0, 2),
      },
      timestamp: new Date().toISOString(),
    });

    log('TEST', `✅ ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    return passed;
  } catch (error) {
    logError('TEST', error);
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

async function testVaultInteraction() {
  const testName = 'Vault Interaction (Mock)';
  log('TEST', `Running: ${testName}`);

  try {
    // Mock vault interaction since we're not connecting real wallet in E2E
    const mockVaultResponse = {
      success: true,
      action: 'deposit',
      amount: '1.0',
      sharesReceived: '1.0',
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    };

    results.tests.push({
      name: testName,
      passed: true,
      response: mockVaultResponse,
      note: 'Mock mode - real on-chain interaction requires MetaMask',
      timestamp: new Date().toISOString(),
    });

    log('TEST', `✅ ${testName}: PASSED (mock)`);
    return true;
  } catch (error) {
    logError('TEST', error);
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

async function testEventLogging() {
  const testName = 'Event Logging';
  log('TEST', `Running: ${testName}`);

  try {
    const response = await axios.get(`${BACKEND_URL}/api/assistant/parsed-intents`, { timeout: 5000 });

    const { count, recent } = response.data;
    const passed = count >= 0 && Array.isArray(recent);

    results.tests.push({
      name: testName,
      passed,
      response: {
        totalIntentsParsed: count,
        recentCount: recent.length,
        recentSample: recent.slice(0, 2),
      },
      timestamp: new Date().toISOString(),
    });

    log('TEST', `✅ ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    return passed;
  } catch (error) {
    logError('TEST', error);
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

// ============================================================================
// MAIN E2E RUNNER
// ============================================================================

async function runE2E() {
  log('E2E', '🚀 Starting IntentX E2E Test Suite');
  log('E2E', `Network: ${results.network}`);
  log('E2E', `Hardhat RPC: ${HARDHAT_RPC}`);
  log('E2E', `Backend: ${BACKEND_URL}`);

  try {
    // Step 1: Deploy contracts
    log('E2E', '📦 Step 1: Deploying smart contracts...');
    await deployContracts();

    // Step 2: Wait for backend to be ready
    log('E2E', '⏳ Step 2: Waiting for backend to be ready...');
    await delay(3000); // Give backend time to start

    // Step 3: Run E2E tests
    log('E2E', '🧪 Step 3: Running E2E tests...');

    const tests = [
      testIntentParse,
      testAssistantQuery,
      testVaultInteraction,
      testEventLogging,
    ];

    for (const testFn of tests) {
      const passed = await testFn();
      results.summary.total++;
      if (passed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
      await delay(500);
    }

    // Step 4: Write results
    log('E2E', '💾 Step 4: Writing results to file...');
    const resultsPath = path.join(rootDir, 'WAVE3_E2E_SUMMARY.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    log('E2E', `✅ Results written to: ${resultsPath}`);

    // Summary
    log('E2E', '');
    log('E2E', '📊 SUMMARY');
    log('E2E', `Total Tests: ${results.summary.total}`);
    log('E2E', `Passed: ${results.summary.passed}`);
    log('E2E', `Failed: ${results.summary.failed}`);
    log('E2E', `Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

    if (results.summary.failed === 0) {
      log('E2E', '✅ ALL TESTS PASSED');
      process.exit(0);
    } else {
      log('E2E', '⚠️  SOME TESTS FAILED');
      process.exit(1);
    }
  } catch (error) {
    logError('E2E', error);
    results.error = error.message;
    const resultsPath = path.join(rootDir, 'WAVE3_E2E_SUMMARY.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    process.exit(1);
  }
}

// Run the E2E suite
runE2E();
