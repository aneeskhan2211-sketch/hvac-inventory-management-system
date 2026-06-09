import { type Column, DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/context/MockDataContext";
import type { Part } from "@/context/MockDataContext";
import { Download, Hash, Package, QrCode } from "lucide-react";

export default function BarcodesPage() {
  const { parts } = useMockData();

  // Generate a simple visual barcode representation
  function BarcodeVisual({ barcode }: { barcode: string }) {
    return (
      <div className="flex items-center gap-px h-6">
        {barcode.split("").map((char, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: barcode chars have no stable key
            key={i}
            className="bg-foreground rounded-[1px]"
            style={{
              width:
                Number.parseInt(char) % 3 === 0
                  ? 3
                  : Number.parseInt(char) % 3 === 1
                    ? 1
                    : 2,
              height: "100%",
            }}
          />
        ))}
      </div>
    );
  }

  const columns: Column<Part>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs text-primary font-bold">
          {r.sku}
        </span>
      ),
    },
    {
      key: "name",
      header: "Part Name",
      sortable: true,
      accessor: (r) => <span className="font-medium text-sm">{r.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      accessor: (r) => <span className="text-xs">{r.category}</span>,
    },
    {
      key: "barcode",
      header: "Barcode #",
      accessor: (r) => <span className="font-mono text-xs">{r.barcode}</span>,
    },
    {
      key: "visual",
      header: "Barcode Visual",
      accessor: (r) => <BarcodeVisual barcode={r.barcode} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (r) => (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            data-ocid={`barcodes.print_button.${r.id}`}
          >
            <Download className="w-3 h-3 mr-0.5" />
            Print
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            data-ocid={`barcodes.qr_button.${r.id}`}
          >
            <QrCode className="w-3 h-3 mr-0.5" />
            QR
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div data-ocid="barcodes.page" className="space-y-5">
      <PageHeader
        title="Barcodes & QR Codes"
        description="Generate, print, and scan barcodes for inventory management"
        breadcrumbs={[{ label: "Barcodes" }]}
        actions={
          <Button
            type="button"
            size="sm"
            data-ocid="barcodes.batch_print_button"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Batch Print
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KPICard
          data-ocid="barcodes.kpi.total"
          title="Total Barcodes"
          value={parts.length}
          icon={<Hash className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="barcodes.kpi.parts"
          title="Tagged Parts"
          value={parts.filter((p) => p.barcode).length}
          icon={<Package className="w-4 h-4" />}
        />
        <KPICard
          data-ocid="barcodes.kpi.qr"
          title="QR Ready"
          value={parts.length}
          icon={<QrCode className="w-4 h-4" />}
        />
      </div>

      {/* Scanner simulation */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold font-display text-sm">
              Mobile Scanner Simulation
            </h3>
            <p className="text-xs text-muted-foreground">
              Use your device camera to scan barcodes and instantly locate parts
              in the system.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto shrink-0"
            data-ocid="barcodes.scan_button"
          >
            <QrCode className="w-3.5 h-3.5 mr-1" />
            Open Scanner
          </Button>
        </div>
      </Card>

      <DataTable
        data-ocid="barcodes.table"
        columns={columns}
        data={parts}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search by SKU or barcode…"
        searchFn={(r, q) =>
          r.sku.toLowerCase().includes(q) ||
          r.barcode.includes(q) ||
          r.name.toLowerCase().includes(q)
        }
        pageSize={12}
      />
    </div>
  );
}
