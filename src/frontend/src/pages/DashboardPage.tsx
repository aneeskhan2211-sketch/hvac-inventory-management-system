import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import {
  Activity,
  AlertCircle,
  Bell,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHLY_TREND = [
  { month: "Jan", spend: 14200, orders: 8 },
  { month: "Feb", spend: 16800, orders: 11 },
  { month: "Mar", spend: 12400, orders: 7 },
  { month: "Apr", spend: 19200, orders: 14 },
  { month: "May", spend: 17600, orders: 12 },
  { month: "Jun", spend: 18450, orders: 10 },
];

const PARTS_BY_CATEGORY = [
  { category: "Belts", count: 2 },
  { category: "Filters", count: 2 },
  { category: "Electrical", count: 3 },
  { category: "Motors", count: 1 },
  { category: "Refrigerants", count: 1 },
  { category: "Chemicals", count: 1 },
];

export default function DashboardPage() {
  const { kpi, alerts, workOrders, activityLogs } = useMockData();
  const criticalAlerts = alerts.filter(
    (a) => a.status === "active" && a.severity === "critical",
  );
  const recentActivity = activityLogs.slice(0, 5);

  return (
    <div data-ocid="dashboard.page" className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="HVAC Inventory Management — real-time operational overview"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* KPI row */}
      <section
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3"
        data-ocid="dashboard.kpi_section"
      >
        <KPICard
          data-ocid="dashboard.kpi.inventory_value"
          title="Inventory Value"
          value={`$${kpi.totalInventoryValue.toLocaleString()}`}
          subtitle="Across all locations"
          icon={<DollarSign className="w-4 h-4" />}
          trend={{ value: 3.2, label: "vs last month" }}
        />
        <KPICard
          data-ocid="dashboard.kpi.parts"
          title="Active Parts"
          value={kpi.totalParts}
          subtitle="Unique SKUs tracked"
          icon={<Package className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="dashboard.kpi.low_stock"
          title="Low Stock"
          value={kpi.lowStockItems}
          subtitle="Items need reorder"
          icon={<AlertCircle className="w-4 h-4" />}
          alert={kpi.lowStockItems > 0}
          trend={{ value: -2 }}
        />
        <KPICard
          data-ocid="dashboard.kpi.open_work_orders"
          title="Open Work Orders"
          value={kpi.openWorkOrders}
          subtitle="In progress or open"
          icon={<Wrench className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="dashboard.kpi.pending_pos"
          title="Pending POs"
          value={kpi.pendingPOs}
          subtitle="Awaiting receipt"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
      </section>

      {/* Charts row */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold font-display text-sm mb-3">
            Monthly Spend Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.18 200)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.18 200)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 260)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Spend"]}
                contentStyle={{
                  background: "oklch(0.18 0.014 260)",
                  border: "1px solid oklch(0.28 0.02 260)",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="oklch(0.65 0.18 200)"
                fill="url(#spendGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold font-display text-sm mb-3">
            Parts by Category
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PARTS_BY_CATEGORY}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 260)"
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
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
                dataKey="count"
                fill="oklch(0.65 0.18 200)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Bottom row */}
      <section className="grid lg:grid-cols-2 gap-4">
        {/* Critical alerts */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold font-display text-sm">
              Critical Alerts
            </h3>
            <Bell className="w-4 h-4 text-destructive" />
          </div>
          {criticalAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No critical alerts
            </p>
          ) : (
            <div className="space-y-2" data-ocid="dashboard.alerts_list">
              {criticalAlerts.map((a, i) => (
                <div
                  key={a.id}
                  data-ocid={`dashboard.alerts_list.item.${i + 1}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-destructive/8 border border-destructive/20"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {a.partName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.sku} &bull; Stock: {a.currentStock} / Min: {a.minStock}
                    </p>
                  </div>
                  <StatusBadge status={a.severity} size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold font-display text-sm">
              Recent Activity
            </h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2" data-ocid="dashboard.activity_list">
            {recentActivity.map((log, i) => (
              <div
                key={log.id}
                data-ocid={`dashboard.activity_list.item.${i + 1}`}
                className="flex items-start gap-2"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Clock className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug">
                    {log.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.userName} &bull;{" "}
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Work orders summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold font-display text-sm">
            Active Work Orders
          </h3>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Technician utilization: {kpi.technicianUtilization}%
            </span>
          </div>
        </div>
        <div className="space-y-2" data-ocid="dashboard.work_orders_list">
          {workOrders
            .filter((wo) => wo.status !== "cancelled")
            .slice(0, 4)
            .map((wo, i) => (
              <div
                key={wo.id}
                data-ocid={`dashboard.work_orders_list.item.${i + 1}`}
                className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {wo.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {wo.woNumber} &bull; {wo.customerName} &bull;{" "}
                    {wo.technicianName}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <StatusBadge status={wo.priority} size="sm" />
                  <StatusBadge status={wo.status} size="sm" />
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* KPI secondary row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="dashboard.kpi.suppliers"
          title="Active Suppliers"
          value={kpi.totalSuppliers}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="dashboard.kpi.customers"
          title="Active Customers"
          value={kpi.totalCustomers}
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="dashboard.kpi.monthly_revenue"
          title="Monthly Revenue"
          value={`$${kpi.monthlyRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={{ value: 5.1 }}
        />
        <KPICard
          data-ocid="dashboard.kpi.locations"
          title="Stock Locations"
          value={5}
          subtitle="Warehouse + trucks"
          icon={<Warehouse className="w-4 h-4" />}
        />
      </section>
    </div>
  );
}
