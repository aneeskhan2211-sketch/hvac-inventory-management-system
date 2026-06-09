import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { Part, Supplier } from "@/context/MockDataContext";
import {
  DollarSign,
  Download,
  FileBarChart,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ABC_COLORS = [
  "oklch(0.55 0.25 20)",
  "oklch(0.72 0.18 60)",
  "oklch(0.62 0.18 140)",
];

export default function ReportsPage() {
  const { parts, suppliers, purchaseOrders } = useMockData();

  // ABC classification by value
  const sorted = [...parts].sort(
    (a, b) => b.unitCost * b.totalStock - a.unitCost * a.totalStock,
  );
  const totalVal = sorted.reduce((s, p) => s + p.unitCost * p.totalStock, 0);
  let running = 0;
  const withABC = sorted.map((p) => {
    running += p.unitCost * p.totalStock;
    const pct = running / totalVal;
    return {
      ...p,
      abc: pct <= 0.7 ? "A" : pct <= 0.9 ? "B" : "C",
      value: p.unitCost * p.totalStock,
    };
  });
  const abcData = ["A", "B", "C"].map((cls) => ({
    name: `Class ${cls}`,
    value: withABC.filter((p) => p.abc === cls).length,
  }));

  // Supplier performance
  const supplierPerf = suppliers.map((s) => ({
    name: s.name.split(" ")[0],
    onTime: s.onTimeDelivery,
    fillRate: s.fillRate,
  }));

  const abcCols: Column<(typeof withABC)[0]>[] = [
    {
      key: "sku",
      header: "SKU",
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Part",
      sortable: true,
      accessor: (r) => <span className="font-medium text-sm">{r.name}</span>,
    },
    {
      key: "abc",
      header: "ABC Class",
      sortable: true,
      accessor: (r) => (
        <span
          className={`font-bold text-sm ${r.abc === "A" ? "text-destructive" : r.abc === "B" ? "text-warning" : "text-success"}`}
        >
          {r.abc}
        </span>
      ),
    },
    {
      key: "totalStock",
      header: "Stock",
      accessor: (r) => (
        <span className="font-mono text-xs">{r.totalStock}</span>
      ),
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">${r.value.toFixed(2)}</span>
      ),
    },
    {
      key: "unitCost",
      header: "Unit Cost",
      accessor: (r) => (
        <span className="font-mono text-xs">${r.unitCost.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div data-ocid="reports.page" className="space-y-5">
      <PageHeader
        title="Reports & Analytics"
        description="Inventory valuation, turnover analysis, and supplier performance"
        breadcrumbs={[{ label: "Reports" }]}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="reports.export_button"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export PDF
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="reports.kpi.value"
          title="Total Inventory Value"
          value={`$${totalVal.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="reports.kpi.parts"
          title="SKUs Tracked"
          value={parts.length}
          icon={<Package className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="reports.kpi.suppliers"
          title="Active Suppliers"
          value={suppliers.filter((s) => s.status === "active").length}
          icon={<Star className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="reports.kpi.pos"
          title="Total PO Value"
          value={`$${purchaseOrders.reduce((s, po) => s + po.total, 0).toLocaleString()}`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold font-display text-sm mb-3">
            ABC Inventory Classification
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={abcData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {abcData.map((entry, i) => (
                  <Cell key={entry.name} fill={ABC_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.014 260)",
                  border: "1px solid oklch(0.28 0.02 260)",
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold font-display text-sm mb-3">
            Supplier On-Time Delivery %
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={supplierPerf}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 260)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.014 260)",
                  border: "1px solid oklch(0.28 0.02 260)",
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="onTime"
                name="On-Time %"
                fill="oklch(0.62 0.18 140)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold font-display text-sm mb-3">
          ABC Inventory Analysis
        </h3>
        <DataTable
          data-ocid="reports.abc_table"
          columns={abcCols}
          data={withABC}
          rowKey={(r) => r.id}
          searchable
          searchPlaceholder="Search parts…"
          searchFn={(r, q) =>
            r.name.toLowerCase().includes(q) ||
            r.sku.toLowerCase().includes(q) ||
            r.abc.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      </Card>
    </div>
  );
}
