import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Building2, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { type ReactNode, useState } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
  userName?: string;
  onLogout?: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export function Layout({
  children,
  activeRoute,
  onNavigate,
  userName,
  onLogout,
  isDark,
  onToggleDark,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />

      {/* Mobile drawer */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-border bg-card shadow-xs"
          data-ocid="layout.header"
        >
          {/* Mobile hamburger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-foreground/70"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            data-ocid="layout.mobile_menu_button"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-1.5 mr-auto">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-bold font-display text-sm">HVAC Pro</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground mr-auto">
            <span className="font-medium text-foreground capitalize">
              {activeRoute.replace(/-/g, " ")}
            </span>
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground/60 hover:text-foreground relative"
              aria-label="Notifications"
              data-ocid="layout.notifications_button"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
            </Button>

            {onToggleDark && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/60 hover:text-foreground"
                onClick={onToggleDark}
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                data-ocid="layout.theme_toggle"
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}

            {userName && (
              <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
                <span className="hidden sm:block text-xs text-muted-foreground max-w-[120px] truncate">
                  {userName}
                </span>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center",
                  )}
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            )}

            {onLogout && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/60 hover:text-destructive"
                onClick={onLogout}
                aria-label="Log out"
                data-ocid="layout.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
