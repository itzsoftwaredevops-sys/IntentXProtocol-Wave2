interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Knowledge base for support agent
const intentXKnowledge = {
  features: [
    "Natural language intent parsing",
    "Multi-chain DeFi execution",
    "DEX trading, Lending/Borrowing, Staking",
    "Sub-2 second perceived execution",
    "Dark theme UI with optimistic updates",
  ],
  pages: {
    Dashboard:
      "View your portfolio overview with stats cards showing Total Volume, Active Intents, Total Gas Saved, and Average Execution Time. See recent transactions with explorer links.",
    Vaults: "Access 6 staking/lending vaults (ETH Staking, USDC Lending, WETH Staking, DAI Lending, stETH Staking, USDT Lending) with competitive APYs ranging from 5.2% to 18.5%.",
    "Intent Lab":
      "Describe your financial goal in natural language. The system parses it, shows step-by-step preview with gas estimates, and executes with optimistic UI updates.",
    Analytics:
      "View detailed performance metrics including portfolio value trends, protocol distribution charts, transaction volume history, and success rates.",
    FAQ: "Browse frequently asked questions about IntentX features, DeFi concepts, wallet connection, and troubleshooting.",
  },
  networks: [
    "BlockDAG Testnet (primary)",
    "Ethereum Goerli",
    "Polygon Mumbai",
    "Hardhat Local",
  ],
};

// Simple pattern matching for common questions
function generateFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("help")
  ) {
    return "Hello! 👋 I'm the IntentX Support Agent. I can help you with:\n\n• **Intent parsing** - Describe your financial goals in plain English\n• **Vault information** - Learn about our 6 staking/lending vaults\n• **DeFi strategies** - Get advice on swaps, staking, and lending\n• **App navigation** - Guide through Dashboard, Vaults, Intent Lab, Analytics\n\nWhat would you like to know?";
  }

  if (lowerMessage.includes("vault")) {
    return `**Vaults Overview:**\n\nWe offer 6 vaults with competitive APYs:\n\n🔹 **Staking Vaults:**\n• ETH Staking - 5.2% APY\n• WETH Staking - 5.8% APY\n• stETH Staking - 18.5% APY\n\n🔹 **Lending Vaults:**\n• USDC Lending - 7.2% APY\n• DAI Lending - 6.8% APY\n• USDT Lending - 7.5% APY\n\nVisit the **Vaults** page to start earning! 💰`;
  }

  if (lowerMessage.includes("intent") || lowerMessage.includes("parse")) {
    return `**Intent Parsing (Intent Lab):**\n\n1️⃣ Write your goal in plain English\n   Example: "Swap 100 USDC for ETH on Uniswap"\n\n2️⃣ Click "Parse Intent" - the AI breaks it into steps\n\n3️⃣ Review the step-by-step preview with gas estimates\n\n4️⃣ Click "Execute" - processed in ~1.5 seconds\n\n5️⃣ View transaction hash and explorer link\n\nSupported actions: Swap, Stake, Supply, Borrow, Withdraw, Unstake`;
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("chain")) {
    return `**Multi-Chain Support:**\n\nIntentX operates on 4 networks:\n\n🟦 **BlockDAG Testnet** (Primary)\n🟦 **Ethereum Goerli**\n🟦 **Polygon Mumbai**\n🟦 **Hardhat Local** (Development)\n\nSwitch networks using the network selector in the navbar to execute intents on your chosen blockchain!`;
  }

  if (lowerMessage.includes("dashboard")) {
    return `**Dashboard Overview:**\n\nThe Dashboard shows:\n\n📊 **Stats Cards:**\n• Total Volume - All-time DeFi volume\n• Active Intents - Currently executing transactions\n• Total Gas Saved - Optimized execution savings\n• Avg Execution Time - Sub-2 second performance\n\n📈 **Recent Transactions** - Confirmed, pending, or failed\n\n🔗 **Explorer Links** - Click to verify on blockchain`;
  }

  if (lowerMessage.includes("analytics")) {
    return `**Analytics Page:**\n\nView detailed metrics:\n\n📈 **Portfolio Value Chart** - Your holdings over time\n📊 **Protocol Distribution** - Where your assets are deployed\n📉 **Transaction Volume** - Activity trends\n⚡ **Performance Metrics** - Success rates and execution times`;
  }

  if (lowerMessage.includes("gas")) {
    return `**Gas Optimization:**\n\nIntentX optimizes gas through:\n\n⚡ **Batch Processing** - Combine multiple transactions\n⚡ **Multi-hop Routing** - Find efficient swap paths\n⚡ **Smart Routing** - Route through lowest-fee protocols\n\nResult: Sub-2 second perceived execution with minimal gas costs!`;
  }

  if (lowerMessage.includes("swap")) {
    return `**DEX Trading (Swap):**\n\n1️⃣ Go to Intent Lab\n2️⃣ Say: "Swap [amount] [token1] for [token2]"\n   Example: "Swap 100 USDC for WETH"\n3️⃣ Preview shows the route and gas estimate\n4️⃣ Execute - receives quote and processes swap\n5️⃣ View transaction on explorer\n\nSupported: Uniswap-style AMMs on all networks`;
  }

  if (lowerMessage.includes("stake")) {
    return `**Staking in Vaults:**\n\n1️⃣ Go to **Vaults** page\n2️⃣ Select a staking vault (ETH, WETH, stETH)\n3️⃣ Enter amount to stake\n4️⃣ Click "Stake"\n5️⃣ Confirm in wallet\n6️⃣ See updated balance and earning APY\n\nYou earn rewards continuously on your staked amount! 💰`;
  }

  if (lowerMessage.includes("borrow") || lowerMessage.includes("lend")) {
    return `**Lending & Borrowing:**\n\n**Supply (Earn Interest):**\n1️⃣ Select a lending vault\n2️⃣ Supply tokens\n3️⃣ Earn 6-7.5% APY instantly\n\n**Borrow Against Collateral:**\n1️⃣ Supply collateral first (75% LTV)\n2️⃣ Borrow up to 75% of collateral value\n3️⃣ Use borrowed funds or trade\n4️⃣ Repay anytime, pay interest only on outstanding\n\nLow risk, high flexibility!`;
  }

  if (lowerMessage.includes("wallet") || lowerMessage.includes("connect")) {
    return `**MetaMask Connection:**\n\n1️⃣ Click **Connect Wallet** button (top-right navbar)\n2️⃣ MetaMask popup opens\n3️⃣ Select account to connect\n4️⃣ Approve connection\n5️⃣ Your wallet address appears in navbar\n\nNow you can:\n✅ Create intents\n✅ Stake in vaults\n✅ Execute swaps & borrows`;
  }

  if (lowerMessage.includes("faq")) {
    return `**FAQ Section:**\n\nThe FAQ page has comprehensive answers on:\n\n❓ What is IntentX?\n❓ How does intent parsing work?\n❓ What are the supported DeFi primitives?\n❓ Which networks are supported?\n❓ How are transactions optimized?\n❓ What are the security features?\n❓ How do I report issues?\n❓ What's the roadmap?\n\nVisit the FAQ page for full details!`;
  }

  // Default helpful response
  return `I'm the IntentX Support Agent! 🤖\n\nI can help with:\n\n• **Vaults** - Learn about staking/lending opportunities\n• **Intent Lab** - How to create and execute intents\n• **Networks** - Blockchain support\n• **Trading** - Swap, stake, lend, borrow\n• **Dashboard** - Portfolio overview\n• **Analytics** - Performance metrics\n• **Wallet** - MetaMask connection\n\nWhat would you like to know?`;
}

export async function generateSupportResponse(
  userMessage: string,
  _conversationHistory: ConversationMessage[]
): Promise<string> {
  try {
    // Try to use OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = await import("openai").then((m) => m.default);
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = `You are IntentX Support, a knowledgeable AI assistant for the IntentX Protocol - an intent-based DeFi aggregator.

IntentX allows users to express financial goals in natural language and execute them across multiple blockchains (BlockDAG, Ethereum, Polygon). It features DEX trading, Lending/Borrowing, and Staking with sub-2 second perceived execution times.

Key features:
- Dashboard: Portfolio overview, stats, transactions
- Vaults: 6 staking/lending vaults (APY 5.2%-18.5%)
- Intent Lab: Natural language parsing and execution
- Analytics: Performance metrics and charts

Be helpful, concise, and reference specific IntentX features when relevant.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 500,
      });

      return response.choices[0]?.message?.content || generateFallbackResponse(userMessage);
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
  }

  // Fallback to pattern matching
  return generateFallbackResponse(userMessage);
}
