import { z } from "zod";

// ============================================================================
// INTENT SCHEMAS
// ============================================================================

export const intentSchema = z.object({
  id: z.string(),
  naturalLanguage: z.string(),
  owner: z.string().optional(),
  tokenIn: z.string().optional(),
  tokenOut: z.string().optional(),
  amount: z.string().optional(),
  slippage: z.string().optional(),
  gasUsed: z.string().optional(),
  executionRoute: z.string().optional(),
  logs: z.array(z.object({
    timestamp: z.string(),
    event: z.string(),
    data: z.record(z.unknown()),
  })).optional(),
  parsedSteps: z.array(z.object({
    action: z.enum(['swap', 'stake', 'unstake', 'supply', 'borrow', 'withdraw']),
    protocol: z.string(),
    tokenIn: z.string().optional(),
    tokenOut: z.string().optional(),
    amount: z.string(),
    estimatedGas: z.string().optional(),
  })),
  status: z.enum(['draft', 'parsing', 'parsed', 'simulating', 'executing', 'completed', 'failed']),
  totalGasEstimate: z.string().optional(),
  createdAt: z.string(),
  executedAt: z.string().optional(),
  txHash: z.string().optional(),
  error: z.string().optional(),
});

export const insertIntentSchema = z.object({
  naturalLanguage: z.string().min(3, "Intent must be at least 3 characters"),
});

export type Intent = z.infer<typeof intentSchema>;
export type InsertIntent = z.infer<typeof insertIntentSchema>;

// ============================================================================
// VAULT/STAKING SCHEMAS
// ============================================================================

export const vaultSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: z.string(),
  tokenSymbol: z.string(),
  apy: z.number(),
  tvl: z.string(),
  userStaked: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  logoUrl: z.string().optional(),
});

export const insertVaultSchema = z.object({
  vaultId: z.string(),
  amount: z.string().min(1, "Amount is required"),
});

export type Vault = z.infer<typeof vaultSchema>;
export type InsertVault = z.infer<typeof insertVaultSchema>;

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['swap', 'stake', 'unstake', 'supply', 'borrow', 'withdraw']),
  status: z.enum(['pending', 'simulating', 'executing', 'confirmed', 'failed']),
  description: z.string(),
  amount: z.string(),
  tokenSymbol: z.string(),
  txHash: z.string().optional(),
  timestamp: z.string(),
  gasUsed: z.string().optional(),
  network: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

// ============================================================================
// NETWORK SCHEMAS
// ============================================================================

export const networkSchema = z.object({
  id: z.string(),
  name: z.string(),
  chainId: z.number(),
  rpcUrl: z.string(),
  explorerUrl: z.string(),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
  color: z.string(),
  isTestnet: z.boolean(),
});

export type Network = z.infer<typeof networkSchema>;

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const analyticsDataSchema = z.object({
  totalVolume: z.string(),
  totalTransactions: z.number(),
  totalGasSaved: z.string(),
  avgExecutionTime: z.number(),
  volumeHistory: z.array(z.object({
    date: z.string(),
    volume: z.number(),
  })),
  gasHistory: z.array(z.object({
    date: z.string(),
    gas: z.number(),
  })),
});

export type AnalyticsData = z.infer<typeof analyticsDataSchema>;

// ============================================================================
// WALLET SCHEMAS
// ============================================================================

export const walletSchema = z.object({
  address: z.string(),
  balance: z.string(),
  network: z.string(),
  connected: z.boolean(),
});

export type Wallet = z.infer<typeof walletSchema>;

// ============================================================================
// PERFORMANCE SCHEMAS
// ============================================================================

export const performanceSchema = z.object({
  latency: z.number(),
  gasEstimate: z.string(),
  optimizationScore: z.number(),
  source: z.enum(['mock', 'live']),
});

export type Performance = z.infer<typeof performanceSchema>;

// ============================================================================
// FAQ SCHEMAS
// ============================================================================

export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
});

export type FAQ = z.infer<typeof faqSchema>;
