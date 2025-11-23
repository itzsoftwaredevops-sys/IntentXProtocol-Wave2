import type { Intent, InsertIntent, Vault, Transaction, FAQ, AnalyticsData, Performance } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Intent operations
  createIntent(intent: InsertIntent): Promise<Intent>;
  getIntent(id: string): Promise<Intent | undefined>;
  getAllIntents(): Promise<Intent[]>;
  updateIntent(id: string, updates: Partial<Intent>): Promise<Intent | undefined>;

  // Vault operations
  getAllVaults(): Promise<Vault[]>;
  getVault(id: string): Promise<Vault | undefined>;
  updateVault(id: string, updates: Partial<Vault>): Promise<Vault | undefined>;

  // Transaction operations
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;

  // FAQ operations
  getAllFAQs(): Promise<FAQ[]>;

  // Analytics operations
  getAnalyticsSummary(): Promise<AnalyticsData>;
  getDetailedAnalytics(): Promise<AnalyticsData>;

  // Performance operations
  getPerformanceMetrics(): Promise<Performance>;
}

export class MemStorage implements IStorage {
  private intents: Map<string, Intent>;
  private vaults: Map<string, Vault>;
  private transactions: Map<string, Transaction>;
  private faqs: Map<string, FAQ>;

  constructor() {
    this.intents = new Map();
    this.vaults = new Map();
    this.transactions = new Map();
    this.faqs = new Map();
    
    // Initialize with mock data (async, will complete after constructor)
    this.initializeAsync();
  }

  private async initializeAsync() {
    await this.initializeMockData();
  }

  private async initializeMockData() {
    // Mock Intents - using dynamic import for ES module compatibility
    try {
      const { generateMockIntents } = await import("./mock-intents");
      const mockIntents = generateMockIntents();
      mockIntents.forEach((intent: Intent) => this.intents.set(intent.id, intent));
    } catch (e) {
      console.log("Could not load mock intents");
    }

    // Mock Vaults
    const mockVaults: Vault[] = [
      {
        id: "vault-1",
        name: "High Yield ETH",
        protocol: "Lido Finance",
        tokenSymbol: "stETH",
        apy: 4.2,
        tvl: "$1.2B",
        userStaked: "0",
        riskLevel: "low",
        description: "Stake ETH and earn rewards while maintaining liquidity with stETH",
        logoUrl: "/vaults/lido.png",
      },
      {
        id: "vault-2",
        name: "USDC Lending",
        protocol: "Aave V3",
        tokenSymbol: "aUSDC",
        apy: 3.8,
        tvl: "$850M",
        userStaked: "0",
        riskLevel: "low",
        description: "Supply USDC to Aave and earn stable interest on your stablecoins",
        logoUrl: "/vaults/aave.png",
      },
      {
        id: "vault-3",
        name: "BTC Strategy",
        protocol: "Compound",
        tokenSymbol: "cWBTC",
        apy: 2.5,
        tvl: "$420M",
        userStaked: "0",
        riskLevel: "medium",
        description: "Lend WBTC and earn yield on your Bitcoin holdings",
        logoUrl: "/vaults/compound.png",
      },
      {
        id: "vault-4",
        name: "DeFi Blue Chip",
        protocol: "Yearn Finance",
        tokenSymbol: "yvDAI",
        apy: 5.6,
        tvl: "$320M",
        userStaked: "0",
        riskLevel: "medium",
        description: "Automated yield farming strategy across multiple DeFi protocols",
        logoUrl: "/vaults/yearn.png",
      },
      {
        id: "vault-5",
        name: "Aggressive Growth",
        protocol: "Convex Finance",
        tokenSymbol: "cvxCRV",
        apy: 12.4,
        tvl: "$180M",
        userStaked: "0",
        riskLevel: "high",
        description: "High-risk, high-reward strategy with boosted CRV rewards",
        logoUrl: "/vaults/convex.png",
      },
      {
        id: "vault-6",
        name: "Stablecoin Farm",
        protocol: "Curve Finance",
        tokenSymbol: "3CRV",
        apy: 4.1,
        tvl: "$950M",
        userStaked: "0",
        riskLevel: "low",
        description: "Low-risk stablecoin pool with trading fees and CRV rewards",
        logoUrl: "/vaults/curve.png",
      },
    ];

    mockVaults.forEach(vault => this.vaults.set(vault.id, vault));

    // Mock FAQs
    const mockFAQs: FAQ[] = [
      {
        id: "faq-1",
        question: "What is IntentX?",
        answer: "IntentX is a multi-chain DeFi aggregation platform that allows you to execute complex DeFi strategies using natural language. Simply describe what you want to do, and our system will parse your intent and execute it across multiple protocols.",
        category: "General",
      },
      {
        id: "faq-2",
        question: "How does intent execution work?",
        answer: "When you submit an intent in natural language, our AI parser breaks it down into executable steps. These steps are then routed to the appropriate DeFi protocols (like Uniswap for swaps, Aave for lending, etc.) and executed in a single transaction batch for optimal gas efficiency.",
        category: "Intent Lab",
      },
      {
        id: "faq-3",
        question: "Which networks are supported?",
        answer: "IntentX currently supports BlockDAG Testnet, Ethereum (Goerli), Polygon (Mumbai), and local Hardhat networks for testing. We're actively working on adding support for Ethereum Mainnet, Polygon, Arbitrum, and Optimism.",
        category: "Networks",
      },
      {
        id: "faq-4",
        question: "Is my wallet safe?",
        answer: "Yes! IntentX never stores your private keys. We use standard Web3 wallet connections (MetaMask, WalletConnect) that keep your keys secure in your own wallet. All transactions require your explicit approval before execution.",
        category: "Security",
      },
      {
        id: "faq-5",
        question: "What are the fees?",
        answer: "IntentX charges a small protocol fee (0.1% of transaction value) to sustain development. You'll also pay standard gas fees for blockchain transactions. Our batching technology helps reduce overall gas costs compared to executing transactions individually.",
        category: "Fees",
      },
      {
        id: "faq-6",
        question: "How are vaults audited?",
        answer: "All vaults on IntentX integrate with established DeFi protocols (Aave, Compound, Lido, etc.) that have undergone extensive security audits. We only list protocols with proven track records and active bug bounty programs.",
        category: "Vaults",
      },
      {
        id: "faq-7",
        question: "Can I withdraw anytime?",
        answer: "Yes, you can withdraw your funds from vaults at any time. There are no lock-up periods on IntentX. However, some underlying protocols may have small withdrawal fees or cooldown periods.",
        category: "Vaults",
      },
      {
        id: "faq-8",
        question: "What is Account Abstraction?",
        answer: "Account Abstraction (AA) allows for gasless transactions and improved UX. With AA, we can sponsor gas fees for certain transactions, enable batched operations, and provide a smoother onboarding experience for new users.",
        category: "Advanced",
      },
    ];

    mockFAQs.forEach(faq => this.faqs.set(faq.id, faq));
  }

  // Intent operations
  async createIntent(insertIntent: InsertIntent): Promise<Intent> {
    const id = randomUUID();
    const intent: Intent = {
      id,
      naturalLanguage: insertIntent.naturalLanguage,
      parsedSteps: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.intents.set(id, intent);
    return intent;
  }

  async getIntent(id: string): Promise<Intent | undefined> {
    return this.intents.get(id);
  }

  async getAllIntents(): Promise<Intent[]> {
    return Array.from(this.intents.values());
  }

  async updateIntent(id: string, updates: Partial<Intent>): Promise<Intent | undefined> {
    const intent = this.intents.get(id);
    if (!intent) return undefined;
    
    const updated = { ...intent, ...updates };
    this.intents.set(id, updated);
    return updated;
  }

  // Vault operations
  async getAllVaults(): Promise<Vault[]> {
    return Array.from(this.vaults.values());
  }

  async getVault(id: string): Promise<Vault | undefined> {
    return this.vaults.get(id);
  }

  async updateVault(id: string, updates: Partial<Vault>): Promise<Vault | undefined> {
    const vault = this.vaults.get(id);
    if (!vault) return undefined;
    
    const updated = { ...vault, ...updates };
    this.vaults.set(id, updated);
    return updated;
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = { id, ...transaction };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values());
    return allTransactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  // FAQ operations
  async getAllFAQs(): Promise<FAQ[]> {
    return Array.from(this.faqs.values());
  }

  // Analytics operations
  async getAnalyticsSummary(): Promise<AnalyticsData> {
    const transactions = await this.getAllTransactions();
    return {
      totalVolume: "$1,234,567",
      totalTransactions: transactions.length,
      totalGasSaved: "2.45 ETH",
      avgExecutionTime: 1.8,
      volumeHistory: this.generateMockVolumeHistory(),
      gasHistory: this.generateMockGasHistory(),
    };
  }

  async getDetailedAnalytics(): Promise<AnalyticsData> {
    return this.getAnalyticsSummary();
  }

  private generateMockVolumeHistory() {
    const days = 30;
    const history = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.floor(Math.random() * 50000) + 10000,
      });
    }
    return history;
  }

  private generateMockGasHistory() {
    const days = 30;
    const history = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gas: Math.random() * 0.1 + 0.05,
      });
    }
    return history;
  }

  // Performance operations
  async getPerformanceMetrics(): Promise<Performance> {
    return {
      latency: Math.random() * 500 + 1000,
      gasEstimate: (Math.random() * 0.01 + 0.002).toFixed(6) + " ETH",
      optimizationScore: Math.floor(Math.random() * 20) + 80,
      source: "mock",
    };
  }
}

export const storage = new MemStorage();
