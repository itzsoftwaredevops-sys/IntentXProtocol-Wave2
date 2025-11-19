import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Network, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Network as NetworkType } from "@shared/schema";

const NETWORKS: NetworkType[] = [
  {
    id: "blockdag-testnet",
    name: "BlockDAG Testnet",
    chainId: 99999,
    rpcUrl: "https://rpc.blockdag-testnet.example",
    explorerUrl: "https://explorer.blockdag-testnet.example",
    nativeCurrency: { name: "BlockDAG", symbol: "BDAG", decimals: 18 },
    color: "text-cyan-400",
    isTestnet: true,
  },
  {
    id: "ethereum-goerli",
    name: "Ethereum Goerli",
    chainId: 5,
    rpcUrl: "https://goerli.infura.io/v3/",
    explorerUrl: "https://goerli.etherscan.io",
    nativeCurrency: { name: "Goerli Ether", symbol: "ETH", decimals: 18 },
    color: "text-indigo-400",
    isTestnet: true,
  },
  {
    id: "polygon-mumbai",
    name: "Polygon Mumbai",
    chainId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorerUrl: "https://mumbai.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    color: "text-purple-400",
    isTestnet: true,
  },
  {
    id: "localhost",
    name: "Hardhat Local",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    explorerUrl: "",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "text-amber-400",
    isTestnet: true,
  },
];

export function NetworkSelector() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(NETWORKS[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-network-selector">
          <Network className="w-4 h-4" />
          <span className="hidden sm:inline">{selectedNetwork.name}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => setSelectedNetwork(network)}
            className="flex items-center justify-between cursor-pointer"
            data-testid={`network-${network.id}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${network.color} bg-current`} />
              <div>
                <p className="font-medium">{network.name}</p>
                <p className="text-xs text-muted-foreground">Chain ID: {network.chainId}</p>
              </div>
            </div>
            {selectedNetwork.id === network.id && (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Badge variant="outline" className="text-xs">
            Testnet Mode
          </Badge>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
