import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Bell, Lock, Zap } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-settings">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your IntentX experience
          </p>
        </div>

        {/* Notification Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: "Intent Execution", description: "Notify when intents are executed" },
              { label: "Transaction Completed", description: "Notify when transactions complete" },
              { label: "Price Alerts", description: "Alert on significant price changes" },
              { label: "Email Notifications", description: "Receive updates via email" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
                data-testid={`setting-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked data-testid={`toggle-${item.label.toLowerCase()}`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: "Auto-lock Wallet", description: "Lock wallet after 5 minutes of inactivity" },
              { label: "Require Approval", description: "Require approval for transactions over $1,000" },
              { label: "Data Analytics", description: "Share usage data to improve the platform" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
                data-testid={`privacy-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={item.label !== "Data Analytics"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Gas Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Gas Settings</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Gas Price Strategy</label>
              <div className="flex gap-2">
                {["Standard", "Fast", "Instant"].map((strategy) => (
                  <Button
                    key={strategy}
                    variant={strategy === "Standard" ? "default" : "outline"}
                    size="sm"
                    data-testid={`button-gas-${strategy.toLowerCase()}`}
                  >
                    {strategy}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Standard gas price for optimal balance between cost and speed
              </p>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account</h2>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" data-testid="button-export-data">
              Export Account Data
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-reset-settings">
              Reset to Defaults
            </Button>
            <Button variant="destructive" className="w-full" data-testid="button-delete-account">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
