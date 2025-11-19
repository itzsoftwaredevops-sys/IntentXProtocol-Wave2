import { Link, useLocation } from "wouter";
import { NetworkSelector } from "./network-selector";
import { WalletConnect } from "./wallet-connect";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/vaults", label: "Vaults" },
    { path: "/intent-lab", label: "Intent Lab" },
    { path: "/analytics", label: "Analytics" },
    { path: "/faq", label: "FAQ" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg transition-all" data-testid="link-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">IX</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">IntentX</span>
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(item.path)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover-elevate"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NetworkSelector />
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
