import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { Part } from "@/context/MockDataContext";
import { AlertCircle, DollarSign, Package, Plus } from "lucide-react";

export default function PartsPage() {
  const { parts, alerts } = useMockData();
  const lowStockSkus = new Set(
    alerts.filter((a) => a.status === "active").map((a) => a.sku),
  );

  const columns: Column<Part>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.sku}</span>
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
      key: "supplier",
      header: "Supplier",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.supplier}</span>,
    },
    {
      key: "totalStock",
      header: "Stock",
      sortable: true,
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <span
            className={
              lowStockSkus.has(r.sku) ? "text-destructive font-bold" : ""
            }
          >
            {r.totalStock} {r.uom}
          </span>
          {lowStockSkus.has(r.sku) && (
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
          )}
        </div>
      ),
    },
    {
      key: "unitCost",
      header: "Unit Cost",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">${r.unitCost.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "barcode",
      header: "Barcode",
      accessor: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {r.barcode}
        </span>
      ),
    },
  ];

  const totalValue = parts.reduce((s, p) => s + p.unitCost * p.totalStock, 0);
  const lowCount = parts.filter((p) => lowStockSkus.has(p.sku)).length;

  return (
    <div data-ocid="parts.page" className="space-y-5">
      <PageHeader
        title="Parts Catalog"
        description="Browsable library of all HVAC parts and components"
        breadcrumbs={[{ label: "Parts Catalog" }]}
        actions={
          <Button type="button" size="sm" data-ocid="parts.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Part
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="parts.kpi.total"
          title="Total SKUs"
          value={parts.length}
          icon={<Package className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="parts.kpi.value"
          title="Catalog Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="parts.kpi.low_stock"
          title="Low Stock"
          value={lowCount}
          alert={lowCount > 0}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="parts.kpi.active"
          title="Active Parts"
          value={parts.filter((p) => p.status === "active").length}
          icon={<Package className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="parts.table"
        columns={columns}
        data={parts}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search by name, SKU, category…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
