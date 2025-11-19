import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, DollarSign } from "lucide-react";
import type { Transaction, AnalyticsData } from "@shared/schema";

const getExplorerUrl = (network: string, txHash: string) => {
  const explorers: Record<string, string> = {
    'BlockDAG Testnet': 'https://explorer.blockdag-testnet.example/tx/',
    'Ethereum Goerli': 'https://goerli.etherscan.io/tx/',
    'Polygon Mumbai': 'https://mumbai.polygonscan.com/tx/',
    'Hardhat Local': '#',
  };
  return (explorers[network] || 'https://etherscan.io/tx/') + txHash;
};

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: recentTransactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });

  const stats = [
    {
      label: "Total Volume",
      value: analytics?.totalVolume || "$0",
      change: "+12.5%",
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Transactions",
      value: analytics?.totalTransactions.toString() || "0",
      change: "+8.2%",
      icon: Activity,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Avg Execution Time",
      value: analytics ? `${analytics.avgExecutionTime}s` : "0s",
      change: "-15.3%",
      icon: Zap,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Gas Saved",
      value: analytics?.totalGasSaved || "0 ETH",
      change: "+22.1%",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'pending': case 'simulating': case 'executing': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'failed': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your DeFi activity and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-6 bg-card border-card-border animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-lg bg-muted" />
                <div className="w-16 h-6 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-9 bg-muted rounded w-32" />
              </div>
            </Card>
          ))
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx} className="p-6 bg-card border-card-border hover-elevate transition-all duration-200" data-testid={`stat-card-${idx}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <Badge variant="outline" className="text-green-400 border-green-800 bg-green-900/20" data-testid={`stat-change-${idx}`}>
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold font-mono text-foreground" data-testid={`stat-value-${idx}`}>
                  {stat.value}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-card-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Your latest transactions and intents</p>
        </div>
        <div className="divide-y divide-border">
          {txLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-48" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-6 bg-muted rounded w-20" />
                </div>
              </div>
            ))
          ) : recentTransactions && recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover-elevate transition-all duration-150 flex items-center justify-between"
                data-testid={`transaction-${tx.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()} • {tx.network}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono text-foreground">{tx.amount} {tx.tokenSymbol}</p>
                    {tx.txHash && (
                      <a
                        href={getExplorerUrl(tx.network, tx.txHash)}
                        className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-tx-${tx.id}`}
                      >
                        {tx.txHash.slice(0, 8)}...
                      </a>
                    )}
                  </div>
                  <Badge variant="outline" className={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Your DeFi activity will appear here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
