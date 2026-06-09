import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useMockData } from "@/context/MockDataContext";
import type { Transaction } from "@/context/MockDataContext";
import {
  ArrowLeftRight,
  DollarSign,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const typeConfig: Record<string, { label: string; color: string }> = {
  receive: {
    label: "Receive",
    color: "bg-success/15 text-success border-success/30",
  },
  issue: {
    label: "Issue",
    color: "bg-primary/15 text-primary border-primary/30",
  },
  transfer: {
    label: "Transfer",
    color: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  },
  return: {
    label: "Return",
    color: "bg-accent/15 text-accent border-accent/30",
  },
  adjustment: {
    label: "Adjustment",
    color: "bg-warning/15 text-warning border-warning/30",
  },
  count: {
    label: "Count",
    color: "bg-muted text-muted-foreground border-border",
  },
};

export default function TransactionsPage() {
  const { transactions } = useMockData();

  const columns: Column<Transaction>[] = [
    {
      key: "timestamp",
      header: "Date/Time",
      sortable: true,
      accessor: (r) => (
        <span className="text-xs font-mono">
          {new Date(r.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (r) => {
        const cfg = typeConfig[r.type] ?? {
          label: r.type,
          color: "bg-muted text-muted-foreground border-border",
        };
        return (
          <span
            className={`inline-flex items-center border font-medium rounded-full px-2 py-0.5 text-xs leading-none ${cfg.color}`}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "sku",
      header: "SKU",
      accessor: (r) => (
        <span className="font-mono text-xs text-primary">{r.sku}</span>
      ),
    },
    {
      key: "partName",
      header: "Part",
      sortable: true,
      accessor: (r) => (
        <span className="text-sm font-medium">{r.partName}</span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      sortable: true,
      accessor: (r) => (
        <span
          className={`font-mono text-xs font-bold ${r.quantity > 0 ? "text-success" : "text-destructive"}`}
        >
          {r.quantity > 0 ? "+" : ""}
          {r.quantity}
        </span>
      ),
    },
    {
      key: "fromLocation",
      header: "From",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.fromLocation ?? "—"}
        </span>
      ),
    },
    {
      key: "toLocation",
      header: "To",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.toLocation ?? "—"}
        </span>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      accessor: (r) =>
        r.reference ? (
          <span className="font-mono text-xs text-primary">{r.reference}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "performedBy",
      header: "By",
      accessor: (r) => <span className="text-xs">{r.performedBy}</span>,
    },
    {
      key: "totalValue",
      header: "Value",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs">
          ${Math.abs(r.totalValue).toFixed(2)}
        </span>
      ),
    },
  ];

  const received = transactions
    .filter((t) => t.type === "receive")
    .reduce((s, t) => s + t.totalValue, 0);
  const issued = transactions
    .filter((t) => t.type === "issue")
    .reduce((s, t) => s + t.totalValue, 0);
  const adjustments = transactions.filter(
    (t) => t.type === "adjustment",
  ).length;

  return (
    <div data-ocid="transactions.page" className="space-y-5">
      <PageHeader
        title="Transactions"
        description="Complete inventory transaction history and audit trail"
        breadcrumbs={[{ label: "Transactions" }]}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          data-ocid="transactions.kpi.total"
          title="Total Transactions"
          value={transactions.length}
          icon={<ArrowLeftRight className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="transactions.kpi.received"
          title="Value Received"
          value={`$${received.toLocaleString()}`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="transactions.kpi.issued"
          title="Value Issued"
          value={`$${issued.toFixed(0)}`}
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="transactions.kpi.adjustments"
          title="Adjustments"
          value={adjustments}
          icon={<RefreshCw className="w-4 h-4" />}
        />
      </div>
      <DataTable
        data-ocid="transactions.table"
        columns={columns}
        data={transactions}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search transactions…"
        searchFn={(r, q) =>
          r.partName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.performedBy.toLowerCase().includes(q) ||
          r.type.includes(q)
        }
        pageSize={10}
      />
    </div>
  );
}
