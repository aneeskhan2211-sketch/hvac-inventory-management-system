import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CustomReport,
  type GasketInfo,
  type Item,
  type Location,
  type OrderItem,
  StagingReport,
  type StockLevel,
  type UserProfile,
  UserRole,
} from "../backend";

// Define InventoryReportItem type locally since it's not in the backend interface
interface InventoryReportItem {
  itemId: bigint;
  itemName: string;
  beginningInventory: number;
  receive1: number;
  receive2: number;
  receive3: number;
  currentStock: number;
  totalInventory: number;
  itemsUsed: number;
  availableInventory: number;
  unit: string;
}

// Define UserInfo type locally to include profile information
// This extends the backend UserInfo with profile data
export interface UserInfo {
  principal: string;
  profile: UserProfile;
  role: UserRole;
}

// Helper function to sort items according to the specified order
function sortItemsForInventory(items: Item[]): Item[] {
  return items.sort((a, b) => {
    const aIsBelt = a.name.toLowerCase().includes("belt");
    const bIsBelt = b.name.toLowerCase().includes("belt");
    const aIsFilter = a.name.toLowerCase().includes("filter");
    const bIsFilter = b.name.toLowerCase().includes("filter");

    // If both are belts, sort by belt size
    if (aIsBelt && bIsBelt) {
      return sortBeltsBySize(a.name, b.name);
    }

    // If both are filters, sort by filter size
    if (aIsFilter && bIsFilter) {
      return sortFiltersBySize(a.name, b.name);
    }

    // Belts come first
    if (aIsBelt && !bIsBelt) return -1;
    if (!aIsBelt && bIsBelt) return 1;

    // Filters come second
    if (aIsFilter && !bIsFilter) return -1;
    if (!aIsFilter && bIsFilter) return 1;

    // Other items come last, sorted alphabetically
    return a.name.localeCompare(b.name);
  });
}

// Helper function to sort belts by size (A18–A60, then B30–B60)
function sortBeltsBySize(nameA: string, nameB: string): number {
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
}

// Helper function to sort filters by size (2-inch filters only, ascending by size)
function sortFiltersBySize(nameA: string, nameB: string): number {
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
}

// Helper function to sort stock levels based on item ordering
function sortStockLevelsForInventory(
  stockLevels: StockLevel[],
  items: Item[],
): StockLevel[] {
  // Create a map of item ID to item for quick lookup
  // Sort the sorted items to get the correct order
  const sortedItems = sortItemsForInventory(items);
  const itemOrderMap = new Map(
    sortedItems.map((item, index) => [item.id.toString(), index]),
  );

  return stockLevels.sort((a, b) => {
    const orderA =
      itemOrderMap.get(a.itemId.toString()) ?? Number.MAX_SAFE_INTEGER;
    const orderB =
      itemOrderMap.get(b.itemId.toString()) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

// Enhanced helper function to sort order items with comprehensive item matching
function sortOrderItemsForInventory(
  orderItems: OrderItem[],
  items: Item[],
): OrderItem[] {
  // Create a comprehensive map of item names to items for quick lookup
  // Sort the items to get the correct order
  const sortedItems = sortItemsForInventory(items);
  const itemOrderMap = new Map(
    sortedItems.map((item, index) => [item.name.toLowerCase(), index]),
  );

  return orderItems.sort((a, b) => {
    // Use the item name from the order item to determine sort order
    const orderA =
      itemOrderMap.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const orderB =
      itemOrderMap.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

    // If both items have the same order (shouldn't happen), fall back to name comparison
    if (orderA === orderB) {
      return a.name.localeCompare(b.name);
    }

    return orderA - orderB;
  });
}

// Helper function to sort staging report items
function sortStagingReportItems(
  items: Array<[string, bigint]>,
): Array<[string, bigint]> {
  return items.sort((a, b) => {
    const [nameA] = a;
    const [nameB] = b;

    const aIsBelt = nameA.toLowerCase().includes("belt");
    const bIsBelt = nameB.toLowerCase().includes("belt");
    const aIsFilter = nameA.toLowerCase().includes("filter");
    const bIsFilter = nameB.toLowerCase().includes("filter");

    // If both are belts, sort by belt size
    if (aIsBelt && bIsBelt) {
      return sortBeltsBySize(nameA, nameB);
    }

    // If both are filters, sort by filter size
    if (aIsFilter && bIsFilter) {
      return sortFiltersBySize(nameA, nameB);
    }

    // Belts come first
    if (aIsBelt && !bIsBelt) return -1;
    if (!aIsBelt && bIsBelt) return 1;

    // Filters come second
    if (aIsFilter && !bIsFilter) return -1;
    if (!aIsFilter && bIsFilter) return 1;

    // Other items come last, sorted alphabetically
    return nameA.localeCompare(nameB);
  });
}

// User management queries - All authenticated users have full admin access
export function useGetCallerUserProfile() {
  return {
    data: null as UserProfile | null,
    isLoading: false,
    isFetched: true,
    error: null,
  };
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_profile: UserProfile) => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerUserRole() {
  return useQuery<UserRole>({
    queryKey: ["currentUserRole"],
    queryFn: async () => UserRole.admin,
    staleTime: 60000,
  });
}

// User Management - All authenticated users have full access
export function useListUsers() {
  return useQuery<UserInfo[]>({
    queryKey: ["users"],
    queryFn: async () => [],
    staleTime: 60000,
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_args: { user: string; role: UserRole }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_user: string) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Location queries and mutations - All authenticated users have full access
export function useGetAllLocations() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLocations();
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useSearchLocations() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (searchTerm: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchLocations(searchTerm);
    },
  });
}

export function useCreateLocation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      beltRequirements,
      filterRequirements,
    }: {
      name: string;
      beltRequirements: Array<[string, bigint]>;
      filterRequirements: Array<[string, bigint]>;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createLocation(name, beltRequirements, filterRequirements);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateLocation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      beltRequirements,
      filterRequirements,
    }: {
      id: bigint;
      name: string;
      beltRequirements: Array<[string, bigint]>;
      filterRequirements: Array<[string, bigint]>;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLocation(
        id,
        name,
        beltRequirements,
        filterRequirements,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteLocation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteLocation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocationCompletionStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      completed,
    }: { id: bigint; completed: boolean }) => {
      if (!actor) throw new Error("Actor not available");

      try {
        await actor.updateLocationCompletionStatus(id, completed);

        return {
          success: true,
          locationId: id,
          completed,
          message: completed
            ? "Location marked as completed."
            : "Location marked as incomplete.",
        };
      } catch (error: any) {
        console.error("Completion status update failed:", error);

        let errorMessage = "Failed to update completion status";

        if (error.message) {
          const message = error.message;

          if (
            message.includes("Insufficient inventory") ||
            message.includes("Insufficient") ||
            message.includes("not enough") ||
            message.includes("stock") ||
            message.includes("need ") ||
            message.includes("have ")
          ) {
            errorMessage = `Cannot complete location due to insufficient inventory:\n\n${message}\n\nPlease update inventory levels before marking as completed.`;
          } else if (message.includes("not found")) {
            errorMessage =
              "Location or required items not found. Please refresh the page and try again.";
          } else if (
            message.includes("Unauthorized") ||
            message.includes("permission")
          ) {
            errorMessage = "You do not have permission to perform this action.";
          } else if (
            message.includes("trap") ||
            message.includes("Debug.trap")
          ) {
            errorMessage =
              "Operation failed due to insufficient inventory or permissions. Please check inventory levels and try again.";
          } else {
            errorMessage = message;
          }
        }

        throw new Error(errorMessage);
      }
    },
    onSuccess: async (result) => {
      console.log("Completion status updated successfully:", result.message);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["locations"] }),
        queryClient.invalidateQueries({ queryKey: ["stockLevels"] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["locations"] }),
        queryClient.refetchQueries({ queryKey: ["stockLevels"] }),
      ]);
    },
    onError: async (error) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["locations"] }),
        queryClient.invalidateQueries({ queryKey: ["stockLevels"] }),
      ]);

      await queryClient.refetchQueries({ queryKey: ["locations"] });

      console.error("Completion status update failed:", error);
    },
    retry: (failureCount, error) => {
      if (
        error.message.includes("Insufficient") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("not found") ||
        error.message.includes("trap")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUpdateLocationActiveStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: bigint; active: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLocationActiveStatus(id, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// Item queries and mutations - All authenticated users have full access
export function useGetAllItems() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getAllItems();
      return sortItemsForInventory(items);
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useCreateItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      unit,
    }: { name: string; description: string; unit: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createItem(name, description, unit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      unit,
    }: { id: bigint; name: string; description: string; unit: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateItem(id, name, description, unit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// Stock level queries and mutations - All authenticated users have full access
export function useGetAllStockLevels() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<StockLevel[]>({
    queryKey: ["stockLevels"],
    queryFn: async () => {
      if (!actor) return [];
      const [stockLevels, items] = await Promise.all([
        actor.getAllStockLevels(),
        actor.getAllItems(),
      ]);
      return sortStockLevelsForInventory(stockLevels, items);
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

export function useGetStockLevelByItemId() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStockLevelByItemId(itemId);
    },
  });
}

export function useUpdateStockLevel() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      beginningInventory,
      receive1,
      receive2,
      receive3,
      currentStock,
    }: {
      itemId: bigint;
      beginningInventory: bigint;
      receive1: bigint;
      receive2: bigint;
      receive3: bigint;
      currentStock: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStockLevel(
        itemId,
        beginningInventory,
        receive1,
        receive2,
        receive3,
        currentStock,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockLevels"] });
    },
  });
}

// Enhanced order generation using backend calculation
export function useGenerateOrder() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (): Promise<OrderItem[]> => {
      if (!actor) throw new Error("Actor not available");

      console.log("🚀 Starting order generation...");

      try {
        const orderItems = await actor.generateOrder();
        const items = await actor.getAllItems();
        const sortedOrderItems = sortOrderItemsForInventory(orderItems, items);

        console.log("✅ Order generation completed successfully");
        console.log(`📊 Generated ${sortedOrderItems.length} order items`);

        return sortedOrderItems;
      } catch (error) {
        console.error("❌ Order generation failed:", error);
        throw error;
      }
    },
  });
}

// Staging report generation
export function useGenerateStagingReport() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const reports = await actor.generateStagingReport();
      return reports.map((report) => ({
        ...report,
        items: sortStagingReportItems(report.items),
      }));
    },
  });
}

// Custom requirements report generation
export function useGenerateCustomRequirementsReport() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (locationIds: bigint[]) => {
      if (!actor) throw new Error("Actor not available");
      const report = await actor.generateCustomReport(locationIds);
      return {
        ...report,
        combinedTotals: sortStagingReportItems(report.combinedTotals),
      };
    },
  });
}

// Inventory report generation
export function useGenerateInventoryReport() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (): Promise<InventoryReportItem[]> => {
      if (!actor) throw new Error("Actor not available");

      const [items, locations, stockLevels] = await Promise.all([
        actor.getAllItems(),
        actor.getAllLocations(),
        actor.getAllStockLevels(),
      ]);

      const stockMap = new Map(
        stockLevels.map((stock) => [stock.itemId.toString(), stock]),
      );

      const calculateItemsUsed = (itemName: string): number => {
        let totalUsed = 0;
        for (const location of locations) {
          if (location.completed) {
            for (const [size, quantity] of location.beltRequirements) {
              if (itemName === `Belt ${size}`) {
                totalUsed += Number(quantity);
              }
            }

            for (const [size, quantity] of location.filterRequirements) {
              if (itemName === `Filter ${size}`) {
                totalUsed += Number(quantity);
              }
            }
          }
        }
        return totalUsed;
      };

      const inventoryReport: InventoryReportItem[] = items.map((item) => {
        const stock = stockMap.get(item.id.toString());
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
          totalInventory,
          itemsUsed,
          availableInventory,
          unit: item.unit,
        };
      });

      return inventoryReport.sort((a, b) => {
        const aIsBelt = a.itemName.toLowerCase().includes("belt");
        const bIsBelt = b.itemName.toLowerCase().includes("belt");
        const aIsFilter = a.itemName.toLowerCase().includes("filter");
        const bIsFilter = b.itemName.toLowerCase().includes("filter");

        if (aIsBelt && bIsBelt) {
          return sortBeltsBySize(a.itemName, b.itemName);
        }

        if (aIsFilter && bIsFilter) {
          return sortFiltersBySize(a.itemName, b.itemName);
        }

        if (aIsBelt && !bIsBelt) return -1;
        if (!aIsBelt && bIsBelt) return 1;

        if (aIsFilter && !bIsFilter) return -1;
        if (!aIsFilter && bIsFilter) return 1;

        return a.itemName.localeCompare(b.itemName);
      });
    },
  });
}

export function useRefreshStockLevels() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.refetchQueries({ queryKey: ["stockLevels"] });
  };
}

// Gasket Info queries and mutations - All authenticated users have full access
export function useGetAllGasketInfos() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<GasketInfo[]>({
    queryKey: ["gasketInfos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGasketInfos();
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useGetLocationGasketInfo() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (locationId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLocationGasketInfo(locationId);
    },
  });
}

export function useSaveLocationGasketInfo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      gasketInfo,
    }: { locationId: bigint; gasketInfo: GasketInfo }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveLocationGasketInfo(locationId, gasketInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gasketInfos"] });
    },
  });
}

export function useSearchGasketLocations() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (searchTerm: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchGasketLocations(searchTerm);
    },
  });
}

// ─── Mock-data-backed hooks for extended entity types ─────────────────────────
// These hooks read from the MockDataContext (the in-memory mock layer) and expose
// a React-Query-compatible shape so pages can swap to a real actor later.
// Pattern: staleTime 60000 ms, queryKey matches the entity name.

import {
  type ActivityLog,
  type AlertRule,
  type AppUser,
  type Customer,
  type Equipment,
  type PurchaseOrder,
  type ServiceKit,
  type Supplier,
  type Technician,
  type Transaction,
  type WorkOrder,
  useMockData,
} from "@/context/MockDataContext";

// ── Suppliers ──────────────────────────────────────────────────────────────
export function useSuppliers() {
  const mock = useMockData();
  return useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => mock.suppliers,
    staleTime: 60000,
  });
}

export function useSupplier(id: string) {
  const mock = useMockData();
  return useQuery<Supplier | undefined>({
    queryKey: ["suppliers", id],
    queryFn: async () => mock.suppliers.find((s) => s.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Customers ─────────────────────────────────────────────────────────────
export function useCustomers() {
  const mock = useMockData();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => mock.customers,
    staleTime: 60000,
  });
}

export function useCustomer(id: string) {
  const mock = useMockData();
  return useQuery<Customer | undefined>({
    queryKey: ["customers", id],
    queryFn: async () => mock.customers.find((c) => c.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Work Orders ───────────────────────────────────────────────────────────
export function useWorkOrders() {
  const mock = useMockData();
  return useQuery<WorkOrder[]>({
    queryKey: ["workOrders"],
    queryFn: async () => mock.workOrders,
    staleTime: 60000,
  });
}

export function useWorkOrder(id: string) {
  const mock = useMockData();
  return useQuery<WorkOrder | undefined>({
    queryKey: ["workOrders", id],
    queryFn: async () => mock.workOrders.find((w) => w.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Transactions ──────────────────────────────────────────────────────────
export function useTransactions() {
  const mock = useMockData();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => mock.transactions,
    staleTime: 60000,
  });
}

export function useTransaction(id: string) {
  const mock = useMockData();
  return useQuery<Transaction | undefined>({
    queryKey: ["transactions", id],
    queryFn: async () => mock.transactions.find((t) => t.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Purchase Orders ───────────────────────────────────────────────────────
export function usePurchaseOrders() {
  const mock = useMockData();
  return useQuery<PurchaseOrder[]>({
    queryKey: ["purchaseOrders"],
    queryFn: async () => mock.purchaseOrders,
    staleTime: 60000,
  });
}

export function usePurchaseOrder(id: string) {
  const mock = useMockData();
  return useQuery<PurchaseOrder | undefined>({
    queryKey: ["purchaseOrders", id],
    queryFn: async () => mock.purchaseOrders.find((p) => p.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Service Kits ──────────────────────────────────────────────────────────
export function useServiceKits() {
  const mock = useMockData();
  return useQuery<ServiceKit[]>({
    queryKey: ["serviceKits"],
    queryFn: async () => mock.serviceKits,
    staleTime: 60000,
  });
}

export function useServiceKit(id: string) {
  const mock = useMockData();
  return useQuery<ServiceKit | undefined>({
    queryKey: ["serviceKits", id],
    queryFn: async () => mock.serviceKits.find((k) => k.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Maintenance Records (Equipment) ───────────────────────────────────────
export function useMaintenanceRecords() {
  const mock = useMockData();
  return useQuery<Equipment[]>({
    queryKey: ["maintenanceRecords"],
    queryFn: async () => mock.equipment,
    staleTime: 60000,
  });
}

export function useMaintenanceRecord(id: string) {
  const mock = useMockData();
  return useQuery<Equipment | undefined>({
    queryKey: ["maintenanceRecords", id],
    queryFn: async () => mock.equipment.find((e) => e.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Reorder Alerts ────────────────────────────────────────────────────────
export function useReorderAlerts() {
  const mock = useMockData();
  return useQuery<AlertRule[]>({
    queryKey: ["reorderAlerts"],
    queryFn: async () => mock.alerts,
    staleTime: 60000,
  });
}

// ── Technicians ───────────────────────────────────────────────────────────
export function useTechnicians() {
  const mock = useMockData();
  return useQuery<Technician[]>({
    queryKey: ["technicians"],
    queryFn: async () => mock.technicians,
    staleTime: 60000,
  });
}

export function useTechnician(id: string) {
  const mock = useMockData();
  return useQuery<Technician | undefined>({
    queryKey: ["technicians", id],
    queryFn: async () => mock.technicians.find((t) => t.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── App Users ─────────────────────────────────────────────────────────────
export function useAppUsers() {
  const mock = useMockData();
  return useQuery<AppUser[]>({
    queryKey: ["appUsers"],
    queryFn: async () => mock.users,
    staleTime: 60000,
  });
}

export function useAppUser(id: string) {
  const mock = useMockData();
  return useQuery<AppUser | undefined>({
    queryKey: ["appUsers", id],
    queryFn: async () => mock.users.find((u) => u.id === id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// ── Activity Logs ─────────────────────────────────────────────────────────
export function useActivityLogs() {
  const mock = useMockData();
  return useQuery<ActivityLog[]>({
    queryKey: ["activityLogs"],
    queryFn: async () => mock.activityLogs,
    staleTime: 60000,
  });
}
