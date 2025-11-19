import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Zap, BarChart3 } from "lucide-react";
import type { AnalyticsData } from "@shared/schema";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/detailed'],
  });

  const volumeData = analytics?.volumeHistory || [];
  const gasData = analytics?.gasHistory || [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track performance metrics and historical data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-6 bg-card border-card-border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-7 bg-muted rounded w-24" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <>
            <Card className="p-6 bg-card border-card-border" data-testid="metric-volume">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Volume</p>
                  <p className="text-2xl font-bold font-mono text-foreground" data-testid="value-volume">
                    {analytics?.totalVolume || "$0"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-card-border" data-testid="metric-transactions">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Transactions</p>
                  <p className="text-2xl font-bold font-mono text-foreground" data-testid="value-transactions">
                    {analytics?.totalTransactions || "0"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-card-border" data-testid="metric-speed">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Avg Speed</p>
                  <p className="text-2xl font-bold font-mono text-foreground" data-testid="value-speed">
                    {analytics ? `${analytics.avgExecutionTime}s` : "0s"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-card-border" data-testid="metric-gas">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Gas Saved</p>
                  <p className="text-2xl font-bold font-mono text-foreground" data-testid="value-gas">
                    {analytics?.totalGasSaved || "0 ETH"}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <Tabs defaultValue="volume" className="space-y-6">
        <TabsList>
          <TabsTrigger value="volume" data-testid="tab-volume">Volume Over Time</TabsTrigger>
          <TabsTrigger value="gas" data-testid="tab-gas">Gas Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card className="p-6 bg-card border-card-border">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Trading Volume</h3>
              <p className="text-sm text-muted-foreground">Historical volume across all protocols</p>
            </div>
            <div className="h-[400px]" data-testid="chart-volume">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-md">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="flex items-end gap-2">
                        <div className="h-3 bg-muted rounded w-12" />
                        <div className="h-16 bg-muted rounded flex-1 animate-pulse" style={{ height: `${Math.random() * 100 + 50}px` }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : volumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="hsl(262 83% 58%)"
                      strokeWidth={2}
                      fill="url(#volumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gas" className="space-y-4">
          <Card className="p-6 bg-card border-card-border">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Gas Optimization</h3>
              <p className="text-sm text-muted-foreground">Gas costs saved through batching and optimization</p>
            </div>
            <div className="h-[400px]" data-testid="chart-gas">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-md">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="flex items-end gap-2">
                        <div className="h-3 bg-muted rounded w-12" />
                        <div className="h-16 bg-muted rounded flex-1 animate-pulse" style={{ height: `${Math.random() * 100 + 50}px` }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : gasData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gasData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gas"
                      stroke="hsl(173 70% 60%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(173 70% 60%)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
