import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  trend?: { value: number; label?: string };
  alert?: boolean;
  className?: string;
  "data-ocid"?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-primary",
  trend,
  alert,
  className,
  "data-ocid": dataOcid,
}: KPICardProps) {
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;

  return (
    <Card
      data-ocid={dataOcid}
      className={cn(
        "relative overflow-hidden p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md",
        alert && "ring-1 ring-destructive/40",
        className,
      )}
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 bg-primary" />

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </p>
        <span
          className={cn("shrink-0 rounded-lg p-1.5 bg-muted/60", iconColor)}
        >
          {icon}
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span
          className={cn(
            "text-2xl font-bold font-display leading-none",
            alert && "text-destructive",
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium mb-0.5",
              trendPositive && "text-success",
              trendNegative && "text-destructive",
              !trendPositive && !trendNegative && "text-muted-foreground",
            )}
          >
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
      {trend?.label && !subtitle && (
        <p className="text-xs text-muted-foreground">{trend.label}</p>
      )}
    </Card>
  );
}
