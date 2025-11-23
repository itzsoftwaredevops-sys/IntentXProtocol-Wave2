import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIntentSchema } from "@shared/schema";
import {
  generateSupportResponse,
  getSuggestedPromptsForUI,
  getAllFAQs,
} from "./ai-support";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
