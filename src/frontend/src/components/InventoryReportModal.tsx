import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useGetAllItems,
  useGetAllLocations,
  useGetAllStockLevels,
} from "../hooks/useQueries";

interface InventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InventoryReportItem {
  itemId: bigint;
  itemName: string;
  beginningInventory: number;
  receive1: number;
  receive2: number;
  receive3: number;
  currentStock: number;
  itemsUsed: number;
  availableInventory: number;
  unit: string;
}

export default function InventoryReportModal({
  isOpen,
  onClose,
}: InventoryReportModalProps) {
  const [reportData, setReportData] = useState<InventoryReportItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: items = [], isLoading: itemsLoading } = useGetAllItems();
  const { data: locations = [], isLoading: locationsLoading } =
    useGetAllLocations();
  const { data: stockLevels = [], isLoading: stockLoading } =
    useGetAllStockLevels();

  if (!isOpen) return null;

  // Calculate items used from completed locations
  const calculateItemsUsed = (itemName: string): number => {
    let totalUsed = 0;
    for (const location of locations) {
      if (location.completed) {
        // Check belt requirements
        for (const [size, quantity] of location.beltRequirements) {
          if (itemName === `Belt ${size}`) {
            totalUsed += Number(quantity);
          }
        }

        // Check filter requirements
        for (const [size, quantity] of location.filterRequirements) {
          if (itemName === `Filter ${size}`) {
            totalUsed += Number(quantity);
          }
        }
      }
    }
    return totalUsed;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (stockLevels.length === 0 || items.length === 0) {
        throw new Error(
          "Inventory data not available. Please ensure items and inventory data are loaded.",
        );
      }

      // Create a map of stock levels by item ID
      const stockMap = new Map(
        stockLevels.map((stock) => [stock.itemId.toString(), stock]),
      );

      // Generate inventory report data matching the inventory tab structure exactly
      const inventoryReport: InventoryReportItem[] = items.map((item) => {
        const itemIdStr = item.id.toString();
        const stock = stockMap.get(itemIdStr);
        const beginningInventory = stock ? Number(stock.beginningInventory) : 0;
        const receive1 = stock ? Number(stock.receive1) : 0;
        const receive2 = stock ? Number(stock.receive2) : 0;
        const receive3 = stock ? Number(stock.receive3) : 0;
        const currentStock = stock ? Number(stock.currentStock) : 0;
        const itemsUsed = calculateItemsUsed(item.name);
        const totalInventory =
          beginningInventory + receive1 + receive2 + receive3 + currentStock;
        const availableInventory = totalInventory - itemsUsed;

        return {
          itemId: item.id,
          itemName: item.name,
          beginningInventory,
          receive1,
          receive2,
          receive3,
          currentStock,
          itemsUsed,
          availableInventory,
          unit: item.unit,
        };
      });

      // Sort items in the same order as the inventory tab
      const sortedReport = inventoryReport.sort((a, b) => {
        const aIsBelt = a.itemName.toLowerCase().includes("belt");
        const bIsBelt = b.itemName.toLowerCase().includes("belt");
        const aIsFilter = a.itemName.toLowerCase().includes("filter");
        const bIsFilter = b.itemName.toLowerCase().includes("filter");

        // If both are belts, sort by belt size
        if (aIsBelt && bIsBelt) {
          return sortBeltsBySize(a.itemName, b.itemName);
        }

        // If both are filters, sort by filter size
        if (aIsFilter && bIsFilter) {
          return sortFiltersBySize(a.itemName, b.itemName);
        }

        // Belts come first
        if (aIsBelt && !bIsBelt) return -1;
        if (!aIsBelt && bIsBelt) return 1;

        // Filters come second
        if (aIsFilter && !bIsFilter) return -1;
        if (!aIsFilter && bIsFilter) return 1;

        // Other items come last, sorted alphabetically
        return a.itemName.localeCompare(b.itemName);
      });

      setReportData(sortedReport);
      setLastGenerated(new Date());
    } catch (error) {
      console.error("Failed to generate inventory report:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate inventory report",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to sort belts by size (A18–A60, then B30–B60)
  const sortBeltsBySize = (nameA: string, nameB: string): number => {
    const extractBeltSize = (
      name: string,
    ): { series: string; number: number } | null => {
      const match = name.match(/belt\s*([AB])(\d+)/i);
      if (!match) return null;
      return {
        series: match[1].toUpperCase(),
        number: Number.parseInt(match[2]),
      };
    };

    const sizeA = extractBeltSize(nameA);
    const sizeB = extractBeltSize(nameB);

    if (!sizeA && !sizeB) return nameA.localeCompare(nameB);
    if (!sizeA) return 1;
    if (!sizeB) return -1;

    // A series comes before B series
    if (sizeA.series !== sizeB.series) {
      return sizeA.series === "A" ? -1 : 1;
    }

    // Within same series, sort by number ascending
    return sizeA.number - sizeB.number;
  };

  // Helper function to sort filters by size (2-inch filters only, ascending by size)
  const sortFiltersBySize = (nameA: string, nameB: string): number => {
    const extractFilterDimensions = (
      name: string,
    ): { width: number; height: number; depth: number } | null => {
      const match = name.match(/filter\s*(\d+)x(\d+)x(\d+)/i);
      if (!match) return null;
      return {
        width: Number.parseInt(match[1]),
        height: Number.parseInt(match[2]),
        depth: Number.parseInt(match[3]),
      };
    };

    const dimA = extractFilterDimensions(nameA);
    const dimB = extractFilterDimensions(nameB);

    if (!dimA && !dimB) return nameA.localeCompare(nameB);
    if (!dimA) return 1;
    if (!dimB) return -1;

    // Sort by width first (ascending), then height (ascending)
    if (dimA.width !== dimB.width) {
      return dimA.width - dimB.width;
    }
    if (dimA.height !== dimB.height) {
      return dimA.height - dimB.height;
    }
    // If width and height are the same, sort by depth (ascending)
    return dimA.depth - dimB.depth;
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const csvContent = [
      ["K&A Maintenance Inventory Report"],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [""],
      [
        "Item Name",
        "Beginning Inventory",
        "Receive 1",
        "Receive 2",
        "Receive 3",
        "Current Stock",
        "Items Used",
        "Available Inventory",
        "Unit",
      ],
      ...reportData.map((item) => [
        item.itemName,
        item.beginningInventory.toString(),
        item.receive1.toString(),
        item.receive2.toString(),
        item.receive3.toString(),
        item.currentStock.toString(),
        item.itemsUsed.toString(),
        item.availableInventory.toString(),
        item.unit,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTotalBeginning = () =>
    reportData.reduce((sum, item) => sum + item.beginningInventory, 0);
  const getTotalReceive1 = () =>
    reportData.reduce((sum, item) => sum + item.receive1, 0);
  const getTotalReceive2 = () =>
    reportData.reduce((sum, item) => sum + item.receive2, 0);
  const getTotalReceive3 = () =>
    reportData.reduce((sum, item) => sum + item.receive3, 0);
  const getTotalCurrentStock = () =>
    reportData.reduce((sum, item) => sum + item.currentStock, 0);
  const getTotalUsed = () =>
    reportData.reduce((sum, item) => sum + item.itemsUsed, 0);
  const getTotalAvailable = () =>
    reportData.reduce((sum, item) => sum + item.availableInventory, 0);

  const isLoading =
    itemsLoading || locationsLoading || stockLoading || isGenerating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 no-print">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Report
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Printable inventory report matching the inventory tab layout
              exactly
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Generate Report Section */}
          {reportData.length === 0 && !isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center no-print">
              <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Generate Inventory Report
              </h4>
              <p className="text-blue-700 mb-6">
                Create a printable inventory report that matches the inventory
                tab layout exactly, showing Beginning Inventory, Receive 1,
                Receive 2, Receive 3, Current Stock, Items Used, and Available
                Inventory.
              </p>
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={
                  isLoading || stockLevels.length === 0 || items.length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
              >
                <FileText className="w-5 h-5" />
                <span>{isLoading ? "Loading..." : "Generate Report"}</span>
              </button>
              {(stockLevels.length === 0 || items.length === 0) && (
                <p className="text-sm text-gray-600 mt-3">
                  Please ensure inventory data is loaded before generating the
                  report.
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center no-print">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-blue-800 font-medium">
                {isGenerating
                  ? "Generating inventory report..."
                  : "Loading inventory data..."}
              </p>
              <p className="text-blue-600 text-sm mt-2">
                {isGenerating
                  ? "Creating printable report with current inventory data"
                  : "Please wait while we load the latest inventory information"}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 no-print">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-2">
                    Report Generation Failed
                  </p>
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-700 text-sm mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Results */}
          {reportData.length > 0 && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 no-print">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-green-900">
                        Inventory Report Generated
                      </h4>
                    </div>
                    {lastGenerated && (
                      <p className="text-sm text-green-600">
                        Generated: {lastGenerated.toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-green-700 mt-1">
                      Report contains {reportData.length} items with complete
                      inventory data
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={handleGenerateReport}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Refresh Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Print Header - Only visible when printing */}
              <div className="print-only">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    K&A Maintenance
                  </h1>
                  <p className="text-gray-600 mb-1">
                    1617 9th Street NW, Clinton, IA 52732
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                    Inventory Report
                  </h2>
                  {lastGenerated && (
                    <p className="text-gray-600 text-sm">
                      Generated: {lastGenerated.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary Cards - Hidden in print */}
              <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 no-print">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {getTotalBeginning()}
                  </div>
                  <div className="text-sm text-gray-600">Beginning</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {getTotalReceive1()}
                  </div>
                  <div className="text-sm text-blue-600">Receive 1</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {getTotalReceive2()}
                  </div>
                  <div className="text-sm text-blue-600">Receive 2</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {getTotalReceive3()}
                  </div>
                  <div className="text-sm text-blue-600">Receive 3</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {getTotalCurrentStock()}
                  </div>
                  <div className="text-sm text-purple-600">Current Stock</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-900">
                    {getTotalUsed()}
                  </div>
                  <div className="text-sm text-red-600">Items Used</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {getTotalAvailable()}
                  </div>
                  <div className="text-sm text-green-600">Available</div>
                </div>
              </div>

              {/* Report Table - Matches Inventory Tab Layout */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print-table">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 no-print">
                  <h5 className="text-lg font-semibold text-gray-900">
                    Inventory Items
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Current inventory status matching the inventory tab layout
                    exactly
                  </p>
                </div>

                {/* Desktop table view */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 print-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Item Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Beginning Inventory
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Receive 1
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Receive 2
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Receive 3
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Items Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header">
                          Available Inventory
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-header no-print">
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((item) => (
                        <tr key={item.itemId.toString()} className="print-row">
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm font-medium text-gray-900">
                              {item.itemName}
                            </div>
                            <div className="text-xs text-gray-500 print-only">
                              {item.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-gray-900 text-center">
                              {item.beginningInventory}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-blue-900 font-medium text-center">
                              {item.receive1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-blue-900 font-medium text-center">
                              {item.receive2}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-blue-900 font-medium text-center">
                              {item.receive3}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-purple-900 font-medium text-center">
                              {item.currentStock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div className="text-sm text-red-900 font-medium text-center">
                              {item.itemsUsed}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell">
                            <div
                              className={`text-sm font-bold text-center ${
                                item.availableInventory < 0
                                  ? "text-red-600"
                                  : item.availableInventory === 0
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {item.availableInventory}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap print-cell no-print">
                            <div className="text-sm text-gray-500">
                              {item.unit}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals Row */}
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr className="font-bold">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          TOTALS
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                          {getTotalBeginning()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-900 text-center">
                          {getTotalReceive1()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-900 text-center">
                          {getTotalReceive2()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-900 text-center">
                          {getTotalReceive3()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-purple-900 text-center">
                          {getTotalCurrentStock()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-red-900 text-center">
                          {getTotalUsed()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-900 text-center">
                          {getTotalAvailable()}
                        </td>
                        <td className="px-6 py-4 no-print" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Report Notes - Hidden in print */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 no-print">
                <h5 className="font-medium text-yellow-800 mb-2">
                  Report Information
                </h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • <strong>Beginning Inventory:</strong> Starting stock
                    quantities from the beginning inventory field
                  </li>
                  <li>
                    • <strong>Receive 1, 2, 3:</strong> Individual received
                    inventory fields that are completely independent
                  </li>
                  <li>
                    • <strong>Current Stock:</strong> Current stock on hand
                  </li>
                  <li>
                    • <strong>Items Used:</strong> Calculated from completed
                    locations and their required quantities
                  </li>
                  <li>
                    • <strong>Available Inventory:</strong> Beginning + Receive
                    1 + Receive 2 + Receive 3 + Current Stock - Items Used
                  </li>
                  <li>
                    • This report matches the inventory tab layout exactly for
                    consistent data presentation
                  </li>
                  <li>
                    • Items are sorted in the same order as the inventory tab:
                    Belts (A18-A60, B30-B60), Filters (by size), then Other
                    items alphabetically
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 no-print">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
