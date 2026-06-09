import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { AlertRule } from "@/context/MockDataContext";
import { AlertCircle, Bell, CheckCircle, ShoppingCart } from "lucide-react";

export default function AlertsPage() {
  const { alerts } = useMockData();

  const columns: Column<AlertRule>[] = [
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.severity} />,
    },
    {
      key: "sku",
      header: "SKU",
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.sku}</span>
      ),
    },
    {
      key: "partName",
      header: "Part",
      sortable: true,
      accessor: (r) => (
        <span className="font-medium text-sm">{r.partName}</span>
      ),
    },
    {
      key: "location",
      header: "Location",
      accessor: (r) => <span className="text-xs">{r.location}</span>,
    },
    {
      key: "currentStock",
      header: "Current",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs font-bold text-destructive">
          {r.currentStock}
        </span>
      ),
    },
    {
      key: "minStock",
      header: "Min Stock",
      accessor: (r) => <span className="font-mono text-xs">{r.minStock}</span>,
    },
    {
      key: "reorderPoint",
      header: "Reorder At",
      accessor: (r) => (
        <span className="font-mono text-xs">{r.reorderPoint}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => (
        <StatusBadge
          status={r.status}
          label={
            r.status === "active"
              ? "Active"
              : r.status === "acknowledged"
                ? "Acknowledged"
                : "Resolved"
          }
        />
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            data-ocid={`alerts.acknowledge_button.${r.id}`}
          >
            <CheckCircle className="w-3 h-3 mr-0.5" />
            Acknowledge
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            data-ocid={`alerts.reorder_button.${r.id}`}
          >
            <ShoppingCart className="w-3 h-3 mr-0.5" />
            Reorder
          </Button>
        </div>
      ),
    },
  ];

  const critical = alerts.filter(
    (a) => a.severity === "critical" && a.status === "active",
  ).length;
  const warning = alerts.filter(
    (a) => a.severity === "warning" && a.status === "active",
  ).length;
  const acknowledged = alerts.filter((a) => a.status === "acknowledged").length;

  return (
    <div data-ocid="alerts.page" className="space-y-5">
      <PageHeader
        title="Low Stock Alerts"
        description="Reorder automation and threshold management"
        breadcrumbs={[{ label: "Alerts" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="alerts.kpi.critical"
          title="Critical"
          value={critical}
          alert={critical > 0}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="alerts.kpi.warning"
          title="Warning"
          value={warning}
          icon={<Bell className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="alerts.kpi.acknowledged"
          title="Acknowledged"
          value={acknowledged}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="alerts.kpi.total"
          title="Total Alerts"
          value={alerts.length}
          icon={<Bell className="w-4 h-4" />}
        />
      </div>

      {critical > 0 && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm text-destructive">
              Critical Stock Alert — Immediate Action Required
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {critical} part(s) are below minimum stock level. Create purchase
            orders immediately to prevent service disruption.
          </p>
        </Card>
      )}

      <DataTable
        data-ocid="alerts.table"
        columns={columns}
        data={alerts}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search alerts…"
        searchFn={(r, q) =>
          r.partName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
