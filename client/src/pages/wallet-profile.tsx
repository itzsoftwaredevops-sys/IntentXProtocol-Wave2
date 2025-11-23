import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ExternalLink } from "lucide-react";

export default function WalletProfile() {
  // Mock wallet data
  const mockWallet = {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    balance: "2.5 ETH",
    usdValue: "$4,250.00",
    network: "Ethereum",
    lastTransaction: "1 hour ago",
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-wallet">
            Wallet Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your connected wallet and view transaction history
          </p>
        </div>

        {/* Connected Wallet Card */}
        <Card className="p-6 space-y-4 border-2">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Connected Wallet</h2>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Wallet Address</label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted p-2 rounded flex-1 font-mono text-foreground">
                  {mockWallet.address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-copy-address"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Balance</label>
                <p className="text-2xl font-bold text-foreground">{mockWallet.balance}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">USD Value</label>
                <p className="text-2xl font-bold text-primary">{mockWallet.usdValue}</p>
              </div>
            </div>

            {/* Network */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Network</label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-foreground font-medium">{mockWallet.network}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="default" className="flex-1" data-testid="button-view-explorer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              <Button variant="outline" className="flex-1" data-testid="button-disconnect">
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </Card>

        {/* Assets */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Assets</h2>

          <div className="space-y-3">
            {[
              { symbol: "ETH", name: "Ethereum", amount: "2.5", price: "$4,250" },
              { symbol: "USDC", name: "USD Coin", amount: "5,000", price: "$5,000" },
              { symbol: "stETH", name: "Staked Ethereum", amount: "1.2", price: "$2,040" },
            ].map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate"
                data-testid={`asset-${asset.symbol.toLowerCase()}`}
              >
                <div>
                  <p className="font-semibold text-foreground">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.amount} {asset.symbol}</p>
                </div>
                <p className="font-bold text-foreground">{asset.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
