import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, ExternalLink, Copy, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NETWORKS = {
  'BlockDAG Testnet': 'https://explorer.blockdag-testnet.example/address/',
  'Ethereum Goerli': 'https://goerli.etherscan.io/address/',
  'Polygon Mumbai': 'https://mumbai.polygonscan.com/address/',
  'Hardhat Local': '#',
};

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState("BlockDAG Testnet");
  const { toast } = useToast();

  const connectWallet = async () => {
    // Simulated wallet connection
    // In production, this would use ethers.js or wagmi to connect to MetaMask
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    const mockBalance = "1.234";
    
    setAddress(mockAddress);
    setBalance(mockBalance);
    setIsConnected(true);
    
    toast({
      title: "Wallet Connected",
      description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
    });
  };

  const disconnectWallet = () => {
    setAddress("");
    setBalance("0");
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" data-testid="button-wallet-connected">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Details</DialogTitle>
            <DialogDescription>Your connected wallet information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-foreground flex-1 truncate" data-testid="text-wallet-address">
                    {address}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={copyAddress}
                    data-testid="button-copy-address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className="text-2xl font-bold font-mono text-foreground" data-testid="text-wallet-balance">{balance} ETH</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const explorerUrl = (NETWORKS[network as keyof typeof NETWORKS] || NETWORKS['BlockDAG Testnet']) + address;
                  window.open(explorerUrl, '_blank');
                }}
                data-testid="button-view-explorer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={disconnectWallet}
                data-testid="button-disconnect"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="button-connect-wallet">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet provider to connect to IntentX
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 hover-elevate"
            onClick={connectWallet}
            data-testid="button-connect-metamask"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">MetaMask</p>
                <p className="text-sm text-muted-foreground">Connect using MetaMask</p>
              </div>
              <Badge variant="secondary">Popular</Badge>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 hover-elevate"
            onClick={connectWallet}
            data-testid="button-connect-walletconnect"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">WalletConnect</p>
                <p className="text-sm text-muted-foreground">Scan with mobile wallet</p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
