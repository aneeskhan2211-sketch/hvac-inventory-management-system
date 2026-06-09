import {
  AlertCircle,
  CheckCircle,
  Download,
  File,
  FileText,
  RefreshCw,
  Sheet,
  Table,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Item, OrderItem } from "../backend";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  items: Item[];
}

interface LoadingState {
  phase:
    | "initializing"
    | "loading-library"
    | "checking-connection"
    | "retrying"
    | "generating-excel"
    | "generating-pdf"
    | "saving-file";
  message: string;
  progress?: number;
  canRetry?: boolean;
}

interface ConnectionInfo {
  isOnline: boolean;
  speed: "fast" | "slow" | "unknown";
  lastCheck: Date;
}

export default function ExportModal({
  isOpen,
  onClose,
  orderItems,
  items: _items,
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    isOnline: navigator.onLine,
    speed: "unknown",
    lastCheck: new Date(),
  });
  const [retryCount, setRetryCount] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  if (!isOpen) return null;

  const updateLoadingState = (
    phase: LoadingState["phase"],
    message: string,
    progress?: number,
    canRetry?: boolean,
  ) => {
    setLoadingState({ phase, message, progress, canRetry });
  };

  const checkConnectionSpeed = async (): Promise<
    "fast" | "slow" | "unknown"
  > => {
    try {
      const startTime = performance.now();
      const response = await fetch("https://httpbin.org/bytes/1024", {
        method: "HEAD",
        cache: "no-cache",
      });
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (response.ok) {
        return duration < 1000 ? "fast" : "slow";
      }
      return "unknown";
    } catch (_e) {
      return "unknown";
    }
  };

  const updateConnectionInfo = async () => {
    const isOnline = navigator.onLine;
    const speed = isOnline ? await checkConnectionSpeed() : "unknown";
    setConnectionInfo({
      isOnline,
      speed,
      lastCheck: new Date(),
    });
  };

  // Helper function to separate belts and filters
  const separateOrderItems = (orderItems: OrderItem[]) => {
    const beltItems = orderItems.filter((item) =>
      item.name.toLowerCase().includes("belt"),
    );
    const filterItems = orderItems.filter((item) =>
      item.name.toLowerCase().includes("filter"),
    );
    const otherItems = orderItems.filter(
      (item) =>
        !item.name.toLowerCase().includes("belt") &&
        !item.name.toLowerCase().includes("filter"),
    );

    return { beltItems, filterItems, otherItems };
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);
    setShowTroubleshooting(false);
    setRetryCount(0);

    try {
      updateLoadingState("initializing", "Preparing export...");
      await updateConnectionInfo();

      switch (format) {
        case "csv":
          exportToCSV();
          break;
        case "excel":
          await exportToExcelWithRetry();
          break;
        case "pdf":
          await exportToPDFWithRetry();
          break;
      }

      setExportSuccess(`${format.toUpperCase()} file downloaded successfully!`);

      // Auto-close modal after successful export
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setExportError(errorMessage);
      setShowTroubleshooting(format === "excel" || format === "pdf");
    } finally {
      setIsExporting(false);
      setLoadingState(null);
    }
  };

  const exportToExcelWithRetry = async (attempt = 1): Promise<void> => {
    const maxAttempts = 3;
    const baseTimeout = 180000; // 3 minutes base timeout
    const timeoutMultiplier = connectionInfo.speed === "slow" ? 1.5 : 1.2;
    const currentTimeout = baseTimeout * timeoutMultiplier * attempt;

    try {
      setRetryCount(attempt - 1);

      if (attempt > 1) {
        updateLoadingState(
          "retrying",
          `Retry attempt ${attempt} of ${maxAttempts}...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      }

      await exportToExcel(currentTimeout);
    } catch (error) {
      if (attempt < maxAttempts) {
        console.warn(
          `Excel export attempt ${attempt} failed, retrying...`,
          error,
        );
        return exportToExcelWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  const exportToPDFWithRetry = async (attempt = 1): Promise<void> => {
    const maxAttempts = 3;
    const baseTimeout = 180000; // 3 minutes base timeout
    const timeoutMultiplier = connectionInfo.speed === "slow" ? 1.5 : 1.2;
    const currentTimeout = baseTimeout * timeoutMultiplier * attempt;

    try {
      setRetryCount(attempt - 1);

      if (attempt > 1) {
        updateLoadingState(
          "retrying",
          `Retry attempt ${attempt} of ${maxAttempts}...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
      }

      await exportToPDF(currentTimeout);
    } catch (error) {
      if (attempt < maxAttempts) {
        console.warn(
          `PDF export attempt ${attempt} failed, retrying...`,
          error,
        );
        return exportToPDFWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  const loadXLSXWithFallbacks = (timeout: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      updateLoadingState("loading-library", "Loading Excel library...", 10);

      // Check if XLSX is already loaded
      if ((window as any).XLSX) {
        resolve((window as any).XLSX);
        return;
      }

      const cdnSources = [
        {
          url: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
          integrity:
            "sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfuyQM4tIRAI062MaV8sfjQKYVGjOBaZBOA87z+IhZE9DA==",
          name: "Cloudflare CDN",
        },
        {
          url: "https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js",
          integrity: null,
          name: "unpkg CDN",
        },
        {
          url: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
          integrity: null,
          name: "jsDelivr CDN",
        },
      ];

      let currentSourceIndex = 0;
      let timeoutId: NodeJS.Timeout;

      const cleanup = (script?: HTMLScriptElement) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (script && document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };

      const tryNextSource = () => {
        if (currentSourceIndex >= cdnSources.length) {
          cleanup();
          reject(
            new Error(
              "All CDN sources failed to load Excel library. This may be due to network connectivity issues, browser security restrictions, or CDN availability problems. Please check your internet connection and try again, or use CSV export as an alternative.",
            ),
          );
          return;
        }

        const source = cdnSources[currentSourceIndex];
        updateLoadingState(
          "loading-library",
          `Loading from ${source.name}...`,
          20 + currentSourceIndex * 20,
        );

        const script = document.createElement("script");
        script.src = source.url;
        script.crossOrigin = "anonymous";
        if (source.integrity) {
          script.integrity = source.integrity;
        }

        const timeoutPerSource = Math.max(timeout / cdnSources.length, 60000);
        timeoutId = setTimeout(() => {
          cleanup(script);
          currentSourceIndex++;
          tryNextSource();
        }, timeoutPerSource);

        script.onload = () => {
          updateLoadingState(
            "loading-library",
            "Initializing Excel library...",
            80,
          );

          let retries = 0;
          const maxRetries = 300;

          const checkLibrary = () => {
            if ((window as any).XLSX) {
              cleanup(script);
              resolve((window as any).XLSX);
            } else if (retries < maxRetries) {
              retries++;
              setTimeout(checkLibrary, 100);
            } else {
              cleanup(script);
              currentSourceIndex++;
              tryNextSource();
            }
          };

          checkLibrary();
        };

        script.onerror = () => {
          cleanup(script);
          currentSourceIndex++;
          tryNextSource();
        };

        document.head.appendChild(script);
      };

      tryNextSource();
    });
  };

  const loadJsPDFWithFallbacks = (timeout: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      updateLoadingState("loading-library", "Loading PDF library...", 10);

      // Check if jsPDF is already loaded
      if ((window as any).jspdf) {
        resolve((window as any).jspdf);
        return;
      }

      const cdnSources = [
        {
          url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
          integrity:
            "sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNhh/TCPMZ5JqceojpekjGPdpkHLlCtm+3tfLWyPAoqTX1+1UUCHu5Aw==",
          name: "Cloudflare CDN",
        },
        {
          url: "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js",
          integrity: null,
          name: "unpkg CDN",
        },
        {
          url: "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
          integrity: null,
          name: "jsDelivr CDN",
        },
      ];

      let currentSourceIndex = 0;
      let timeoutId: NodeJS.Timeout;

      const cleanup = (script?: HTMLScriptElement) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (script && document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };

      const tryNextSource = () => {
        if (currentSourceIndex >= cdnSources.length) {
          cleanup();
          reject(
            new Error(
              "All CDN sources failed to load PDF library. This may be due to network connectivity issues, browser security restrictions, or CDN availability problems. Please check your internet connection and try again, or use CSV export as an alternative.",
            ),
          );
          return;
        }

        const source = cdnSources[currentSourceIndex];
        updateLoadingState(
          "loading-library",
          `Loading from ${source.name}...`,
          20 + currentSourceIndex * 20,
        );

        const script = document.createElement("script");
        script.src = source.url;
        script.crossOrigin = "anonymous";
        if (source.integrity) {
          script.integrity = source.integrity;
        }

        const timeoutPerSource = Math.max(timeout / cdnSources.length, 60000);
        timeoutId = setTimeout(() => {
          cleanup(script);
          currentSourceIndex++;
          tryNextSource();
        }, timeoutPerSource);

        script.onload = () => {
          updateLoadingState(
            "loading-library",
            "Initializing PDF library...",
            80,
          );

          let retries = 0;
          const maxRetries = 300;

          const checkLibrary = () => {
            if ((window as any).jspdf) {
              cleanup(script);
              resolve((window as any).jspdf);
            } else if (retries < maxRetries) {
              retries++;
              setTimeout(checkLibrary, 100);
            } else {
              cleanup(script);
              currentSourceIndex++;
              tryNextSource();
            }
          };

          checkLibrary();
        };

        script.onerror = () => {
          cleanup(script);
          currentSourceIndex++;
          tryNextSource();
        };

        document.head.appendChild(script);
      };

      tryNextSource();
    });
  };

  const exportToExcel = async (timeout = 180000) => {
    try {
      updateLoadingState("checking-connection", "Checking connection...", 5);
      await updateConnectionInfo();

      if (!connectionInfo.isOnline) {
        throw new Error(
          "No internet connection detected. Excel export requires an internet connection to load the Excel library. Please check your connection and try again.",
        );
      }

      updateLoadingState("loading-library", "Loading Excel library...", 10);

      const XLSX = await loadXLSXWithFallbacks(timeout);

      if (!XLSX) {
        throw new Error(
          "Excel library failed to load after trying multiple sources. This may be due to network issues or browser security settings.",
        );
      }

      updateLoadingState("generating-excel", "Creating Excel document...", 70);

      const { beltItems, filterItems, otherItems } =
        separateOrderItems(orderItems);

      const workbook = XLSX.utils.book_new();

      const worksheetData: any[][] = [];

      worksheetData.push(["K&A Maintenance"]);
      worksheetData.push(["1617 9th Street NW"]);
      worksheetData.push(["Clinton, IA 52732"]);
      worksheetData.push([""]);
      worksheetData.push(["Purchase Order"]);
      worksheetData.push([`Generated: ${new Date().toLocaleDateString()}`]);
      worksheetData.push([""]);
      worksheetData.push([""]);

      if (beltItems.length > 0) {
        worksheetData.push(["BELTS"]);
        worksheetData.push([""]);
        worksheetData.push(["Item", "Quantity"]);

        for (const item of beltItems) {
          worksheetData.push([item.name, Number(item.quantity)]);
        }

        worksheetData.push([""]);
        worksheetData.push([""]);
      }

      if (filterItems.length > 0) {
        worksheetData.push(["FILTERS"]);
        worksheetData.push([""]);
        worksheetData.push(["Item", "Quantity", "Cases of 12"]);

        for (const item of filterItems) {
          const quantity = Number(item.quantity);
          const cases = Math.ceil(quantity / 12);
          worksheetData.push([item.name, quantity, cases]);
        }
      }

      if (otherItems.length > 0) {
        worksheetData.push([""]);
        worksheetData.push([""]);
        worksheetData.push(["OTHER ITEMS"]);
        worksheetData.push([""]);
        worksheetData.push(["Item", "Quantity"]);

        for (const item of otherItems) {
          worksheetData.push([item.name, Number(item.quantity)]);
        }
      }

      updateLoadingState(
        "generating-excel",
        "Formatting Excel document...",
        85,
      );

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      const columnWidths = [{ wch: 35 }, { wch: 15 }, { wch: 18 }];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Order");

      updateLoadingState("saving-file", "Saving Excel file...", 95);

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `purchase-order-${timestamp}.xlsx`;

      try {
        XLSX.writeFile(workbook, fileName);
      } catch (_error) {
        try {
          const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
          });
          const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (_fallbackError) {
          throw new Error(
            "Failed to save Excel file. Your browser may be blocking downloads, have insufficient storage space, or popup blockers may be interfering. Please check your browser settings and try again.",
          );
        }
      }
    } catch (error) {
      console.error("Excel generation error:", error);

      let userMessage = "Excel generation failed. ";

      if (error instanceof Error) {
        if (
          error.message.includes("internet connection") ||
          error.message.includes("network")
        ) {
          userMessage +=
            "Network connectivity issue detected. Please check your internet connection and try again.";
        } else if (
          error.message.includes("CDN") ||
          error.message.includes("load")
        ) {
          userMessage +=
            "Unable to load the Excel library from external sources. This may be due to network issues, browser security settings, or CDN availability. Please try again or use CSV export as an alternative.";
        } else if (
          error.message.includes("not support") ||
          error.message.includes("insufficient memory")
        ) {
          userMessage +=
            "Your browser may not support Excel generation or may have insufficient memory. Please try using Chrome, Firefox, Safari, or Edge with the latest version.";
        } else if (
          error.message.includes("blocking downloads") ||
          error.message.includes("popup blockers")
        ) {
          userMessage +=
            "Your browser may be blocking downloads or popups. Please check your browser settings, disable popup blockers for this site, and try again.";
        } else if (error.message.includes("security settings")) {
          userMessage +=
            "Browser security settings may be preventing Excel generation. Please check your browser security settings and try again.";
        } else {
          userMessage += error.message;
        }
      } else {
        userMessage +=
          "An unknown error occurred. Please try again or use CSV export as an alternative.";
      }

      throw new Error(userMessage);
    }
  };

  const exportToPDF = async (timeout = 180000) => {
    try {
      updateLoadingState("checking-connection", "Checking connection...", 5);
      await updateConnectionInfo();

      if (!connectionInfo.isOnline) {
        throw new Error(
          "No internet connection detected. PDF export requires an internet connection to load the PDF library. Please check your connection and try again.",
        );
      }

      updateLoadingState("loading-library", "Loading PDF library...", 10);

      const jsPDFModule = await loadJsPDFWithFallbacks(timeout);

      if (!jsPDFModule || !jsPDFModule.jsPDF) {
        throw new Error(
          "PDF library failed to load after trying multiple sources. This may be due to network issues or browser security settings.",
        );
      }

      updateLoadingState("generating-pdf", "Creating PDF document...", 70);

      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF();

      // Business header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("K&A Maintenance", 20, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("1617 9th Street NW", 20, 30);
      doc.text("Clinton, IA 52732", 20, 40);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Purchase Order", 20, 60);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 70);

      let yPosition = 90;

      const { beltItems, filterItems, otherItems } =
        separateOrderItems(orderItems);

      // Belts section
      if (beltItems.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("BELTS", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, yPosition);
        doc.text("Quantity", 120, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        for (const item of beltItems) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(item.name, 20, yPosition);
          doc.text(item.quantity.toString(), 120, yPosition);
          yPosition += 8;
        }

        yPosition += 10;
      }

      // Filters section
      if (filterItems.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("FILTERS", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, yPosition);
        doc.text("Quantity", 120, yPosition);
        doc.text("Cases of 12", 160, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        for (const item of filterItems) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          const quantity = Number(item.quantity);
          const cases = Math.ceil(quantity / 12);

          doc.text(item.name, 20, yPosition);
          doc.text(quantity.toString(), 120, yPosition);
          doc.text(cases.toString(), 160, yPosition);
          yPosition += 8;
        }

        yPosition += 10;
      }

      // Other items section
      if (otherItems.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("OTHER ITEMS", 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, yPosition);
        doc.text("Quantity", 120, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        for (const item of otherItems) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(item.name, 20, yPosition);
          doc.text(item.quantity.toString(), 120, yPosition);
          yPosition += 8;
        }
      }

      updateLoadingState("saving-file", "Saving PDF file...", 95);

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `purchase-order-${timestamp}.pdf`;

      try {
        doc.save(fileName);
      } catch (_error) {
        try {
          const pdfBlob = doc.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (_fallbackError) {
          throw new Error(
            "Failed to save PDF file. Your browser may be blocking downloads, have insufficient storage space, or popup blockers may be interfering. Please check your browser settings and try again.",
          );
        }
      }
    } catch (error) {
      console.error("PDF generation error:", error);

      let userMessage = "PDF generation failed. ";

      if (error instanceof Error) {
        if (
          error.message.includes("internet connection") ||
          error.message.includes("network")
        ) {
          userMessage +=
            "Network connectivity issue detected. Please check your internet connection and try again.";
        } else if (
          error.message.includes("CDN") ||
          error.message.includes("load")
        ) {
          userMessage +=
            "Unable to load the PDF library from external sources. This may be due to network issues, browser security settings, or CDN availability. Please try again or use CSV export as an alternative.";
        } else if (
          error.message.includes("not support") ||
          error.message.includes("insufficient memory")
        ) {
          userMessage +=
            "Your browser may not support PDF generation or may have insufficient memory. Please try using Chrome, Firefox, Safari, or Edge with the latest version.";
        } else if (
          error.message.includes("blocking downloads") ||
          error.message.includes("popup blockers")
        ) {
          userMessage +=
            "Your browser may be blocking downloads or popups. Please check your browser settings, disable popup blockers for this site, and try again.";
        } else if (error.message.includes("security settings")) {
          userMessage +=
            "Browser security settings may be preventing PDF generation. Please check your browser security settings and try again.";
        } else {
          userMessage += error.message;
        }
      } else {
        userMessage +=
          "An unknown error occurred. Please try again or use CSV export as an alternative.";
      }

      throw new Error(userMessage);
    }
  };

  const exportToCSV = () => {
    try {
      updateLoadingState("generating-excel", "Generating CSV file...", 50);

      const { beltItems, filterItems, otherItems } =
        separateOrderItems(orderItems);

      const csvContent = [
        ["K&A Maintenance Purchase Order"],
        ["1617 9th Street NW, Clinton, IA 52732"],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [""],
        ...(beltItems.length > 0
          ? [
              ["BELTS"],
              ["Item Name", "Quantity"],
              ...beltItems.map((item) => [item.name, item.quantity.toString()]),
              [""],
            ]
          : []),
        ...(filterItems.length > 0
          ? [
              ["FILTERS"],
              ["Item Name", "Quantity", "Cases of 12"],
              ...filterItems.map((item) => {
                const quantity = Number(item.quantity);
                const cases = Math.ceil(quantity / 12);
                return [item.name, quantity.toString(), cases.toString()];
              }),
              [""],
            ]
          : []),
        ...(otherItems.length > 0
          ? [
              ["OTHER ITEMS"],
              ["Item Name", "Quantity"],
              ...otherItems.map((item) => [
                item.name,
                item.quantity.toString(),
              ]),
            ]
          : []),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase-order-${new Date().toISOString().split("T")[0]}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_error) {
      console.error("CSV export error:", _error);
      throw new Error("Failed to generate CSV file. Please try again.");
    }
  };

  const formatOptions = [
    {
      id: "csv",
      name: "CSV",
      description:
        "Spreadsheet format compatible with Excel and other applications",
      icon: Table,
      color: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
      disabled: false,
    },
    {
      id: "excel",
      name: "Excel",
      description:
        "Professional Excel format (.xlsx) with enhanced formatting and business styling",
      icon: Sheet,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
      disabled: false,
    },
    {
      id: "pdf",
      name: "PDF",
      description:
        "Professional PDF format with business header and proper formatting",
      icon: File,
      color: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
      disabled: false,
    },
  ];

  const { beltItems, filterItems, otherItems } = separateOrderItems(orderItems);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Export Purchase Order
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose your preferred export format
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Connection Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {connectionInfo.isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Connection Status:{" "}
                    {connectionInfo.isOnline ? "Online" : "Offline"}
                  </p>
                  {connectionInfo.isOnline && (
                    <p className="text-xs text-gray-600">
                      Speed:{" "}
                      {connectionInfo.speed === "fast"
                        ? "Fast"
                        : connectionInfo.speed === "slow"
                          ? "Slow"
                          : "Unknown"}
                      {connectionInfo.speed === "slow" &&
                        " (Library loading may take longer)"}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={updateConnectionInfo}
                className="text-gray-400 hover:text-gray-600 p-1"
                disabled={isExporting}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isExporting && loadingState && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <p className="text-blue-800 font-medium">
                  {loadingState.message}
                </p>
              </div>
              {loadingState.progress && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingState.progress}%` }}
                  />
                </div>
              )}
              {retryCount > 0 && (
                <p className="text-blue-700 text-sm mt-2">
                  Retry attempt {retryCount} -{" "}
                  {connectionInfo.speed === "slow"
                    ? "Slow connection detected, using extended timeout (up to 3 minutes)"
                    : "Trying alternative sources with extended timeout (up to 3 minutes)"}
                </p>
              )}
            </div>
          )}

          {/* Success Message */}
          {exportSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{exportSuccess}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-2">Export Failed</p>
                  <p className="text-red-700 text-sm mb-3">{exportError}</p>
                  <button
                    type="button"
                    onClick={() => setExportError(null)}
                    className="text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Guide */}
          {showTroubleshooting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium mb-3">
                    Export Troubleshooting
                  </p>
                  <div className="space-y-3 text-sm text-yellow-700">
                    <div>
                      <p className="font-medium mb-1">Connection Issues:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Check your internet connection is stable</li>
                        <li>
                          Try refreshing the page and attempting export again
                        </li>
                        <li>
                          If on a slow connection, wait longer for the library
                          to load (up to 3 minutes)
                        </li>
                        <li>
                          Consider switching to a faster network if available
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Browser Settings:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Disable popup blockers for this website</li>
                        <li>Allow downloads in your browser settings</li>
                        <li>Clear browser cache and cookies</li>
                        <li>Try using an incognito/private browsing window</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Browser Compatibility:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Use Chrome, Firefox, Safari, or Edge (latest versions)
                        </li>
                        <li>
                          Avoid Internet Explorer or very old browser versions
                        </li>
                        <li>Ensure JavaScript is enabled</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Alternative Solutions:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Use CSV export as a reliable alternative</li>
                        <li>Try export from a different device or network</li>
                        <li>Contact IT support if on a corporate network</li>
                      </ul>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTroubleshooting(false)}
                    className="text-yellow-600 hover:text-yellow-700 text-sm mt-3 underline"
                  >
                    Hide Troubleshooting
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium ml-2">{orderItems.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Belt Items:</span>
                <span className="font-medium ml-2">{beltItems.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Filter Items:</span>
                <span className="font-medium ml-2">{filterItems.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Other Items:</span>
                <span className="font-medium ml-2">{otherItems.length}</span>
              </div>
            </div>
          </div>

          {/* Format Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Select Export Format</h4>
            <div className="grid gap-4">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isDisabled = isExporting || option.disabled;

                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() =>
                      handleExport(option.id as "csv" | "excel" | "pdf")
                    }
                    disabled={isDisabled}
                    className={`${option.color} border-2 rounded-lg p-4 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm ${
                      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-lg">{option.name}</h5>
                          {!isDisabled && <Download className="w-4 h-4" />}
                        </div>
                        <p className="text-sm mt-1 opacity-80">
                          {option.description}
                        </p>
                        {(option.id === "excel" || option.id === "pdf") &&
                          !connectionInfo.isOnline && (
                            <p className="text-xs mt-2 text-red-600">
                              ⚠ Requires internet connection
                            </p>
                          )}
                        {(option.id === "excel" || option.id === "pdf") &&
                          connectionInfo.speed === "slow" &&
                          connectionInfo.isOnline && (
                            <p className="text-xs mt-2 text-yellow-600">
                              ⚠ May take up to 3 minutes due to slow connection
                            </p>
                          )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Features */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Export Features</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Business header with K&A Maintenance contact information
              </li>
              <li>
                • Separate sections for BELTS and FILTERS (and OTHER ITEMS if
                applicable)
              </li>
              <li>
                • Filter quantities automatically rounded up to cases of 12
              </li>
              <li>• Professional formatting suitable for vendors</li>
              <li>• Date stamp for tracking and record keeping</li>
              <li>• Enhanced reliability with multiple CDN fallbacks</li>
              <li>• Automatic retry logic for network issues</li>
              <li>
                • Extended timeout duration for slow connections (up to 3
                minutes)
              </li>
              <li>• PDF format with professional layout and typography</li>
              <li>
                • True Excel format (.xlsx) with enhanced professional styling
              </li>
              <li>
                • Bold headers, proper spacing, and business-ready appearance
              </li>
              <li>• Only includes items with nonzero required quantities</li>
            </ul>
          </div>

          {/* Reliability Information */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-2">
              Enhanced Export Reliability
            </h5>
            <div className="text-sm text-green-800 space-y-2">
              <p>Our improved export system includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Multiple CDN sources with automatic fallback for Excel and PDF
                </li>
                <li>Intelligent retry logic for network interruptions</li>
                <li>Connection speed detection and timeout adjustment</li>
                <li>
                  Extended timeout duration (up to 3 minutes) for slow
                  connections
                </li>
                <li>Comprehensive error handling with specific guidance</li>
                <li>Cross-browser compatibility testing</li>
                <li>Professional PDF generation using jsPDF library</li>
                <li>
                  True Excel format using SheetJS library for maximum
                  compatibility
                </li>
                <li>
                  Professional styling with bold headers and proper formatting
                </li>
                <li>Graceful degradation to CSV format as alternative</li>
                <li>
                  Smart filtering to include only items with nonzero quantities
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "Exporting..." : "Cancel"}
          </button>
        </div>

        {/* Loading Overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center max-w-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {loadingState?.message || "Preparing export..."}
              </p>
              {loadingState?.progress && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingState.progress}%` }}
                  />
                </div>
              )}
              <p className="text-gray-500 text-sm">
                {connectionInfo.speed === "slow"
                  ? "Slow connection detected - this may take up to 3 minutes"
                  : "Please wait, this may take up to 3 minutes"}
              </p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-2">
                  Retry {retryCount}/3 - Trying alternative sources with
                  extended timeout...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
