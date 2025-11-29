import fs from "fs";
import path from "path";

interface TokenInfo {
  symbol: string;
  address?: string;
  decimals: number;
  riskTag: string;
}

interface ParsedIntent {
  action: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  minReturn: string;
  route: string[];
  explanation: string;
  source: "mock" | "llm";
  llmConfidence?: number;
  timestamp: string;
}

interface TokenDatabase {
  [key: string]: TokenInfo;
}

let tokenDatabase: TokenDatabase | null = null;

// Load token database
function loadTokenDatabase(): TokenDatabase {
  if (tokenDatabase) return tokenDatabase;

  try {
    const dbPath = path.join(process.cwd(), "server", "data", "tokens.json");
    const data = fs.readFileSync(dbPath, "utf-8");
    tokenDatabase = JSON.parse(data);
    return tokenDatabase;
  } catch (error) {
    console.warn("Could not load token database, using defaults");
    return {
      ETH: { symbol: "ETH", decimals: 18, riskTag: "stable" },
      USDC: { symbol: "USDC", decimals: 6, riskTag: "stable" },
      USDT: { symbol: "USDT", decimals: 6, riskTag: "stable" },
      WETH: { symbol: "WETH", decimals: 18, riskTag: "stable" },
      DAI: { symbol: "DAI", decimals: 18, riskTag: "stable" },
      WBTC: { symbol: "WBTC", decimals: 8, riskTag: "stable" },
    };
  }
}

// Parse intent using deterministic rules
export function parseIntentDeterministic(naturalLanguage: string): ParsedIntent {
  const timestamp = new Date().toISOString();
  const lower = naturalLanguage.toLowerCase();
  const tokens = loadTokenDatabase();

  // Default response
  let action = "unknown";
  let tokenIn = "ETH";
  let tokenOut = "USDC";
  let amount = "1";
  let minReturn = "0.98";
  let route = ["MockDEX"];

  // Action detection (regex-based)
  if (/swap|exchange|trade/.test(lower)) {
    action = "swap";
  } else if (/stake|lock/.test(lower)) {
    action = "stake";
  } else if (/lend|supply|deposit/.test(lower)) {
    action = "supply";
  } else if (/borrow|take.*loan/.test(lower)) {
    action = "borrow";
  }

  // Token extraction (simple regex)
  const tokenMatch = naturalLanguage.match(/(\d+\.?\d*)\s+([A-Z]+)/);
  if (tokenMatch) {
    amount = tokenMatch[1];
    const tokenSymbol = tokenMatch[2].toUpperCase();
    if (tokens[tokenSymbol]) {
      tokenIn = tokenSymbol;
    }
  }

  // Output token detection
  const outputMatch = naturalLanguage.match(
    /(?:for|to|into)\s+([A-Z]+)/i
  );
  if (outputMatch) {
    const outSymbol = outputMatch[1].toUpperCase();
    if (tokens[outSymbol]) {
      tokenOut = outSymbol;
    }
  }

  // Slippage detection
  if (/low.*slip|minimal.*slip/.test(lower)) {
    minReturn = (parseFloat(amount) * 0.99).toString(); // 1% slippage
  } else if (/high.*slip|aggressive/.test(lower)) {
    minReturn = (parseFloat(amount) * 0.95).toString(); // 5% slippage
  } else {
    minReturn = (parseFloat(amount) * 0.98).toString(); // 2% default
  }

  // Route selection
  if (/multiple|split|aggregate/.test(lower)) {
    route = ["MockDEX", "Aggregator"];
  } else {
    route = ["MockDEX"];
  }

  const explanation = `${action === "swap" ? "Swap" : action === "stake" ? "Stake" : action === "supply" ? "Supply" : action === "borrow" ? "Borrow" : "Execute"} ${amount} ${tokenIn} ${
    action === "swap" ? `for ${tokenOut}` : ""
  } with ${route.join(" → ")} route. Max slippage: ${(
    (1 - parseFloat(minReturn) / parseFloat(amount)) *
    100
  ).toFixed(2)}%`;

  const result: ParsedIntent = {
    action,
    tokenIn,
    tokenOut,
    amount,
    minReturn,
    route,
    explanation,
    source: "mock",
    timestamp,
  };

  // Log to parsed intents file
  logParsedIntent(result);

  return result;
}

// Optional: Parse with OpenAI if key exists
export async function parseIntentWithOpenAI(
  naturalLanguage: string
): Promise<ParsedIntent | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Parse DeFi intent from natural language into structured JSON. Return only valid JSON with fields: action (swap/stake/supply/borrow), tokenIn, tokenOut, amount, minReturn, route (array), explanation. Be concise.`,
          },
          {
            role: "user",
            content: naturalLanguage,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error(
        "OpenAI API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = (await response.json()) as any;
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    const result: ParsedIntent = {
      ...parsed,
      source: "llm",
      llmConfidence: 0.85,
      timestamp: new Date().toISOString(),
    };

    logParsedIntent(result);
    return result;
  } catch (error) {
    console.error("OpenAI parsing failed:", error);
    return null;
  }
}

// Log parsed intent to file
function logParsedIntent(intent: ParsedIntent): void {
  try {
    const logPath = path.join(
      process.cwd(),
      "server",
      "data",
      "parsed_intents.json"
    );
    let logs: ParsedIntent[] = [];

    try {
      const existing = fs.readFileSync(logPath, "utf-8");
      logs = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
    }

    logs.push(intent);
    // Keep only last 100 intents
    if (logs.length > 100) logs = logs.slice(-100);

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.warn("Could not log parsed intent:", error);
  }
}

// Main parse function (tries OpenAI first, falls back to deterministic)
export async function parseIntent(
  naturalLanguage: string
): Promise<ParsedIntent> {
  // Try OpenAI if available
  const openaiResult = await parseIntentWithOpenAI(naturalLanguage);
  if (openaiResult) {
    return openaiResult;
  }

  // Fall back to deterministic parsing
  return parseIntentDeterministic(naturalLanguage);
}
