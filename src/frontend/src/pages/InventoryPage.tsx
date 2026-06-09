import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { InventoryLocation, Part } from "@/context/MockDataContext";
import { DollarSign, MapPin, Truck, Warehouse } from "lucide-react";

export default function InventoryPage() {
  const { locations, parts, alerts } = useMockData();
  const lowStockSkus = new Set(
    alerts.filter((a) => a.status === "active").map((a) => a.sku),
  );
  const lowParts = parts.filter((p) => lowStockSkus.has(p.sku));

  const locationCols: Column<InventoryLocation>[] = [
    {
      key: "name",
      header: "Location",
      sortable: true,
      accessor: (r) => (
        <div className="flex items-center gap-2">
          {r.type === "warehouse" ? (
            <Warehouse className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Truck className="w-3.5 h-3.5 text-accent" />
          )}
          <span className="font-medium text-sm">{r.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (r) => (
        <Badge variant="outline" className="text-xs capitalize">
          {r.type}
        </Badge>
      ),
    },
    {
      key: "manager",
      header: "Manager",
      accessor: (r) => <span className="text-xs">{r.manager ?? "—"}</span>,
    },
    {
      key: "totalItems",
      header: "Items",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">{r.totalItems}</span>
      ),
    },
    {
      key: "totalValue",
      header: "Value",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">
          ${r.totalValue.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "notes",
      header: "Notes",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {r.notes}
        </span>
      ),
    },
  ];

  const partCols: Column<Part>[] = [
    {
      key: "sku",
      header: "SKU",
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Part Name",
      sortable: true,
      accessor: (r) => <span className="font-medium text-sm">{r.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      accessor: (r) => <span className="text-xs">{r.category}</span>,
    },
    {
      key: "totalStock",
      header: "Stock",
      sortable: true,
      accessor: (r) => (
        <span
          className={`font-bold text-sm ${lowStockSkus.has(r.sku) ? "text-destructive" : "text-success"}`}
        >
          {r.totalStock}
        </span>
      ),
    },
    {
      key: "minStock",
      header: "Min",
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
      key: "unitCost",
      header: "Unit Cost",
      accessor: (r) => (
        <span className="font-mono text-xs">${r.unitCost.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => (
        <StatusBadge
          status={lowStockSkus.has(r.sku) ? "critical" : "active"}
          label={lowStockSkus.has(r.sku) ? "Low Stock" : "In Stock"}
        />
      ),
    },
  ];

  const totalValue = locations.reduce((s, l) => s + l.totalValue, 0);

  return (
    <div data-ocid="inventory.page" className="space-y-5">
      <PageHeader
        title="Inventory"
        description="Multi-location stock tracking and zone management"
        breadcrumbs={[{ label: "Inventory" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="inventory.kpi.locations"
          title="Locations"
          value={locations.length}
          icon={<MapPin className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="inventory.kpi.total_value"
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="inventory.kpi.low_stock"
          title="Low Stock Items"
          value={lowParts.length}
          alert={lowParts.length > 0}
          icon={<Warehouse className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="inventory.kpi.trucks"
          title="Service Trucks"
          value={locations.filter((l) => l.type === "truck").length}
          icon={<Truck className="w-4 h-4" />}
        />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold font-display text-sm mb-3">
          Stock Locations
        </h3>
        <DataTable
          data-ocid="inventory.locations_table"
          columns={locationCols}
          data={locations}
          rowKey={(r) => r.id}
          pageSize={10}
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold font-display text-sm mb-3">
          Stock Levels by Part
        </h3>
        <DataTable
          data-ocid="inventory.parts_table"
          columns={partCols}
          data={parts}
          rowKey={(r) => r.id}
          searchable
          searchPlaceholder="Search parts…"
          searchFn={(r, q) =>
            r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      </Card>
    </div>
  );
}
