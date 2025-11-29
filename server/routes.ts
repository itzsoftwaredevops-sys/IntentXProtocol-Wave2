import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertIntentSchema } from "@shared/schema";
import {
  generateSupportResponse,
  getSuggestedPromptsForUI,
  getAllFAQs,
} from "./ai-support";
import { offChainExecutor } from "./off-chain-executor";
import { routeOptimizer } from "./route-optimizer";
import { bridgeRouter } from "./bridge-router";
import { parseIntent } from "./intent-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register execution explorer routes
  await registerExecutionExplorerRoutes(app);

  // Register off-chain executor routes
  registerExecutorRoutes(app);

  // Register route optimizer routes
  registerOptimizerRoutes(app);

  // Register bridge router routes
  registerBridgeRoutes(app);

  // ============================================================================
  // ANALYTICS ROUTES
  // ============================================================================
  
  app.get("/api/analytics/summary", async (_req, res) => {
    try {
      const data = await storage.getAnalyticsSummary();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics/detailed", async (_req, res) => {
    try {
      const data = await storage.getDetailedAnalytics();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch detailed analytics" });
    }
  });

  // ============================================================================
  // TRANSACTION ROUTES
  // ============================================================================
  
  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // ============================================================================
  // VAULT ROUTES
  // ============================================================================
  
  app.get("/api/vaults", async (_req, res) => {
    try {
      const vaults = await storage.getAllVaults();
      res.json(vaults);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vaults" });
    }
  });

  app.get("/api/vaults/:id", async (req, res) => {
    try {
      const vault = await storage.getVault(req.params.id);
      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }
      res.json(vault);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vault" });
    }
  });

  app.post("/api/vaults/action", async (req, res) => {
    try {
      const { vaultId, amount, action } = req.body;
      
      if (!vaultId || !amount || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (action !== 'stake' && action !== 'unstake') {
        return res.status(400).json({ error: "Invalid action. Must be 'stake' or 'unstake'" });
      }

      const vault = await storage.getVault(vaultId);
      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      // Simulate stake/unstake by updating userStaked
      const currentStaked = parseFloat(vault.userStaked) || 0;
      const amountNum = parseFloat(amount);
      
      let newStaked = currentStaked;
      if (action === 'stake') {
        newStaked = currentStaked + amountNum;
      } else if (action === 'unstake') {
        newStaked = Math.max(0, currentStaked - amountNum);
      }

      const updated = await storage.updateVault(vaultId, {
        userStaked: newStaked.toString(),
      });

      // Create transaction record
      await storage.createTransaction({
        type: action,
        status: 'confirmed',
        description: `${action === 'stake' ? 'Staked' : 'Unstaked'} ${amount} ${vault.tokenSymbol} in ${vault.name}`,
        amount,
        tokenSymbol: vault.tokenSymbol,
        timestamp: new Date().toISOString(),
        network: 'BlockDAG Testnet',
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        gasUsed: (Math.random() * 0.01 + 0.001).toFixed(6),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform vault action" });
    }
  });

  // ============================================================================
  // INTENT ROUTES
  // ============================================================================
  
  app.post("/api/intent/parse", async (req, res) => {
    try {
      const result = insertIntentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request body", details: result.error });
      }

      const intent = await storage.createIntent(result.data);
      
      // Simulate intent parsing with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Parse the natural language into steps
      const parsedSteps = parseNaturalLanguage(intent.naturalLanguage);
      
      const totalGas = parsedSteps.reduce((sum, step) => {
        const gas = parseFloat(step.estimatedGas || "0");
        return sum + gas;
      }, 0);

      const updated = await storage.updateIntent(intent.id, {
        parsedSteps,
        status: 'parsed',
        totalGasEstimate: totalGas.toFixed(6) + " ETH",
      });

      res.json(updated);
    } catch (error) {
      console.error("Parse error:", error);
      res.status(500).json({ error: "Failed to parse intent" });
    }
  });

  app.post("/api/intent/execute", async (req, res) => {
    try {
      const { intentId } = req.body;
      
      if (!intentId) {
        return res.status(400).json({ error: "Intent ID required" });
      }

      const intent = await storage.getIntent(intentId);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      // Update to executing status
      await storage.updateIntent(intentId, { status: 'executing' });

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock transaction hash
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      // Update to completed
      const updated = await storage.updateIntent(intentId, {
        status: 'completed',
        executedAt: new Date().toISOString(),
        txHash,
      });

      // Create transaction record for the intent
      await storage.createTransaction({
        type: intent.parsedSteps[0]?.action || 'swap',
        status: 'confirmed',
        description: intent.naturalLanguage,
        amount: intent.parsedSteps[0]?.amount || "0",
        tokenSymbol: intent.parsedSteps[0]?.tokenOut || intent.parsedSteps[0]?.tokenIn || "ETH",
        timestamp: new Date().toISOString(),
        network: 'BlockDAG Testnet',
        txHash,
        gasUsed: intent.totalGasEstimate || "0.005",
      });

      res.json(updated);
    } catch (error) {
      console.error("Execute error:", error);
      res.status(500).json({ error: "Failed to execute intent" });
    }
  });

  app.get("/api/intent/:id", async (req, res) => {
    try {
      const intent = await storage.getIntent(req.params.id);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }
      res.json(intent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch intent" });
    }
  });

  // ============================================================================
  // BATCHING & AA ROUTES (Scalability Features)
  // ============================================================================

  /**
   * Batch Intent Processing
   * Accepts multiple intents and processes them in parallel
   * Demonstrates scalability by handling 10-100s of intents simultaneously
   * Response time includes parsing + execution time across all intents
   */
  app.post("/api/intent/batch", async (req, res) => {
    try {
      const { intents, metadata } = req.body;
      
      if (!Array.isArray(intents) || intents.length === 0) {
        return res.status(400).json({ error: "Must provide array of intents" });
      }

      if (intents.length > 100) {
        return res.status(400).json({ error: "Batch size cannot exceed 100 intents" });
      }

      const batchId = `batch-${randomUUID()}`;
      const startTime = Date.now();
      const processedIntents = [];

      // Process intents in parallel for better scalability
      const promises = intents.map(async (intentData) => {
        try {
          const result = insertIntentSchema.safeParse(intentData);
          if (!result.success) {
            return { status: 'failed', error: result.error.message };
          }

          const intent = await storage.createIntent(result.data);
          
          // Simulate fast parsing (10-50ms per intent in batch mode)
          const parsedSteps = parseNaturalLanguage(intent.naturalLanguage);
          const totalGas = parsedSteps.reduce((sum, step) => {
            const gas = parseFloat(step.estimatedGas || "0");
            return sum + gas;
          }, 0);

          // Simulate fast execution (100-200ms per intent in batch mode)
          const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
          
          const updated = await storage.updateIntent(intent.id, {
            parsedSteps,
            status: 'completed',
            totalGasEstimate: totalGas.toFixed(6) + " ETH",
            executedAt: new Date().toISOString(),
            txHash,
          });

          return {
            status: 'completed',
            intentId: updated?.id || intent.id,
            txHash,
            gasUsed: updated?.totalGasEstimate || (totalGas.toFixed(6) + " ETH"),
          };
        } catch (error) {
          return { status: 'failed', error: String(error) };
        }
      });

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      res.json({
        batchId,
        totalIntents: intents.length,
        successCount: results.filter(r => r.status === 'completed').length,
        failureCount: results.filter(r => r.status === 'failed').length,
        totalProcessingTimeMs: totalTime,
        avgTimePerIntentMs: Math.round(totalTime / intents.length),
        results,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Batch error:", error);
      res.status(500).json({ error: "Failed to process batch" });
    }
  });

  /**
   * Account Abstraction (Gasless) Intent Execution
   * Simulates account abstraction protocol for gas-free transactions
   * In production: uses bundlers and paymasters to abstract gas costs
   * For demo: instantly executes with zero gas cost simulation
   */
  app.post("/api/intent/aa-gasless", async (req, res) => {
    try {
      const { naturalLanguage, userOperation } = req.body;

      if (!naturalLanguage) {
        return res.status(400).json({ error: "Natural language required" });
      }

      const startTime = Date.now();

      // Create and process intent with AA
      const result = insertIntentSchema.safeParse({ naturalLanguage });
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request body", details: result.error });
      }

      const intent = await storage.createIntent(result.data);
      const parsedSteps = parseNaturalLanguage(intent.naturalLanguage);
      const totalGas = parsedSteps.reduce((sum, step) => {
        const gas = parseFloat(step.estimatedGas || "0");
        return sum + gas;
      }, 0);

      // Simulate bundler signature and execution (150-250ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 150));

      const userOpHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const bundlerTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      const updated = await storage.updateIntent(intent.id, {
        parsedSteps,
        status: 'completed',
        totalGasEstimate: '0', // Gasless!
        executedAt: new Date().toISOString(),
        txHash: bundlerTxHash,
      });

      const endTime = Date.now();

      res.json({
        success: true,
        intentId: updated?.id || intent.id,
        userOpHash,
        bundlerTxHash,
        executionTimeMs: endTime - startTime,
        gasCost: '$0.00 (Sponsored by IntentX Protocol)',
        status: 'completed',
        userOperation: {
          sender: userOperation?.sender || '0x' + Math.random().toString(16).substring(2, 42),
          nonce: userOperation?.nonce || Math.floor(Math.random() * 1000),
          callData: userOperation?.callData || '0x',
          signature: userOperation?.signature || `0x${Math.random().toString(16).substring(2, 130)}`,
        },
        message: 'Intent executed via Account Abstraction - Zero gas cost!',
      });
    } catch (error) {
      console.error("AA error:", error);
      res.status(500).json({ error: "Failed to execute via AA" });
    }
  });

  // ============================================================================
  // FAQ ROUTES
  // ============================================================================
  
  app.get("/api/faq", async (_req, res) => {
    try {
      const faqs = await storage.getAllFAQs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  // ============================================================================
  // PERFORMANCE ROUTES
  // ============================================================================
  
  app.get("/api/performance", async (_req, res) => {
    try {
      const metrics = await storage.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  // ============================================================================
  // AI ASSISTANT & INTENT PARSER ROUTES
  // ============================================================================

  app.post("/api/intent/parse", async (req, res) => {
    try {
      const { intent } = req.body;
      if (!intent || typeof intent !== "string") {
        return res.status(400).json({ error: "Missing or invalid intent" });
      }

      const sanitized = intent.slice(0, 500).trim();
      const parsed = await parseIntent(sanitized);

      res.json({
        success: true,
        parsed,
        message: `Intent parsed: ${parsed.action} - ${parsed.explanation}`,
      });
    } catch (error) {
      console.error("Parse error:", error);
      res.status(500).json({ 
        error: "Failed to parse intent", 
        details: String(error) 
      });
    }
  });

  app.post("/api/assistant/query", async (req, res) => {
    try {
      const { message, intentId, walletAddress, conversationHistory } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing or invalid message" });
      }

      const sanitized = message.slice(0, 1000).trim();
      const context = {
        message: sanitized,
        intentId: intentId || null,
        walletAddress: walletAddress || null,
        history: (Array.isArray(conversationHistory) && conversationHistory.slice(-10)) || [],
      };

      const response = generateSupportResponse(sanitized);

      let suggestions: string[] = [];
      if (sanitized.toLowerCase().includes("slippage") || sanitized.toLowerCase().includes("gas")) {
        suggestions.push("Consider splitting into multiple smaller swaps");
        suggestions.push("Check current network conditions");
      }
      if (sanitized.toLowerCase().includes("yield") || sanitized.toLowerCase().includes("apy")) {
        suggestions.push("Compare APY across different vaults");
        suggestions.push("Consider Conservative strategy for lower risk");
      }
      if (sanitized.toLowerCase().includes("swap") || sanitized.toLowerCase().includes("trade")) {
        suggestions.push("Use natural language to describe your swap");
        suggestions.push("Example: 'Swap 10 ETH for USDC with low slippage'");
      }

      res.json({
        success: true,
        response,
        context,
        suggestions: suggestions.length > 0 ? suggestions : [
          "Ask me about swaps, staking, lending, or vaults",
          "Request strategy optimization suggestions",
          "Get help with transaction execution",
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Assistant query error:", error);
      res.status(500).json({ 
        error: "Failed to process query", 
        details: String(error) 
      });
    }
  });

  app.get("/api/assistant/parsed-intents", (_req, res) => {
    try {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), "server", "data", "parsed_intents.json");
      let intents: any[] = [];

      try {
        const data = fs.readFileSync(filePath, "utf-8");
        intents = JSON.parse(data);
      } catch {
        // File doesn't exist yet
      }

      res.json({
        success: true,
        count: intents.length,
        recent: intents.slice(-5),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parsed intents" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseNaturalLanguage(text: string) {
  const lowerText = text.toLowerCase();
  const steps = [];

  // Simple pattern matching for common DeFi actions
  if (lowerText.includes('swap')) {
    const match = text.match(/swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to)\s+(\w+)/i);
    if (match) {
      steps.push({
        action: 'swap' as const,
        protocol: lowerText.includes('uniswap') ? 'Uniswap V3' : 'DEX',
        tokenIn: match[2].toUpperCase(),
        tokenOut: match[3].toUpperCase(),
        amount: match[1],
        estimatedGas: (Math.random() * 0.005 + 0.002).toFixed(6),
      });
    }
  }

  if (lowerText.includes('stake')) {
    const match = text.match(/stake\s+(\d+(?:\.\d+)?)\s+(\w+)/i);
    if (match) {
      steps.push({
        action: 'stake' as const,
        protocol: lowerText.includes('lido') ? 'Lido' : 'Staking Vault',
        tokenIn: match[2].toUpperCase(),
        amount: match[1],
        estimatedGas: (Math.random() * 0.003 + 0.001).toFixed(6),
      });
    }
  }

  if (lowerText.includes('supply') || lowerText.includes('lend')) {
    const match = text.match(/(?:supply|lend)\s+(\d+(?:\.\d+)?)\s+(\w+)/i);
    if (match) {
      steps.push({
        action: 'supply' as const,
        protocol: lowerText.includes('aave') ? 'Aave V3' : 'Compound',
        tokenIn: match[2].toUpperCase(),
        amount: match[1],
        estimatedGas: (Math.random() * 0.004 + 0.002).toFixed(6),
      });
    }
  }

  if (lowerText.includes('borrow')) {
    const match = text.match(/borrow\s+(\d+(?:\.\d+)?)\s+(\w+)/i);
    if (match) {
      steps.push({
        action: 'borrow' as const,
        protocol: lowerText.includes('aave') ? 'Aave V3' : 'Compound',
        tokenOut: match[2].toUpperCase(),
        amount: match[1],
        estimatedGas: (Math.random() * 0.004 + 0.002).toFixed(6),
      });
    }
  }

  // Default fallback if no patterns matched
  if (steps.length === 0) {
    steps.push({
      action: 'swap' as const,
      protocol: 'Uniswap V3',
      tokenIn: 'USDC',
      tokenOut: 'ETH',
      amount: '100',
      estimatedGas: '0.003',
    });
  }

  return steps;
}

// ============================================================================
// EXECUTION EXPLORER ROUTES
// ============================================================================

export async function registerExecutionExplorerRoutes(app: Express): Promise<void> {
  app.get("/api/intents", async (_req, res) => {
    try {
      const intents = await storage.getAllIntents();
      res.json(intents);
    } catch (error) {
      console.error("Intents Error:", error);
      res.status(500).json({ error: "Failed to fetch intents" });
    }
  });

  app.get("/api/intent/:id", async (req, res) => {
    try {
      const intent = await storage.getIntent(req.params.id);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }
      res.json(intent);
    } catch (error) {
      console.error("Intent Error:", error);
      res.status(500).json({ error: "Failed to fetch intent" });
    }
  });

  app.get("/api/intent/:id/logs", async (req, res) => {
    try {
      const intent = await storage.getIntent(req.params.id);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }
      res.json({
        logs: intent.logs || [],
        executionRoute: intent.executionRoute,
        parsedSteps: intent.parsedSteps || [],
      });
    } catch (error) {
      console.error("Logs Error:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
}

// ============================================================================
// AI SUPPORT ROUTES
// ============================================================================

export async function registerAIRoutes(app: Express): Promise<void> {
  app.post("/api/ai-support", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing or invalid message" });
      }

      if (
        !Array.isArray(conversationHistory) &&
        conversationHistory !== undefined
      ) {
        return res
          .status(400)
          .json({ error: "Invalid conversation history format" });
      }

      const response = await generateSupportResponse(
        message,
        conversationHistory || []
      );

      res.json({ response });
    } catch (error) {
      console.error("AI Support Error:", error);
      res.status(500).json({
        error: "Failed to generate support response",
        response:
          "I'm having trouble processing your question. Please try again or check the FAQ section.",
      });
    }
  });

  app.get("/api/ai-support-prompts", (_req, res) => {
    try {
      const prompts = getSuggestedPromptsForUI();
      res.json({ prompts });
    } catch (error) {
      console.error("Prompts Error:", error);
      res.json({
        prompts: [
          "Swap 100 USDC for WETH",
          "Stake 10 ETH in Lido",
          "What vaults have the best APY?",
        ],
      });
    }
  });

  app.get("/api/faq-list", (_req, res) => {
    try {
      const faqs = getAllFAQs();
      res.json({ faqs });
    } catch (error) {
      console.error("FAQ List Error:", error);
      res.json({ faqs: [] });
    }
  });
}

// ============================================================================
// OFF-CHAIN EXECUTOR ROUTES (Relayer/Bundle Submission)
// ============================================================================

function registerExecutorRoutes(app: Express): void {
  app.post("/api/executor/sign-intent", (req, res) => {
    try {
      const { user, intentData } = req.body;
      if (!user || !intentData) {
        return res.status(400).json({ error: "Missing user or intentData" });
      }
      const intent = offChainExecutor.signIntent(user, intentData);
      res.json({
        success: true,
        intent,
        message: "Intent signed and queued for execution",
      });
    } catch (error) {
      console.error("Sign Intent Error:", error);
      res.status(500).json({ error: "Failed to sign intent" });
    }
  });

  app.post("/api/executor/submit-bundle", async (req, res) => {
    try {
      const { chainId, intentsToSubmit } = req.body;
      const result = await offChainExecutor.submitBundle(chainId || 808080, intentsToSubmit);
      res.json({
        success: true,
        bundle: result,
        message: `Bundle submitted: ${result.totalIntents} intents, ${result.txHash}`,
      });
    } catch (error) {
      console.error("Submit Bundle Error:", error);
      res.status(500).json({ error: "Failed to submit bundle" });
    }
  });

  app.get("/api/executor/bundle-status/:bundleId", (req, res) => {
    try {
      const status = offChainExecutor.getBundleStatus(req.params.bundleId);
      if (!status) {
        return res.status(404).json({ error: "Bundle not found" });
      }
      res.json({ success: true, bundle: status });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bundle status" });
    }
  });

  app.get("/api/executor/pending-intents", (_req, res) => {
    try {
      const count = offChainExecutor.getPendingIntentsCount();
      res.json({
        pendingIntents: count,
        message: `${count} intents pending in executor queue`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending intents" });
    }
  });
}

// ============================================================================
// ROUTE OPTIMIZER ROUTES (RAG/AI Route Selection)
// ============================================================================

function registerOptimizerRoutes(app: Express): void {
  app.post("/api/optimizer/route", async (req, res) => {
    try {
      const { fromToken, toToken, amount, chainId } = req.body;
      if (!fromToken || !toToken || !amount) {
        return res.status(400).json({
          error: "Missing fromToken, toToken, or amount",
        });
      }

      const result = await routeOptimizer.optimizeRoute(
        fromToken,
        toToken,
        amount,
        chainId || 808080
      );

      res.json({
        success: true,
        optimization: result,
        message: `Optimized ${result.routes.length} routes for ${fromToken} → ${toToken}`,
      });
    } catch (error) {
      console.error("Route Optimization Error:", error);
      res.status(500).json({ error: "Failed to optimize route" });
    }
  });

  app.get("/api/optimizer/analysis/:intentId", (req, res) => {
    try {
      // In production, would query persistent storage
      res.json({
        success: true,
        message: `Route analysis for intent ${req.params.intentId} (simulated)`,
        analysis: {
          strategy: "balanced",
          expectedSlippage: 0.3,
          gasEstimate: "85000",
          estimatedTime: 30,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route analysis" });
    }
  });
}

// ============================================================================
// BRIDGE ROUTER ROUTES (Cross-Chain Routing)
// ============================================================================

function registerBridgeRoutes(app: Express): void {
  app.post("/api/bridge/check-liquidity", (req, res) => {
    try {
      const { chainId, token, amount } = req.body;
      if (!chainId || !token || !amount) {
        return res
          .status(400)
          .json({ error: "Missing chainId, token, or amount" });
      }

      const sufficient = bridgeRouter.checkLiquidity(chainId, token, amount);
      res.json({
        success: true,
        chainId,
        token,
        amount,
        sufficientLiquidity: sufficient,
        message: sufficient
          ? "Liquidity available on primary chain"
          : "Insufficient liquidity, bridge may be needed",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check liquidity" });
    }
  });

  app.post("/api/bridge/find-route", (req, res) => {
    try {
      const { primaryChainId, token, amount } = req.body;
      if (!primaryChainId || !token || !amount) {
        return res
          .status(400)
          .json({ error: "Missing required parameters" });
      }

      const route = bridgeRouter.findBestRoute(primaryChainId, token, amount);
      if (!route) {
        return res.json({
          success: true,
          route: null,
          message: "No bridge needed, liquidity available on primary chain",
        });
      }

      res.json({
        success: true,
        route,
        message: `Bridge route found: ${route.sourceChain.name} → ${route.destinationChain.name}`,
      });
    } catch (error) {
      console.error("Find Route Error:", error);
      res.status(500).json({ error: "Failed to find bridge route" });
    }
  });

  app.post("/api/bridge/execute", async (req, res) => {
    try {
      const { primaryChainId, token, amount, targetChainId } = req.body;
      const intent = await bridgeRouter.executeXChainIntent(
        primaryChainId,
        token,
        amount,
        targetChainId
      );

      res.json({
        success: true,
        crossChainIntent: intent,
        message: `Cross-chain intent initiated: ${intent.id}`,
      });
    } catch (error) {
      console.error("Execute XChain Error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get("/api/bridge/plan", (_req, res) => {
    try {
      const plan = bridgeRouter.generateBridgePlan();
      res.json({ success: true, plan });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate bridge plan" });
    }
  });
}
