import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  "data-ocid"?: string;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchable,
  searchPlaceholder = "Search…",
  searchFn,
  pageSize = 15,
  emptyMessage = "No records found.",
  className,
  onRowClick,
  "data-ocid": dataOcid,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query || !searchFn) return data;
    return data.filter((row) => searchFn(row, query.toLowerCase()));
  }, [data, query, searchFn]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      if (!col?.accessor) return 0;
      const av = String(col.accessor(a) ?? "");
      const bv = String(col.accessor(b) ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(1);
  }

  function handleSearch(v: string) {
    setQuery(v);
    setPage(1);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} data-ocid={dataOcid}>
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-ocid={dataOcid ? `${dataOcid}.search_input` : undefined}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                      col.sortable &&
                        "cursor-pointer select-none hover:text-foreground",
                      col.headerClassName,
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      col.sortable &&
                      handleSort(col.key)
                    }
                  >
                    <span className="flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-8 text-center text-sm text-muted-foreground"
                    data-ocid={dataOcid ? `${dataOcid}.empty_state` : undefined}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr
                    key={rowKey(row)}
                    data-ocid={
                      dataOcid
                        ? `${dataOcid}.item.${(safePage - 1) * pageSize + idx + 1}`
                        : undefined
                    }
                    className={cn(
                      "transition-colors duration-100",
                      onRowClick && "cursor-pointer hover:bg-muted/40",
                    )}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && onRowClick?.(row)
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-3 py-2.5 text-foreground",
                          col.className,
                        )}
                      >
                        {col.accessor
                          ? col.accessor(row)
                          : (row as Record<string, ReactNode>)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {sorted.length} records &bull; Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              data-ocid={dataOcid ? `${dataOcid}.pagination_prev` : undefined}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              data-ocid={dataOcid ? `${dataOcid}.pagination_next` : undefined}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
