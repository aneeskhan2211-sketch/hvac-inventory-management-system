import { cn } from "@/lib/utils";

type StatusVariant =
  | "active"
  | "inactive"
  | "discontinued"
  | "open"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "draft"
  | "submitted"
  | "confirmed"
  | "partial"
  | "received"
  | "critical"
  | "warning"
  | "info"
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "maintenance"
  | "decommissioned"
  | "on-leave"
  | "pending"
  | "commercial"
  | "residential"
  | "industrial"
  | "standard"
  | "premium"
  | "enterprise"
  | string;

const variantStyles: Record<string, string> = {
  // Generic states
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  discontinued: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/15 text-warning border-warning/30",

  // Work order / job
  open: "bg-primary/15 text-primary border-primary/30",
  "in-progress": "bg-chart-1/15 text-chart-1 border-chart-1/30",
  "on-hold": "bg-warning/15 text-warning border-warning/30",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",

  // PO statuses
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/15 text-primary border-primary/30",
  confirmed: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  partial: "bg-warning/15 text-warning border-warning/30",
  received: "bg-success/15 text-success border-success/30",

  // Severity
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  info: "bg-primary/10 text-primary border-primary/20",

  // Priority
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",

  // Equipment
  maintenance: "bg-warning/15 text-warning border-warning/30",
  decommissioned: "bg-muted text-muted-foreground border-border",

  // Personnel
  "on-leave": "bg-muted text-muted-foreground border-border",

  // Customer types
  commercial: "bg-primary/10 text-primary border-primary/20",
  residential: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  industrial: "bg-chart-2/10 text-chart-2 border-chart-2/20",

  // Service levels
  standard: "bg-muted text-muted-foreground border-border",
  premium: "bg-accent/15 text-accent border-accent/30",
  enterprise: "bg-primary/15 text-primary border-primary/30",
};

function getLabel(status: string): string {
  return status
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  label,
  className,
  size = "sm",
}: StatusBadgeProps) {
  const styles =
    variantStyles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium rounded-full leading-none",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        styles,
        className,
      )}
    >
      {label ?? getLabel(status)}
    </span>
  );
}
