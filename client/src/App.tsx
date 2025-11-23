import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import Dashboard from "@/pages/dashboard";
import Vaults from "@/pages/vaults";
import IntentLab from "@/pages/intent-lab";
import Analytics from "@/pages/analytics";
import FAQPage from "@/pages/faq";
import ExecutionExplorer from "@/pages/execution-explorer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vaults" component={Vaults} />
      <Route path="/intent-lab" component={IntentLab} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/execution-explorer" component={ExecutionExplorer} />
      <Route path="/faq" component={FAQPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pb-20 md:pb-0">
              <Router />
            </div>
            <MobileNav />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
