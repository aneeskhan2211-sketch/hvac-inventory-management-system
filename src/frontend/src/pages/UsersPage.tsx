import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/context/MockDataContext";
import type { AppUser } from "@/context/MockDataContext";
import { Plus, Shield, Users } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/15 text-destructive border-destructive/30",
  manager: "bg-primary/15 text-primary border-primary/30",
  technician: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  warehouse: "bg-accent/15 text-accent border-accent/30",
  viewer: "bg-muted text-muted-foreground border-border",
};

const PERMISSIONS_LABELS: Record<string, string> = {
  all: "Full Access",
  inventory: "Inventory",
  orders: "Orders",
  reports: "Reports",
  "users-view": "View Users",
  "work-orders": "Work Orders",
  "inventory-view": "View Inventory",
  transactions: "Transactions",
  "orders-view": "View Orders",
  "view-all": "View All",
};

export default function UsersPage() {
  const { users } = useMockData();

  const columns: Column<AppUser>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      accessor: (r) => (
        <span
          className={`inline-flex items-center border font-medium rounded-full px-2 py-0.5 text-xs leading-none capitalize ${ROLE_COLORS[r.role] ?? "bg-muted text-muted-foreground border-border"}`}
        >
          <Shield className="w-2.5 h-2.5 mr-1" />
          {r.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "permissions",
      header: "Permissions",
      accessor: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.permissions.map((p) => (
            <Badge
              key={p}
              variant="secondary"
              className="text-xs px-1.5 py-0.5"
            >
              {PERMISSIONS_LABELS[p] ?? p}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      sortable: true,
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.lastLogin ? new Date(r.lastLogin).toLocaleString() : "Never"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">{r.createdAt}</span>
      ),
    },
  ];

  return (
    <div data-ocid="users.page" className="space-y-5">
      <PageHeader
        title="Users & Roles"
        description="Role-based access control and user management"
        breadcrumbs={[{ label: "Users" }]}
        actions={
          <Button type="button" size="sm" data-ocid="users.add_button">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add User
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="users.kpi.total"
          title="Total Users"
          value={users.length}
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="users.kpi.active"
          title="Active"
          value={users.filter((u) => u.status === "active").length}
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="users.kpi.admins"
          title="Admins"
          value={users.filter((u) => u.role === "admin").length}
          icon={<Shield className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="users.kpi.technicians"
          title="Technicians"
          value={users.filter((u) => u.role === "technician").length}
          icon={<Users className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="users.table"
        columns={columns}
        data={users}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search users…"
        searchFn={(r, q) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.role.includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
