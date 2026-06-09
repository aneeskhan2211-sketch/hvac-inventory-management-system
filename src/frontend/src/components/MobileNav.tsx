import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Building2, X } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function MobileNav({
  open,
  onClose,
  activeRoute,
  onNavigate,
}: MobileNavProps) {
  function handleNav(route: string) {
    onNavigate(route);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        className="p-0 w-72 bg-sidebar border-sidebar-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sidebar-primary" />
            <span className="font-bold font-display text-sidebar-foreground text-sm">
              HVAC Pro IMS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-sidebar-accent/20 text-sidebar-foreground/60"
            aria-label="Close menu"
            data-ocid="mobile_nav.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="p-2 overflow-y-auto" data-ocid="mobile_nav.panel">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                data-ocid={`mobile_nav.${item.route}.link`}
                onClick={() => handleNav(item.route)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/50",
                  )}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
