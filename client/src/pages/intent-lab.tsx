import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Sparkles, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Intent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IntentLab() {
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const { toast } = useToast();

  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', '/api/intent/parse', { naturalLanguage: text });
    },
    onSuccess: (data: Intent) => {
      setCurrentIntent(data);
      toast({
        title: "Intent Parsed",
        description: `Found ${data.parsedSteps.length} steps to execute`,
      });
    },
    onError: () => {
      toast({
        title: "Parse Failed",
        description: "Could not understand the intent. Try rephrasing.",
        variant: "destructive",
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (intentId: string) => {
      return apiRequest('POST', '/api/intent/execute', { intentId });
    },
    onSuccess: (data: Intent) => {
      setCurrentIntent(data);
      toast({
        title: "Execution Complete",
        description: "Your intent was executed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Execution Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleParse = () => {
    if (naturalLanguage.trim()) {
      parseMutation.mutate(naturalLanguage);
    }
  };

  const handleExecute = () => {
    if (currentIntent?.id) {
      executeMutation.mutate(currentIntent.id);
    }
  };

  const getStepIcon = (action: string) => {
    return <Sparkles className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'executing': case 'simulating': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Intent Lab</h1>
          <p className="text-muted-foreground">Describe what you want to do in plain English, and we'll handle the rest</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="bg-card border-card-border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Your Intent</h2>
              <p className="text-sm text-muted-foreground">
                Example: "Swap 100 USDC for ETH on Uniswap and stake it in Lido"
              </p>
            </div>

            <Textarea
              placeholder="Swap 100 USDC for ETH on Uniswap..."
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              className="min-h-[200px] font-mono text-base resize-none bg-muted/50 border-border focus:border-primary"
              data-testid="input-intent"
            />

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleParse}
                disabled={!naturalLanguage.trim() || parseMutation.isPending}
                data-testid="button-parse"
              >
                {parseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse Intent
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNaturalLanguage("");
                  setCurrentIntent(null);
                }}
                data-testid="button-clear"
              >
                Clear
              </Button>
            </div>

            {/* Quick Examples */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">Quick Examples:</p>
              <div className="space-y-2">
                {[
                  "Swap 50 USDC for ETH on Uniswap",
                  "Supply 1000 DAI to Aave lending pool",
                  "Stake 2 ETH in the High Yield vault",
                ].map((example, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left font-mono text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setNaturalLanguage(example)}
                    data-testid={`example-${idx}`}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="bg-card border-card-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Execution Preview</h2>
                <p className="text-sm text-muted-foreground">Review before executing</p>
              </div>
              {currentIntent && getStatusIcon(currentIntent.status)}
            </div>

            {parseMutation.isPending ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 bg-muted/50 rounded-lg p-4 border border-muted space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-48" />
                        <div className="h-3 bg-muted rounded w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentIntent ? (
              <div className="space-y-4">
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={
                    currentIntent.status === 'completed'
                      ? 'bg-green-900/20 text-green-400 border-green-800'
                      : currentIntent.status === 'failed'
                      ? 'bg-red-900/20 text-red-400 border-red-800'
                      : currentIntent.status === 'executing' || currentIntent.status === 'simulating'
                      ? 'bg-blue-900/20 text-blue-400 border-blue-800'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }
                  data-testid="intent-status"
                >
                  {currentIntent.status}
                </Badge>

                {/* Steps */}
                <div className="space-y-3">
                  {currentIntent.parsedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3" data-testid={`intent-step-${idx}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1 bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          {getStepIcon(step.action)}
                          <span className="font-medium text-foreground capitalize" data-testid={`step-action-${idx}`}>{step.action}</span>
                          <Badge variant="secondary" className="text-xs" data-testid={`step-protocol-${idx}`}>
                            {step.protocol}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          {step.tokenIn && (
                            <p className="text-muted-foreground">
                              From: <span className="font-mono text-foreground" data-testid={`step-token-in-${idx}`}>{step.tokenIn}</span>
                            </p>
                          )}
                          {step.tokenOut && (
                            <p className="text-muted-foreground">
                              To: <span className="font-mono text-foreground" data-testid={`step-token-out-${idx}`}>{step.tokenOut}</span>
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            Amount: <span className="font-mono text-foreground" data-testid={`step-amount-${idx}`}>{step.amount}</span>
                          </p>
                          {step.estimatedGas && (
                            <p className="text-muted-foreground">
                              Gas: <span className="font-mono text-foreground" data-testid={`step-gas-${idx}`}>{step.estimatedGas} ETH</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {idx < currentIntent.parsedSteps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Steps</span>
                    <span className="font-mono text-foreground">{currentIntent.parsedSteps.length}</span>
                  </div>
                  {currentIntent.totalGasEstimate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Gas</span>
                      <span className="font-mono text-foreground">{currentIntent.totalGasEstimate} ETH</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Execution Time</span>
                    <span className="font-mono text-green-400">~1.8s</span>
                  </div>
                </div>

                {/* Execute Button */}
                {currentIntent.status === 'parsed' && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleExecute}
                    disabled={executeMutation.isPending}
                    data-testid="button-execute"
                  >
                    {executeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Execute Intent
                      </>
                    )}
                  </Button>
                )}

                {currentIntent.txHash && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Transaction Hash</p>
                    <a
                      href={`https://explorer.blockdag-testnet.example/tx/${currentIntent.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-400 bg-muted px-3 py-1 rounded hover:text-blue-300 inline-block"
                      data-testid="link-intent-tx"
                    >
                      {currentIntent.txHash}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-center">
                <div>
                  <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Enter an intent and click Parse to preview</p>
                  <p className="text-sm text-muted-foreground mt-2">Your execution plan will appear here</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
