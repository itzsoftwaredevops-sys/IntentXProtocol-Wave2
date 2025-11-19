import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Unlock, TrendingUp, Shield } from "lucide-react";
import type { Vault } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Vaults() {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(true);
  const { toast } = useToast();

  const { data: vaults, isLoading } = useQuery<Vault[]>({
    queryKey: ['/api/vaults'],
  });

  const stakeMutation = useMutation({
    mutationFn: async ({ vaultId, amount, action }: { vaultId: string; amount: string; action: 'stake' | 'unstake' }) => {
      return apiRequest('POST', '/api/vaults/action', { vaultId, amount, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
      toast({
        title: isStaking ? "Staked Successfully" : "Unstaked Successfully",
        description: `${stakeAmount} tokens ${isStaking ? 'staked' : 'unstaked'} successfully`,
      });
      setSelectedVault(null);
      setStakeAmount("");
    },
    onError: () => {
      toast({
        title: "Transaction Failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (selectedVault && stakeAmount) {
      stakeMutation.mutate({
        vaultId: selectedVault.id,
        amount: stakeAmount,
        action: isStaking ? 'stake' : 'unstake',
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'medium': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'high': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Staking Vaults</h1>
        <p className="text-muted-foreground">Earn yield on your crypto assets with audited DeFi protocols</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="bg-card border-card-border overflow-hidden">
              <div className="p-6 space-y-4 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                  <div className="h-5 bg-muted rounded w-16" />
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-8 bg-muted rounded w-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded w-8" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded w-16" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full" />
              </div>
              <div className="p-4 bg-muted/20 border-t border-border flex gap-2">
                <div className="h-9 bg-muted rounded flex-1" />
                <div className="h-9 bg-muted rounded flex-1" />
              </div>
            </Card>
          ))
        ) : vaults && vaults.length > 0 ? (
          vaults.map((vault) => (
            <Card key={vault.id} className="bg-card border-card-border overflow-hidden hover-elevate transition-all duration-200" data-testid={`vault-card-${vault.id}`}>
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{vault.name}</h3>
                      <p className="text-sm text-muted-foreground">{vault.protocol}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getRiskColor(vault.riskLevel)}>
                    {vault.riskLevel}
                  </Badge>
                </div>

                {/* APY Display */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">APY</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400 font-mono">{vault.apy}%</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">TVL</p>
                    <p className="font-mono text-foreground font-medium">{vault.tvl}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your Stake</p>
                    <p className="font-mono text-foreground font-medium">{vault.userStaked} {vault.tokenSymbol}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">{vault.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-muted/30 border-t border-border flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedVault(vault);
                    setIsStaking(true);
                  }}
                  data-testid={`button-stake-${vault.id}`}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Stake
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedVault(vault);
                    setIsStaking(false);
                  }}
                  data-testid={`button-unstake-${vault.id}`}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unstake
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="p-12 text-center bg-card border-card-border">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No vaults available</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later for staking opportunities</p>
            </Card>
          </div>
        )}
      </div>

      {/* Stake/Unstake Dialog */}
      <Dialog open={!!selectedVault} onOpenChange={() => setSelectedVault(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isStaking ? 'Stake' : 'Unstake'} {selectedVault?.tokenSymbol}</DialogTitle>
            <DialogDescription>
              {isStaking ? 'Deposit' : 'Withdraw'} tokens {isStaking ? 'to' : 'from'} {selectedVault?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="font-mono pr-20"
                  data-testid="input-stake-amount"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStakeAmount(selectedVault?.userStaked || "0")}
                    data-testid="button-max"
                  >
                    MAX
                  </Button>
                  <span className="text-sm text-muted-foreground">{selectedVault?.tokenSymbol}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Available: {isStaking ? '1000' : selectedVault?.userStaked} {selectedVault?.tokenSymbol}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current APY</span>
                <span className="font-mono text-green-400">{selectedVault?.apy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Gas</span>
                <span className="font-mono text-foreground">~0.003 ETH</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAction}
              disabled={!stakeAmount || stakeMutation.isPending}
              data-testid="button-confirm-action"
            >
              {stakeMutation.isPending ? "Processing..." : isStaking ? "Stake" : "Unstake"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
