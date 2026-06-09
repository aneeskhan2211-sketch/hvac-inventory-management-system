import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { Customer } from "@/context/MockDataContext";
import { DollarSign, Plus, Star, UserCircle } from "lucide-react";

export default function CustomersPage() {
  const { customers } = useMockData();

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">
            {r.city}, {r.state}
          </p>
        </div>
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
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.type} />,
    },
    {
      key: "serviceLevel",
      header: "Service Level",
      sortable: true,
      accessor: (r) => <StatusBadge status={r.serviceLevel} />,
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "totalJobs",
      header: "Jobs",
      sortable: true,
      accessor: (r) => <span className="font-mono text-xs">{r.totalJobs}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs font-bold">
          ${r.totalRevenue.toLocaleString()}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      accessor: (r) => (
        <span
          className={`font-mono text-xs ${r.balance > 0 ? "text-warning" : "text-success"}`}
        >
          ${r.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "contractEnd",
      header: "Contract End",
      accessor: (r) =>
        r.contractEnd ? (
          <span className="text-xs">{r.contractEnd}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
  ];

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const enterprise = customers.filter(
    (c) => c.serviceLevel === "enterprise",
  ).length;

  return (
    <div data-ocid="customers.page" className="space-y-5">
      <PageHeader
        title="Customers"
        description="Customer database, equipment history, and service history"
        breadcrumbs={[{ label: "Customers" }]}
        actions={
          <Button type="button" size="sm" data-ocid="customers.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Customer
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="customers.kpi.total"
          title="Total Customers"
          value={customers.length}
          icon={<UserCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="customers.kpi.active"
          title="Active"
          value={customers.filter((c) => c.status === "active").length}
          icon={<UserCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="customers.kpi.enterprise"
          title="Enterprise"
          value={enterprise}
          icon={<Star className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="customers.kpi.revenue"
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="customers.table"
        columns={columns}
        data={customers}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search customers…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.contactName.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
