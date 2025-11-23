import { Intent } from "@shared/schema";
import { randomUUID } from "crypto";

export function generateMockIntents(): Intent[] {
  const tokenPairs = [
    { in: "USDC", out: "WETH" },
    { in: "WETH", out: "USDC" },
    { in: "DAI", out: "USDT" },
    { in: "WETH", out: "stETH" },
    { in: "USDC", out: "DAI" },
  ];

  const protocols = ["Uniswap V3", "Curve", "Aave", "Lido", "Compound"];
  const statuses: Array<Intent["status"]> = [
    "completed",
    "executing",
    "parsed",
    "failed",
    "simulating",
    "parsing",
  ];

  const intents: Intent[] = [];
  const now = new Date();

  for (let i = 0; i < 35; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const pair = tokenPairs[Math.floor(Math.random() * tokenPairs.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];

    const intent: Intent = {
      id: `0x${randomUUID().replace(/-/g, "").slice(0, 40)}`,
      naturalLanguage: `Swap ${Math.floor(Math.random() * 1000) + 10} ${pair.in} for ${pair.out} on ${protocol}`,
      owner: `0x${Math.random().toString(16).substring(2, 42)}`,
      tokenIn: pair.in,
      tokenOut: pair.out,
      amount: `${Math.floor(Math.random() * 10000) + 100}`,
      slippage: `${(Math.random() * 2).toFixed(2)}%`,
      createdAt: createdAt.toISOString(),
      executedAt:
        status === "completed" || status === "executing"
          ? new Date(createdAt.getTime() + Math.random() * 60000).toISOString()
          : undefined,
      status,
      gasUsed:
        status === "completed" || status === "executing"
          ? `${(Math.random() * 0.01 + 0.0001).toFixed(5)} ETH`
          : undefined,
      txHash:
        status === "completed" || status === "failed" || status === "executing"
          ? `0x${Math.random().toString(16).substring(2, 66)}`
          : undefined,
      executionRoute: `${pair.in} (${protocol}) → Optimizer → ${pair.out} Bridge → Destination Chain`,
      parsedSteps: [
        {
          action: "swap",
          protocol,
          tokenIn: pair.in,
          tokenOut: pair.out,
          amount: `${Math.floor(Math.random() * 10000) + 100}`,
          estimatedGas: `${(Math.random() * 0.005 + 0.0005).toFixed(5)} ETH`,
        },
      ],
      logs: [
        {
          timestamp: createdAt.toISOString(),
          event: "IntentCreated",
          data: {
            intentId: `0x${randomUUID().replace(/-/g, "").slice(0, 40)}`,
            user: `0x${Math.random().toString(16).substring(2, 42)}`,
          },
        },
        {
          timestamp: new Date(createdAt.getTime() + 1000).toISOString(),
          event: "IntentParsed",
          data: {
            steps: 1,
            totalGasEstimate: `${(Math.random() * 0.01 + 0.0001).toFixed(5)} ETH`,
          },
        },
        {
          timestamp: new Date(createdAt.getTime() + 5000).toISOString(),
          event: "IntentExecuting",
          data: {
            txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            blockNumber: Math.floor(Math.random() * 10000000),
          },
        },
        ...(status === "completed"
          ? [
              {
                timestamp: new Date(createdAt.getTime() + 15000).toISOString(),
                event: "IntentCompleted",
                data: {
                  gasUsed: `${(Math.random() * 0.01 + 0.0001).toFixed(5)} ETH`,
                  output: `${Math.floor(Math.random() * 100) + 1}`,
                },
              },
            ]
          : []),
        ...(status === "failed"
          ? [
              {
                timestamp: new Date(createdAt.getTime() + 15000).toISOString(),
                event: "IntentFailed",
                data: {
                  reason: "Insufficient liquidity",
                  revertReason: "ERC20: transfer amount exceeds balance",
                },
              },
            ]
          : []),
      ],
    };

    intents.push(intent);
  }

  return intents;
}
