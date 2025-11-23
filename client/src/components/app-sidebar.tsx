import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Home,
  Lightbulb,
  Coins,
  Search,
  BarChart3,
  MessageCircle,
  HelpCircle,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import logoSvg from "@assets/intentx-logo.png";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { path: "/intent-lab", label: "Intent Lab", icon: <Lightbulb className="w-5 h-5" /> },
  { path: "/vaults", label: "Vaults", icon: <Coins className="w-5 h-5" /> },
  { path: "/execution-explorer", label: "Explorer", icon: <Search className="w-5 h-5" /> },
  { path: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
];

const bottomNavItems: NavItem[] = [
  { path: "/ai-assistant", label: "AI Assistant", icon: <MessageCircle className="w-5 h-5" /> },
  { path: "/faq", label: "FAQ", icon: <HelpCircle className="w-5 h-5" /> },
  { path: "/wallet-profile", label: "Wallet", icon: <Wallet className="w-5 h-5" /> },
  { path: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location]);

  const isActive = (path: string) => location === path;

  const sidebarClass = `
    fixed md:static left-0 top-0 h-screen z-50 md:z-0
    bg-background border-r border-border
    transition-all duration-300 ease-out
    flex flex-col
    ${isOpen || showMobileSidebar ? "w-64" : "w-20"}
    ${isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0"}
  `;

  const NavItemComponent = ({ item }: { item: NavItem }) => (
    <Link
      href={item.path}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group
        ${
          isActive(item.path)
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover-elevate"
        }
      `}
      data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex-shrink-0">{item.icon}</div>
      <span
        className={`
          text-sm font-medium transition-all duration-300
          ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:hidden"}
        `}
      >
        {item.label}
      </span>
      {!isOpen && (
        <div
          className="
            absolute left-full ml-2 bg-popover text-popover-foreground
            px-2 py-1 rounded text-xs whitespace-nowrap
            opacity-0 group-hover:opacity-100 transition-opacity
            pointer-events-none z-50
          "
        >
          {item.label}
        </div>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
          data-testid="sidebar-mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClass} data-testid="app-sidebar">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              href="/"
              className="flex items-center gap-2 hover-elevate rounded-lg p-1"
              data-testid="sidebar-logo"
            >
              <img src={logoSvg} alt="IntentX" className="w-8 h-8 flex-shrink-0" />
              {isOpen && (
                <span className="text-lg font-bold text-foreground hidden md:inline">
                  IntentX
                </span>
              )}
            </Link>

            {/* Collapse Button (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex"
              data-testid="button-sidebar-collapse"
            >
              {isOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4 rotate-180" />
              )}
            </Button>

            {/* Close Button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(false)}
              className="md:hidden"
              data-testid="button-sidebar-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-border px-2 py-4 space-y-1">
            {bottomNavItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          data-testid="button-mobile-hamburger"
        >
          {showMobileSidebar ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>
    </>
  );
}
