import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  TrendingUp,
  Zap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExecutionLog {
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
}

interface Intent {
  id: string;
  naturalLanguage: string;
  owner: string;
  tokenIn?: string;
  tokenOut?: string;
  amount: string;
  slippage?: string;
  createdAt: string;
  executedAt?: string;
  status: "draft" | "parsing" | "parsed" | "simulating" | "executing" | "completed" | "failed";
  gasUsed?: string;
  txHash?: string;
  executionRoute?: string;
  parsedSteps?: Array<{
    action: string;
    protocol: string;
    tokenIn?: string;
    tokenOut?: string;
    amount: string;
    estimatedGas?: string;
  }>;
  logs?: ExecutionLog[];
}

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  executing: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: <Zap className="w-4 h-4" />,
  },
  parsed: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: <Clock className="w-4 h-4" />,
  },
  failed: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  simulating: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  parsing: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    icon: <FileText className="w-4 h-4" />,
  },
  draft: {
    bg: "bg-gray-400/10",
    text: "text-gray-500 dark:text-gray-500",
    icon: <FileText className="w-4 h-4" />,
  },
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  executing: "Executing",
  parsed: "Parsed",
  failed: "Failed",
  simulating: "Simulating",
  parsing: "Parsing",
  draft: "Draft",
};

export default function ExecutionExplorer() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTokenPair, setSelectedTokenPair] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Fetch intents
  const { data: intentsData, isLoading } = useQuery<Intent[]>({
    queryKey: ["/api/intents"],
  });

  const intents = intentsData || [];

  // Get unique token pairs for filter
  const uniqueTokenPairs = useMemo(() => {
    const pairs = new Set<string>();
    intents.forEach((intent) => {
      if (intent.tokenIn && intent.tokenOut) {
        pairs.add(`${intent.tokenIn}/${intent.tokenOut}`);
      }
    });
    return Array.from(pairs).sort();
  }, [intents]);

  // Filter intents
  const filteredIntents = useMemo(() => {
    return intents.filter((intent) => {
      if (selectedStatus !== "all" && intent.status !== selectedStatus) {
        return false;
      }

      if (
        selectedTokenPair &&
        `${intent.tokenIn}/${intent.tokenOut}` !== selectedTokenPair
      ) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !intent.id.toLowerCase().includes(query) &&
          !intent.owner.toLowerCase().includes(query) &&
          !intent.naturalLanguage.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (dateFilter) {
        const intentDate = new Date(intent.createdAt).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        if (intentDate !== filterDate) {
          return false;
        }
      }

      return true;
    });
  }, [intents, selectedStatus, selectedTokenPair, searchQuery, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredIntents.length / ITEMS_PER_PAGE);
  const paginatedIntents = filteredIntents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedIntent = intents.find((i) => i.id === selectedIntentId);

  const getStatusColor = (status: string) => STATUS_COLORS[status] || STATUS_COLORS.draft;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-explorer-title">
            Execution Explorer
          </h1>
          <p className="text-muted-foreground">
            Track and analyze all intent executions across the network
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4 md:p-6" data-testid="stat-total-intents">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Total Intents</div>
            <div className="text-2xl md:text-3xl font-bold">{intents.length}</div>
          </Card>
          <Card className="p-4 md:p-6" data-testid="stat-completed">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              {intents.filter((i) => i.status === "completed").length}
            </div>
          </Card>
          <Card className="p-4 md:p-6" data-testid="stat-executing">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Executing</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {intents.filter((i) => i.status === "executing").length}
            </div>
          </Card>
          <Card className="p-4 md:p-6" data-testid="stat-failed">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Failed</div>
            <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
              {intents.filter((i) => i.status === "failed").length}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <h2 className="font-semibold text-foreground">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ID, owner..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                data-testid="input-search-explorer"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="executing">Executing</SelectItem>
                <SelectItem value="parsed">Parsed</SelectItem>
                <SelectItem value="simulating">Simulating</SelectItem>
                <SelectItem value="parsing">Parsing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Token Pair Filter */}
            <Select value={selectedTokenPair || "all-pairs"} onValueChange={(value) => {
              setSelectedTokenPair(value === "all-pairs" ? "" : value);
              setCurrentPage(1);
            }}>
              <SelectTrigger data-testid="select-token-pair-filter">
                <SelectValue placeholder="All Token Pairs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pairs">All Token Pairs</SelectItem>
                {uniqueTokenPairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              data-testid="input-date-filter"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStatus("all");
                setSelectedTokenPair("");
                setSearchQuery("");
                setDateFilter("");
                setCurrentPage(1);
              }}
              data-testid="button-reset-filters"
            >
              Reset Filters
            </Button>
            <span className="text-xs text-muted-foreground flex items-center">
              {filteredIntents.length} result{filteredIntents.length !== 1 ? "s" : ""}
            </span>
          </div>
        </Card>

        {/* Intents List */}
        <div className="space-y-4">
          {paginatedIntents.length > 0 ? (
            paginatedIntents.map((intent) => {
              const colors = getStatusColor(intent.status);
              return (
                <Card
                  key={intent.id}
                  className={`p-4 md:p-6 ${colors.bg} border transition-all hover-elevate cursor-pointer`}
                  onClick={() => setSelectedIntentId(intent.id)}
                  data-testid={`card-intent-${intent.id}`}
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={colors.text}>{colors.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-muted-foreground truncate">
                            {intent.id}
                          </div>
                          <div className="text-sm md:text-base font-semibold text-foreground line-clamp-2">
                            {intent.naturalLanguage}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text}`}>
                        {STATUS_LABELS[intent.status]}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                      {intent.tokenIn && intent.tokenOut && (
                        <div data-testid={`detail-token-pair-${intent.id}`}>
                          <div className="text-xs text-muted-foreground mb-1">Token Pair</div>
                          <div className="font-semibold text-foreground">
                            {intent.tokenIn} → {intent.tokenOut}
                          </div>
                        </div>
                      )}

                      {intent.amount && (
                        <div data-testid={`detail-amount-${intent.id}`}>
                          <div className="text-xs text-muted-foreground mb-1">Amount</div>
                          <div className="font-semibold text-foreground">{intent.amount}</div>
                        </div>
                      )}

                      {intent.slippage && (
                        <div data-testid={`detail-slippage-${intent.id}`}>
                          <div className="text-xs text-muted-foreground mb-1">Slippage</div>
                          <div className="font-semibold text-foreground">{intent.slippage}</div>
                        </div>
                      )}

                      {intent.gasUsed && (
                        <div data-testid={`detail-gas-${intent.id}`}>
                          <div className="text-xs text-muted-foreground mb-1">Gas Used</div>
                          <div className="font-semibold text-foreground">{intent.gasUsed}</div>
                        </div>
                      )}

                      <div data-testid={`detail-created-${intent.id}`}>
                        <div className="text-xs text-muted-foreground mb-1">Created</div>
                        <div className="font-semibold text-foreground text-xs">
                          {formatDistanceToNow(new Date(intent.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>

                      {intent.owner && (
                        <div data-testid={`detail-owner-${intent.id}`}>
                          <div className="text-xs text-muted-foreground mb-1">Owner</div>
                          <div className="font-mono text-xs text-foreground truncate">
                            {intent.owner.slice(0, 6)}...{intent.owner.slice(-4)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-3 border-t border-border/50">
                      {intent.txHash && (
                        <div className="text-xs text-muted-foreground">
                          Tx: <span className="font-mono">{intent.txHash.slice(0, 10)}...</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIntentId(intent.id);
                          setShowLogsModal(true);
                        }}
                        data-testid={`button-view-logs-${intent.id}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Logs
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-12 text-center" data-testid="card-no-results">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No intents found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              data-testid="button-pagination-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  data-testid={`button-page-${i + 1}`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-pagination-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="modal-title-logs">Execution Logs</DialogTitle>
          </DialogHeader>

          {selectedIntent && (
            <div className="space-y-6">
              {/* Intent Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Intent Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-foreground">{selectedIntent.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-foreground">
                      {STATUS_LABELS[selectedIntent.status]}
                    </span>
                  </div>
                  {selectedIntent.txHash && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tx Hash:</span>
                      <span className="font-mono text-foreground">{selectedIntent.txHash}</span>
                    </div>
                  )}
                  {selectedIntent.gasUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Used:</span>
                      <span className="font-mono text-foreground">{selectedIntent.gasUsed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Route */}
              {selectedIntent.executionRoute && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Execution Route</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                    {selectedIntent.executionRoute}
                  </div>
                </div>
              )}

              {/* Parsed Steps */}
              {selectedIntent.parsedSteps && selectedIntent.parsedSteps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Execution Steps</h3>
                  <div className="space-y-2">
                    {selectedIntent.parsedSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-3 rounded-lg text-xs space-y-1"
                        data-testid={`log-step-${idx}`}
                      >
                        <div className="font-semibold text-foreground">
                          Step {idx + 1}: {step.action.toUpperCase()}
                        </div>
                        <div className="text-muted-foreground">
                          Protocol: <span className="text-foreground">{step.protocol}</span>
                        </div>
                        {step.tokenIn && step.tokenOut && (
                          <div className="text-muted-foreground">
                            Route: <span className="text-foreground">{step.tokenIn} → {step.tokenOut}</span>
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          Amount: <span className="text-foreground">{step.amount}</span>
                        </div>
                        {step.estimatedGas && (
                          <div className="text-muted-foreground">
                            Est. Gas: <span className="text-foreground">{step.estimatedGas}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Logs */}
              {selectedIntent.logs && selectedIntent.logs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Event Timeline</h3>
                  <div className="space-y-2">
                    {selectedIntent.logs.map((log, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-3 rounded-lg text-xs space-y-1"
                        data-testid={`log-event-${idx}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-foreground">{log.event}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {Object.entries(log.data).length > 0 && (
                          <div className="text-muted-foreground">
                            <div className="font-mono text-foreground bg-background/50 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedIntent.logs || selectedIntent.logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No execution logs available yet</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
