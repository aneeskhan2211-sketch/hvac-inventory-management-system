import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { Supplier } from "@/context/MockDataContext";
import { Plus, Star, Truck } from "lucide-react";

export default function SuppliersPage() {
  const { suppliers, purchaseOrders } = useMockData();

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.accountNumber}</p>
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
      key: "contactName",
      header: "Contact",
      accessor: (r) => (
        <div>
          <p className="text-xs font-medium">{r.contactName}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      accessor: (r) => <span className="text-xs font-mono">{r.phone}</span>,
    },
    {
      key: "leadTimeDays",
      header: "Lead Time",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.leadTimeDays}d</span>,
    },
    {
      key: "onTimeDelivery",
      header: "On-Time %",
      sortable: true,
      accessor: (r) => (
        <span
          className={`font-mono text-xs font-bold ${r.onTimeDelivery >= 95 ? "text-success" : r.onTimeDelivery >= 85 ? "text-warning" : "text-destructive"}`}
        >
          {r.onTimeDelivery}%
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      accessor: (r) => (
        <span className="flex items-center gap-0.5 text-xs">
          <Star className="w-3 h-3 fill-accent text-accent" />
          {r.rating}
        </span>
      ),
    },
    {
      key: "totalSpend",
      header: "Total Spend",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">
          ${r.totalSpend.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const avgRating = (
    suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length
  ).toFixed(1);
  const totalSpend = suppliers.reduce((s, sup) => s + sup.totalSpend, 0);
  const _posBySupplier = purchaseOrders.length;

  return (
    <div data-ocid="suppliers.page" className="space-y-5">
      <PageHeader
        title="Suppliers"
        description="Vendor master database, performance metrics, and PO history"
        breadcrumbs={[{ label: "Suppliers" }]}
        actions={
          <Button type="button" size="sm" data-ocid="suppliers.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Supplier
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="suppliers.kpi.total"
          title="Total Suppliers"
          value={suppliers.length}
          icon={<Truck className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="suppliers.kpi.active"
          title="Active"
          value={suppliers.filter((s) => s.status === "active").length}
          icon={<Truck className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="suppliers.kpi.avg_rating"
          title="Avg Rating"
          value={avgRating}
          icon={<Star className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="suppliers.kpi.total_spend"
          title="Total Spend"
          value={`$${totalSpend.toLocaleString()}`}
          icon={<Truck className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="suppliers.table"
        columns={columns}
        data={suppliers}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search suppliers…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.contactName.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
