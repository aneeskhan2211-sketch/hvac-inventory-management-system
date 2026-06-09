import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { PurchaseOrder } from "@/context/MockDataContext";
import { Clock, DollarSign, Plus, ShoppingCart } from "lucide-react";

export default function PurchaseOrdersPage() {
  const { purchaseOrders } = useMockData();

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "poNumber",
      header: "PO #",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary font-bold">
          {r.poNumber}
        </span>
      ),
    },
    {
      key: "supplierName",
      header: "Supplier",
      sortable: true,
      accessor: (r) => (
        <span className="text-sm font-medium">{r.supplierName}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "orderDate",
      header: "Order Date",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.orderDate}</span>,
    },
    {
      key: "expectedDate",
      header: "Expected",
      accessor: (r) => <span className="text-xs">{r.expectedDate}</span>,
    },
    {
      key: "items",
      header: "Items",
      accessor: (r) => <span className="text-xs">{r.items.length} lines</span>,
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs font-bold">
          ${r.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">{r.createdBy}</span>
      ),
    },
    {
      key: "approvedBy",
      header: "Approved By",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.approvedBy ?? "—"}
        </span>
      ),
    },
  ];

  const totalValue = purchaseOrders.reduce((s, po) => s + po.total, 0);
  const open = purchaseOrders.filter(
    (po) => po.status === "submitted" || po.status === "confirmed",
  ).length;

  return (
    <div data-ocid="purchase_orders.page" className="space-y-5">
      <PageHeader
        title="Purchase Orders"
        description="PO lifecycle management, receipt tracking, and approvals"
        breadcrumbs={[{ label: "Purchase Orders" }]}
        actions={
          <Button
            type="button"
            size="sm"
            data-ocid="purchase_orders.add_button"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New PO
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="purchase_orders.kpi.total"
          title="Total POs"
          value={purchaseOrders.length}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="purchase_orders.kpi.open"
          title="Open POs"
          value={open}
          icon={<Clock className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="purchase_orders.kpi.value"
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="purchase_orders.kpi.received"
          title="Received"
          value={purchaseOrders.filter((po) => po.status === "received").length}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="purchase_orders.table"
        columns={columns}
        data={purchaseOrders}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search by PO number, supplier…"
        searchFn={(r, q) =>
          r.poNumber.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
