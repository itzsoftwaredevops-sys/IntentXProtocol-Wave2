import { Link, useLocation } from "wouter";
import { Home, Coins, Lightbulb, Search, BarChart3, HelpCircle } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/vaults", label: "Vaults", icon: Coins },
  { path: "/intent-lab", label: "Intent Lab", icon: Lightbulb },
  { path: "/execution-explorer", label: "Explorer", icon: Search },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
];

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
