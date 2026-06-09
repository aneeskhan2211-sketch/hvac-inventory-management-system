import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { Equipment } from "@/context/MockDataContext";
import { AlertCircle, Clock, Settings } from "lucide-react";

export default function MaintenancePage() {
  const { equipment } = useMockData();

  const columns: Column<Equipment>[] = [
    {
      key: "serialNumber",
      header: "Serial #",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.serialNumber}</span>
      ),
    },
    {
      key: "model",
      header: "Model",
      sortable: true,
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{r.model}</p>
          <p className="text-xs text-muted-foreground">{r.manufacturer}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      accessor: (r) => (
        <Badge variant="outline" className="text-xs uppercase">
          {r.type}
        </Badge>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.customerName}</span>,
    },
    {
      key: "location",
      header: "Location",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">{r.location}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "lastServiceDate",
      header: "Last Service",
      sortable: true,
      accessor: (r) => <span className="text-xs">{r.lastServiceDate}</span>,
    },
    {
      key: "nextServiceDate",
      header: "Next Service",
      sortable: true,
      accessor: (r) => {
        const next = new Date(r.nextServiceDate);
        const today = new Date();
        const overdue = next < today;
        return (
          <span
            className={`text-xs font-medium ${overdue ? "text-destructive" : "text-foreground"}`}
          >
            {r.nextServiceDate}
          </span>
        );
      },
    },
    {
      key: "warrantyExpiry",
      header: "Warranty",
      accessor: (r) => {
        const exp = new Date(r.warrantyExpiry);
        const today = new Date();
        return (
          <span
            className={`text-xs ${exp < today ? "text-muted-foreground line-through" : "text-success"}`}
          >
            {r.warrantyExpiry}
          </span>
        );
      },
    },
  ];

  const overdue = equipment.filter(
    (eq) => new Date(eq.nextServiceDate) < new Date(),
  ).length;
  const activeMaintenance = equipment.filter(
    (eq) => eq.status === "maintenance",
  ).length;

  return (
    <div data-ocid="maintenance.page" className="space-y-5">
      <PageHeader
        title="Maintenance & Equipment"
        description="Equipment tracking, service schedules, and warranty management"
        breadcrumbs={[{ label: "Maintenance" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="maintenance.kpi.total"
          title="Equipment Tracked"
          value={equipment.length}
          icon={<Settings className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="maintenance.kpi.overdue"
          title="Services Overdue"
          value={overdue}
          alert={overdue > 0}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="maintenance.kpi.in_maintenance"
          title="In Maintenance"
          value={activeMaintenance}
          icon={<Settings className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="maintenance.kpi.service_records"
          title="Service Records"
          value={equipment.reduce((s, eq) => s + eq.serviceHistory.length, 0)}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      <DataTable
        data-ocid="maintenance.table"
        columns={columns}
        data={equipment}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search equipment…"
        searchFn={(r, q) =>
          r.serialNumber.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.manufacturer.toLowerCase().includes(q)
        }
        pageSize={10}
      />

      {/* Service history */}
      {equipment.map(
        (eq) =>
          eq.serviceHistory.length > 0 && (
            <Card key={eq.id} className="p-4">
              <h3 className="font-semibold font-display text-sm mb-2">
                {eq.model} ({eq.serialNumber}) — Service History
              </h3>
              <div className="space-y-2">
                {eq.serviceHistory.map((sr, i) => (
                  <div
                    key={sr.id}
                    data-ocid={`maintenance.service_record.${i + 1}`}
                    className="flex items-start gap-3 p-2 rounded-lg border border-border"
                  >
                    <div className="w-16 text-xs text-muted-foreground shrink-0">
                      {sr.date}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{sr.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {sr.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tech: {sr.technicianName} &bull; Cost: ${sr.cost}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ),
      )}
    </div>
  );
}
