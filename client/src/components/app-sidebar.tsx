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
}

const mainNavItems: NavItem[] = [
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  }, [location, isMobile]);

  const isActive = (path: string) => location === path;

  const NavItem = ({ item }: { item: NavItem }) => (
    <Link
      href={item.path}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
        ${
          isActive(item.path)
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground hover-elevate"
        }
      `}
      data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
        {item.icon}
      </div>
      {(isExpanded || isMobile) && (
        <span className="text-sm font-medium whitespace-nowrap">
          {item.label}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobileMenu(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? "fixed" : "sticky"}
          top-0 left-0 h-screen z-50 md:z-0
          bg-background border-r border-border
          flex flex-col
          transition-all duration-300 ease-in-out
          ${
            isExpanded || isMobile
              ? "w-64 md:w-64"
              : "w-20"
          }
          ${isMobile && !showMobileMenu ? "-translate-x-full" : "translate-x-0"}
        `}
        data-testid="app-sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border h-16 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 hover-elevate px-2 py-1 rounded transition-all"
            data-testid="sidebar-logo"
          >
            <img src={logoSvg} alt="IntentX" className="w-8 h-8" />
            {(isExpanded || isMobile) && (
              <span className="font-bold text-foreground text-lg truncate">
                IntentX
              </span>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-sidebar-toggle"
              className="h-8 w-8"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "" : "rotate-180"
                }`}
              />
            </Button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(false)}
              data-testid="button-sidebar-close"
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className="border-t border-border px-3 py-4 space-y-2 flex-shrink-0">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Hamburger Button */}
      {isMobile && !showMobileMenu && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMobileMenu(true)}
          className="fixed top-4 left-4 z-40 md:hidden"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
