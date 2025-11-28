/**
 * Comprehensive API Test Suite
 * Tests all backend endpoints for functionality, error handling, and performance
 */

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  duration: number;
  error?: string;
}

const API_BASE = 'http://localhost:5000/api';
const results: TestResult[] = [];

// ============================================================================
// ANALYTICS TESTS
// ============================================================================

async function testAnalyticsSummary(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.totalVolume || !data.averageIntentSize) {
      throw new Error('Missing required fields');
    }
    
    return {
      name: 'GET /api/analytics/summary',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/analytics/summary',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testDetailedAnalytics(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/analytics/detailed`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.performanceMetrics) {
      throw new Error('Missing performance metrics');
    }
    
    return {
      name: 'GET /api/analytics/detailed',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/analytics/detailed',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// TRANSACTION TESTS
// ============================================================================

async function testRecentTransactions(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/transactions/recent?limit=10`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Expected array response');
    }
    
    return {
      name: 'GET /api/transactions/recent',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/transactions/recent',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testAllTransactions(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Expected array response');
    }
    
    return {
      name: 'GET /api/transactions',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/transactions',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// VAULT TESTS
// ============================================================================

async function testGetVaults(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/vaults`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Expected non-empty array');
    }
    
    return {
      name: 'GET /api/vaults',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/vaults',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testGetVaultById(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/vaults/vault-1`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.id || !data.name) {
      throw new Error('Missing vault fields');
    }
    
    return {
      name: 'GET /api/vaults/:id',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/vaults/:id',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testVaultAction(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/vaults/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vaultId: 'vault-1',
        amount: '10',
        action: 'stake',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.success) {
      throw new Error('Vault action failed');
    }
    
    return {
      name: 'POST /api/vaults/action',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/vaults/action',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// INTENT TESTS
// ============================================================================

async function testCreateIntent(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Swap 100 USDC for ETH',
        chainId: 808080,
        status: 'pending',
        steps: [],
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.id) {
      throw new Error('Intent not created');
    }
    
    return {
      name: 'POST /api/intents',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/intents',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testGetIntents(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/intents`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Expected array response');
    }
    
    return {
      name: 'GET /api/intents',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'GET /api/intents',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// OFF-CHAIN EXECUTOR TESTS
// ============================================================================

async function testExecutorSign(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/executor/sign-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: '0x1234567890123456789012345678901234567890',
        intentData: 'swap-100-usdc-eth',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.signature || !data.id) {
      throw new Error('Missing signature or id');
    }
    
    return {
      name: 'POST /api/executor/sign-intent',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/executor/sign-intent',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

async function testExecutorBundle(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/executor/submit-bundle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chainId: 808080 }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.bundleId) {
      throw new Error('No bundleId in response');
    }
    
    return {
      name: 'POST /api/executor/submit-bundle',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/executor/submit-bundle',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// ROUTE OPTIMIZER TESTS
// ============================================================================

async function testOptimizeRoute(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/optimizer/optimize-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromToken: 'USDC',
        toToken: 'ETH',
        amount: '100',
        chainId: 808080,
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.selectedRoute || !data.analysis) {
      throw new Error('Missing route or analysis');
    }
    
    return {
      name: 'POST /api/optimizer/optimize-route',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/optimizer/optimize-route',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// BRIDGE ROUTER TESTS
// ============================================================================

async function testBridgeRoute(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/bridge/find-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryChainId: 808080,
        token: 'USDC',
        amount: '1000',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    
    if (!data.chainLiquidity) {
      throw new Error('Missing liquidity data');
    }
    
    return {
      name: 'POST /api/bridge/find-route',
      status: 'pass',
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      name: 'POST /api/bridge/find-route',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

async function testBatchProcessingPerformance(): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/intents/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intents: Array(10)
          .fill(null)
          .map((_, i) => ({
            description: `Intent ${i}`,
            chainId: 808080,
            status: 'pending',
          })),
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    const duration = performance.now() - start;
    
    if (duration > 5000) {
      throw new Error(`Batch processing too slow: ${duration}ms`);
    }
    
    return {
      name: 'Batch Processing Performance (10 intents)',
      status: 'pass',
      duration,
    };
  } catch (error) {
    return {
      name: 'Batch Processing Performance (10 intents)',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    };
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🧪 IntentX Comprehensive Test Suite\n');
  console.log('📊 Running API Tests...\n');

  const tests = [
    // Analytics
    testAnalyticsSummary,
    testDetailedAnalytics,
    
    // Transactions
    testRecentTransactions,
    testAllTransactions,
    
    // Vaults
    testGetVaults,
    testGetVaultById,
    testVaultAction,
    
    // Intents
    testCreateIntent,
    testGetIntents,
    
    // Executor
    testExecutorSign,
    testExecutorBundle,
    
    // Optimizer
    testOptimizeRoute,
    
    // Bridge
    testBridgeRoute,
    
    // Performance
    testBatchProcessingPerformance,
  ];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    const status = result.status === 'pass' ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration.toFixed(2)}ms)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter((r) => r.status === 'pass').length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\n📈 Test Summary:`);
  console.log(`   Passed: ${passed}/${total} (${passRate}%)`);
  console.log(`   Failed: ${total - passed}`);
  console.log(
    `   Total Time: ${results
      .reduce((sum, r) => sum + r.duration, 0)
      .toFixed(2)}ms`
  );

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.');
    process.exit(1);
  }
}

runAllTests();
