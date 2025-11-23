import fs from "fs";
import path from "path";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface FAQ {
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  suggestedPrompts: string[];
  strategyHints: Array<{
    title: string;
    description: string;
    riskLevel: string;
  }>;
  riskAlerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  intentExamples: Record<
    string,
    {
      example: string;
      explanation: string;
    }
  >;
}

let knowledgeBase: FAQ | null = null;

function loadKnowledgeBase(): FAQ {
  if (knowledgeBase) return knowledgeBase;

  try {
    const faqPath = path.join(process.cwd(), "server", "faq-knowledge.json");
    const data = fs.readFileSync(faqPath, "utf-8");
    knowledgeBase = JSON.parse(data);
    return knowledgeBase;
  } catch (error) {
    console.warn("Could not load knowledge base, using defaults");
    return {
      faqs: [],
      suggestedPrompts: [
        "Swap 100 USDC for WETH",
        "Stake 10 ETH",
        "What vaults have the best APY?",
      ],
      strategyHints: [],
      riskAlerts: [],
      intentExamples: {},
    };
  }
}

function searchFAQ(query: string): string | null {
  const kb = loadKnowledgeBase();
  const lowerQuery = query.toLowerCase();

  // Direct FAQ match
  const faq = kb.faqs.find((f) =>
    f.question.toLowerCase().includes(lowerQuery)
  );
  if (faq) return faq.answer;

  // Keyword matching
  const keywords = [
    "vault",
    "apy",
    "stake",
    "borrow",
    "swap",
    "network",
    "wallet",
    "gas",
    "security",
  ];
  const matchingKeyword = keywords.find((k) => lowerQuery.includes(k));
  if (matchingKeyword) {
    const relevant = kb.faqs.find((f) =>
      f.question.toLowerCase().includes(matchingKeyword)
    );
    if (relevant) return relevant.answer;
  }

  return null;
}

function generateIntentExplanation(intent: string): string {
  const kb = loadKnowledgeBase();
  const lowerIntent = intent.toLowerCase();

  if (lowerIntent.includes("swap")) {
    const example = kb.intentExamples.swap;
    return example
      ? `💱 **Swap Intent Analysis**\n\n${example.explanation}`
      : "Swap detected. This will exchange one token for another at the best available rate.";
  }

  if (lowerIntent.includes("stake")) {
    const example = kb.intentExamples.stake;
    return example
      ? `🔒 **Staking Intent Analysis**\n\n${example.explanation}`
      : "Staking detected. Your tokens will be locked to earn rewards.";
  }

  if (lowerIntent.includes("borrow") || lowerIntent.includes("supply")) {
    const example = kb.intentExamples.borrow;
    return example
      ? `💰 **Lending Intent Analysis**\n\n${example.explanation}`
      : "Lending detected. You'll supply collateral and potentially borrow against it.";
  }

  if (lowerIntent.includes("optimize") || lowerIntent.includes("strategy")) {
    const example = kb.intentExamples.yield;
    return example
      ? `📊 **Portfolio Optimization**\n\n${example.explanation}`
      : "Portfolio optimization will analyze your holdings and suggest yield improvements.";
  }

  return `📝 **Intent Preview**\n\nYour request appears to be a ${
    lowerIntent.includes("swap")
      ? "swap"
      : lowerIntent.includes("stake")
        ? "staking"
        : "DeFi"
  } operation. Review the step-by-step preview below for details.`;
}

function getStrategyHints(): string {
  const kb = loadKnowledgeBase();
  if (!kb.strategyHints || kb.strategyHints.length === 0) {
    return "Strategy hints unavailable. Check FAQ for detailed guides.";
  }

  const hints = kb.strategyHints
    .map(
      (h) =>
        `**${h.title}** (${h.riskLevel.toUpperCase()} risk)\n${h.description}`
    )
    .join("\n\n");

  return `**Available Strategies:**\n\n${hints}`;
}

function getRiskAlerts(): string {
  const kb = loadKnowledgeBase();
  if (!kb.riskAlerts || kb.riskAlerts.length === 0) {
    return "No active risk alerts.";
  }

  const alerts = kb.riskAlerts
    .map((a) => `⚠️ **${a.type.toUpperCase()}**: ${a.message}`)
    .join("\n");

  return `**Risk Alerts:**\n\n${alerts}`;
}

function getSuggestedPrompts(): string[] {
  const kb = loadKnowledgeBase();
  return kb.suggestedPrompts || [
    "Swap 100 USDC for WETH",
    "Stake 10 ETH",
    "What vaults have the best APY?",
  ];
}

function generateMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // FAQ retrieval
  const faqAnswer = searchFAQ(userMessage);
  if (faqAnswer) {
    return `**FAQ Answer:**\n\n${faqAnswer}`;
  }

  // Strategy recommendations
  if (lowerMessage.includes("strategy") || lowerMessage.includes("optimize")) {
    return getStrategyHints();
  }

  // Risk analysis
  if (
    lowerMessage.includes("risk") ||
    lowerMessage.includes("alert") ||
    lowerMessage.includes("liquidation")
  ) {
    return getRiskAlerts();
  }

  // Intent explanation
  if (
    lowerMessage.includes("swap") ||
    lowerMessage.includes("stake") ||
    lowerMessage.includes("borrow") ||
    lowerMessage.includes("supply")
  ) {
    return generateIntentExplanation(userMessage);
  }

  // Help/greeting
  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi")
  ) {
    return `**Welcome to IntentX Support! 🤖**\n\nI can help with:\n\n• **FAQ** - Browse our knowledge base\n• **Strategies** - Get portfolio optimization hints\n• **Risk Analysis** - Understand potential risks\n• **Intent Explanation** - Understand your DeFi transactions\n• **Vaults Info** - Learn about staking/lending opportunities\n\n**Try asking:**\n- "What's the best yield strategy?"\n- "How do I stake ETH?"\n- "What are the risks of borrowing?"`;
  }

  // APY/Yield questions
  if (lowerMessage.includes("apy") || lowerMessage.includes("yield")) {
    return `**💰 Vault APYs:**\n\n🔹 **Staking Vaults:**\n• ETH Staking: 5.2% APY\n• WETH Staking: 5.8% APY\n• stETH Staking: 18.5% APY\n\n🔹 **Lending Vaults:**\n• USDC Lending: 7.2% APY\n• DAI Lending: 6.8% APY\n• USDT Lending: 7.5% APY\n\nAPYs are variable based on market conditions. Higher APY = higher risk.`;
  }

  // Wallet/Connection
  if (
    lowerMessage.includes("wallet") ||
    lowerMessage.includes("connect") ||
    lowerMessage.includes("metamask")
  ) {
    return `**🔐 Wallet Connection:**\n\n1️⃣ Click **Connect Wallet** button (top-right)\n2️⃣ MetaMask popup opens\n3️⃣ Select your account\n4️⃣ Approve connection\n5️⃣ Your address appears in navbar\n\n✅ Ready to trade!\n\n**Security**: Your private keys stay in MetaMask. IntentX never has access to your funds.`;
  }

  // Networks
  if (lowerMessage.includes("network") || lowerMessage.includes("chain")) {
    return `**🌍 Supported Networks:**\n\n🟦 **BlockDAG Testnet** (Primary)\n🟦 **Ethereum Goerli**\n🟦 **Polygon Mumbai**\n🟦 **Hardhat Local** (Dev)\n\nSwitch networks in the navbar. Each network has its own liquidity and gas prices.`;
  }

  // Gas/Fees
  if (lowerMessage.includes("gas") || lowerMessage.includes("fee")) {
    return `**⚡ Gas Optimization:**\n\nIntentX saves 20-40% gas through:\n\n• **Batching** - Combine multiple operations\n• **Multi-hop routing** - Find efficient swap paths\n• **Smart selection** - Route through lowest-fee protocols\n\n💡 **Tip**: BlockDAG has the lowest fees. Use it for bulk operations.`;
  }

  // Default helpful response
  return `**I'm here to help! 🤖**\n\nI can assist with:\n\n📚 **FAQ** - Browse knowledge base\n📊 **Strategies** - Portfolio optimization tips\n⚠️ **Risk Analysis** - Understand potential dangers\n💡 **Intent Help** - Understand DeFi transactions\n💰 **Vaults** - Staking/lending info\n⚡ **Gas** - Fee optimization tips\n\n**Common questions:** "What's the best APY?" "How do I stake?" "What are the risks?"`;
}

export async function generateSupportResponse(
  userMessage: string,
  _conversationHistory: ConversationMessage[]
): Promise<string> {
  try {
    return generateMockResponse(userMessage);
  } catch (error) {
    console.error("Support Agent Error:", error);
    return "I encountered an issue. Please try again or check the FAQ section.";
  }
}

export function getSuggestedPromptsForUI(): string[] {
  return getSuggestedPrompts();
}

export function getAllFAQs(): Array<{ id: string; question: string; answer: string }> {
  const kb = loadKnowledgeBase();
  return kb.faqs || [];
}
