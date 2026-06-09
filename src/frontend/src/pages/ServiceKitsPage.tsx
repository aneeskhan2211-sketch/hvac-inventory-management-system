import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { ServiceKit } from "@/context/MockDataContext";
import { DollarSign, Layers, Package, Plus } from "lucide-react";

export default function ServiceKitsPage() {
  const { serviceKits } = useMockData();

  const columns: Column<ServiceKit>[] = [
    {
      key: "kitNumber",
      header: "Kit #",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary font-bold">
          {r.kitNumber}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      accessor: (r) => (
        <Badge variant="outline" className="text-xs">
          {r.category}
        </Badge>
      ),
    },
    {
      key: "equipmentType",
      header: "Equipment",
      accessor: (r) => <span className="text-xs">{r.equipmentType}</span>,
    },
    {
      key: "components",
      header: "Components",
      accessor: (r) => (
        <span className="text-xs">{r.components.length} parts</span>
      ),
    },
    {
      key: "unitCost",
      header: "Kit Cost",
      sortable: true,
      accessor: (r) =>
        r.unitCost > 0 ? (
          <span className="font-mono text-xs">${r.unitCost.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground text-xs">Variable</span>
        ),
    },
    {
      key: "usageCount",
      header: "Used",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">{r.usageCount}x</span>
      ),
    },
    {
      key: "lastUsed",
      header: "Last Used",
      accessor: (r) =>
        r.lastUsed ? (
          <span className="text-xs">{r.lastUsed}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const totalComponents = serviceKits.reduce(
    (s, k) => s + k.components.length,
    0,
  );
  const totalUsage = serviceKits.reduce((s, k) => s + k.usageCount, 0);

  return (
    <div data-ocid="service_kits.page" className="space-y-5">
      <PageHeader
        title="Service Kits / BOM"
        description="Pre-built service kits and bill of materials for common HVAC jobs"
        breadcrumbs={[{ label: "Service Kits" }]}
        actions={
          <Button type="button" size="sm" data-ocid="service_kits.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Kit
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="service_kits.kpi.total"
          title="Total Kits"
          value={serviceKits.length}
          icon={<Layers className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="service_kits.kpi.active"
          title="Active Kits"
          value={serviceKits.filter((k) => k.status === "active").length}
          icon={<Layers className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="service_kits.kpi.components"
          title="Total Components"
          value={totalComponents}
          icon={<Package className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="service_kits.kpi.usage"
          title="Total Uses"
          value={totalUsage}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      <DataTable
        data-ocid="service_kits.table"
        columns={columns}
        data={serviceKits}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search kits…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.kitNumber.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        }
        pageSize={10}
      />

      {/* Kit detail cards */}
      {serviceKits
        .filter((k) => k.components.length > 0)
        .map((kit) => (
          <Card key={kit.id} className="p-4">
            <h3 className="font-semibold font-display text-sm mb-2">
              {kit.name} — Components ({kit.kitNumber})
            </h3>
            <div className="space-y-1">
              {kit.components.map((comp, i) => (
                <div
                  key={comp.partId}
                  data-ocid={`service_kits.${kit.id}.component.${i + 1}`}
                  className="flex items-center justify-between p-2 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">
                      {comp.sku}
                    </span>
                    <span className="text-xs font-medium">{comp.partName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Qty: {comp.quantity}</span>
                    <span>${comp.unitCost.toFixed(2)}</span>
                    {comp.notes && (
                      <span className="text-muted-foreground italic">
                        {comp.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
    </div>
  );
}
