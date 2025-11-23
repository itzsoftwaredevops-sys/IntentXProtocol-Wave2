import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import Vaults from "@/pages/vaults";
import IntentLab from "@/pages/intent-lab";
import Analytics from "@/pages/analytics";
import FAQPage from "@/pages/faq";
import ExecutionExplorer from "@/pages/execution-explorer";
import WalletProfile from "@/pages/wallet-profile";
import Settings from "@/pages/settings";
import AIAssistant from "@/pages/ai-assistant";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/intent-lab" component={IntentLab} />
      <Route path="/vaults" component={Vaults} />
      <Route path="/execution-explorer" component={ExecutionExplorer} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/wallet-profile" component={WalletProfile} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
