import { Card } from "@/components/ui/card";
import { AISupportAgent } from "@/components/ai-support-agent";
import { MessageCircle, Zap } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-ai-assistant">
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Get instant help with intent parsing, strategies, and risk analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col p-6 border-2">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Chat with IntentX AI</h2>
              </div>

              {/* Chat Placeholder - Component handles the actual chat */}
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="space-y-4">
                  <div className="text-6xl">💬</div>
                  <p className="text-muted-foreground">
                    Open the chat widget in the bottom right corner to start chatting with AI
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask about intent strategies, risk analysis, FAQs, and more
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <Card className="p-4 space-y-3" data-testid="card-features">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Features
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  "Intent Explanations",
                  "Strategy Optimization",
                  "Risk Analysis",
                  "FAQ Retrieval",
                  "Gas Optimization",
                  "Market Insights",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-muted-foreground"
                    data-testid={`feature-${feature.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 space-y-3 bg-primary/5 border-primary/20" data-testid="card-tip">
              <h3 className="font-semibold text-foreground">Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Use natural language like "What's the best yield strategy?" or "Swap 100 USDC for ETH" for instant guidance.
              </p>
            </Card>
          </div>
        </div>

        {/* Common Questions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Common Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "How do I parse an intent?", a: "Describe your goal in natural language in Intent Lab" },
              { q: "What are the best vaults?", a: "AI recommends based on your risk profile and goals" },
              { q: "How to minimize gas fees?", a: "Use batching and select BlockDAG testnet" },
              { q: "What's liquidation risk?", a: "Occurs when collateral drops below 80% of borrow value" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-muted hover-elevate cursor-pointer transition-all"
                data-testid={`question-${idx}`}
              >
                <p className="font-medium text-foreground mb-1">{item.q}</p>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
