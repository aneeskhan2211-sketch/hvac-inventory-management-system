import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { WorkOrder } from "@/context/MockDataContext";
import { AlertCircle, DollarSign, Plus, Wrench } from "lucide-react";

export default function WorkOrdersPage() {
  const { workOrders } = useMockData();

  const columns: Column<WorkOrder>[] = [
    {
      key: "woNumber",
      header: "WO #",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary font-bold">
          {r.woNumber}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.type}</p>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.customerName}</span>,
    },
    {
      key: "technicianName",
      header: "Technician",
      accessor: (r) => <span className="text-xs">{r.technicianName}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.priority} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "scheduledDate",
      header: "Scheduled",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.scheduledDate}</span>,
    },
    {
      key: "totalCost",
      header: "Cost",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">
          ${r.totalCost.toLocaleString()}
        </span>
      ),
    },
  ];

  const urgent = workOrders.filter(
    (wo) => wo.priority === "urgent" && wo.status !== "completed",
  ).length;
  const inProgress = workOrders.filter(
    (wo) => wo.status === "in-progress",
  ).length;
  const totalCost = workOrders.reduce((s, wo) => s + wo.totalCost, 0);

  return (
    <div data-ocid="work_orders.page" className="space-y-5">
      <PageHeader
        title="Work Orders"
        description="Job management, parts assignment, and technician scheduling"
        breadcrumbs={[{ label: "Work Orders" }]}
        actions={
          <Button type="button" size="sm" data-ocid="work_orders.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Work Order
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="work_orders.kpi.total"
          title="Total WOs"
          value={workOrders.length}
          icon={<Wrench className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="work_orders.kpi.in_progress"
          title="In Progress"
          value={inProgress}
          icon={<Wrench className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="work_orders.kpi.urgent"
          title="Urgent"
          value={urgent}
          alert={urgent > 0}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="work_orders.kpi.cost"
          title="Total Cost"
          value={`$${totalCost.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="work_orders.table"
        columns={columns}
        data={workOrders}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search by WO number, customer, technician…"
        searchFn={(r, q) =>
          r.woNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.technicianName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
