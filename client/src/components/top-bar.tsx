import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NetworkSelector } from "./network-selector";
import { WalletConnect } from "./wallet-connect";
import { ThemeToggle } from "./theme-toggle";
import { AISupportAgent } from "./ai-support-agent";

interface TopBarProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export function TopBar({ onMenuClick, isMenuOpen }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          data-testid="button-topbar-menu"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <AISupportAgent />
          <ThemeToggle />
          <NetworkSelector />
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}

export function DesktopTopBar() {
  return (
    <div className="hidden md:flex sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 items-center justify-end gap-3 px-6">
      <AISupportAgent />
      <ThemeToggle />
      <NetworkSelector />
      <WalletConnect />
    </div>
  );
}
