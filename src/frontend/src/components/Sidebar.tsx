import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode,
  Settings,
  ShoppingCart,
  Truck,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useGoogleAuth } from "../context/GoogleAuthContext";

export interface NavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", route: "dashboard", icon: LayoutDashboard },
  { label: "Parts Catalog", route: "parts", icon: Package },
  { label: "Inventory", route: "inventory", icon: Warehouse },
  { label: "Suppliers", route: "suppliers", icon: Truck },
  { label: "Purchase Orders", route: "purchase-orders", icon: ShoppingCart },
  { label: "Work Orders", route: "work-orders", icon: Wrench },
  { label: "Transactions", route: "transactions", icon: ArrowLeftRight },
  { label: "Alerts", route: "alerts", icon: Bell, badge: 4 },
  { label: "Barcodes", route: "barcodes", icon: QrCode },
  { label: "Maintenance", route: "maintenance", icon: Settings },
  { label: "Reports", route: "reports", icon: FileBarChart },
  { label: "Users", route: "users", icon: Users },
  { label: "Customers", route: "customers", icon: UserCircle },
  { label: "Service Kits", route: "service-kits", icon: Layers },
];

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useGoogleAuth();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-56",
      )}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-sidebar-border px-3 gap-2 overflow-hidden",
        )}
      >
        <Building2 className="w-5 h-5 shrink-0 text-sidebar-primary" />
        {!collapsed && (
          <span className="font-bold font-display text-sidebar-foreground text-sm truncate">
            HVAC Pro IMS
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <button
              key={item.route}
              type="button"
              data-ocid={`sidebar.${item.route}.link`}
              title={collapsed ? item.label : undefined}
              onClick={() => onNavigate(item.route)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg transition-colors duration-150 text-sm font-medium",
                collapsed ? "justify-center p-2" : "px-3 py-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/15 hover:text-sidebar-foreground",
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
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge ? (
                <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 leading-none ml-auto">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div className="p-2 border-t border-sidebar-border">
        {user && !collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg bg-sidebar-accent/10">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-7 h-7 rounded-full shrink-0 border border-sidebar-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserCircle className="w-7 h-7 shrink-0 text-sidebar-foreground/50" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              data-ocid="sidebar.logout_button"
              onClick={logout}
              title="Sign out"
              className="shrink-0 text-sidebar-foreground/40 hover:text-destructive transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {user && collapsed && (
          <button
            type="button"
            data-ocid="sidebar.logout_button"
            onClick={logout}
            title="Sign out"
            className="w-full flex justify-center p-2 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-sidebar-accent/15 transition-colors mb-1"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          data-ocid="sidebar.collapse_toggle"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/15 transition-colors text-xs",
            collapsed ? "justify-center" : "",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
