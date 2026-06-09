import {
  ClipboardList,
  Database,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Printer,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CustomReport,
  type Item,
  type Location,
  type OrderItem,
  StagingReport,
  StockLevel,
} from "../backend";
import {
  useCreateItem,
  useCreateLocation,
  useDeleteItem,
  useDeleteLocation,
  useGenerateCustomRequirementsReport,
  useGenerateInventoryReport,
  useGenerateOrder,
  useGenerateStagingReport,
  useGetAllItems,
  useGetAllLocations,
  useGetAllStockLevels,
  useSearchLocations,
  useUpdateItem,
  useUpdateLocation,
  useUpdateLocationActiveStatus,
  useUpdateLocationCompletionStatus,
  useUpdateStockLevel,
} from "../hooks/useQueries";
import ExportModal from "./ExportModal";
import GasketsTab from "./GasketsTab";
import InventoryReportModal from "./InventoryReportModal";
import UserManagement from "./UserManagement";

type TabType =
  | "locations"
  | "add-location"
  | "items"
  | "gaskets"
  | "inventory"
  | "orders"
  | "reports"
  | "custom-reports"
  | "user-management";

interface BeltRequirement {
  size: string;
  quantity: number;
}

interface FilterRequirement {
  size: string;
  quantity: number;
}

interface DashboardProps {
  activeTab?: TabType;
}

interface InventoryFields {
  beginningInventory: string;
  receive1: string;
  receive2: string;
  receive3: string;
  currentStock: string;
}

// Quantity options for dropdown (1-50)
const quantityOptions = Array.from({ length: 50 }, (_, i) => i + 1);

export default function Dashboard({
  activeTab: propActiveTab,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    propActiveTab || "locations",
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Update active tab when prop changes
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  const tabs = [
    { id: "locations" as TabType, label: "Locations", icon: MapPin },
    { id: "add-location" as TabType, label: "Add Location", icon: Plus },
    { id: "items" as TabType, label: "Items", icon: Package },
    { id: "gaskets" as TabType, label: "Gaskets", icon: Wrench },
    { id: "inventory" as TabType, label: "Inventory", icon: Database },
    { id: "orders" as TabType, label: "Orders", icon: ShoppingCart },
    { id: "reports" as TabType, label: "Reports", icon: FileText },
    {
      id: "custom-reports" as TabType,
      label: "Custom Reports",
      icon: FileText,
    },
    { id: "user-management" as TabType, label: "User Management", icon: Users },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Navigation Tabs - only show if not controlled by parent */}
      {!propActiveTab && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center justify-between px-4 py-3">
              <h3 className="font-medium text-gray-900">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop navigation */}
            <nav
              className="hidden sm:flex space-x-8 px-6 overflow-x-auto mobile-nav"
              aria-label="Tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 min-h-[44px]`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile dropdown menu */}
            {showMobileMenu && (
              <div className="sm:hidden border-t border-gray-200 bg-gray-50">
                <div className="py-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                            : "text-gray-700 hover:bg-gray-100"
                        } w-full flex items-center space-x-3 px-4 py-3 text-left font-medium min-h-[44px]`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div
        className={
          propActiveTab
            ? ""
            : "bg-white rounded-xl shadow-sm border border-gray-200 mobile-padding"
        }
      >
        {activeTab === "locations" && <LocationsTab />}
        {activeTab === "add-location" && <AddLocationTab />}
        {activeTab === "items" && <ItemsTab />}
        {activeTab === "gaskets" && <GasketsTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "custom-reports" && <CustomReportsTab />}
        {activeTab === "user-management" && <UserManagement />}
      </div>
    </div>
  );
}

function LocationsTab() {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: allLocations = [],
    isLoading: allLocationsLoading,
    error: allLocationsError,
  } = useGetAllLocations();
  const searchLocationsMutation = useSearchLocations();
  const deleteLocationMutation = useDeleteLocation();
  const updateActiveStatusMutation = useUpdateLocationActiveStatus();
  const updateCompletionStatusMutation = useUpdateLocationCompletionStatus();

  // Determine which locations to display
  const isSearching = searchTerm.trim().length > 0;
  const isLoading = isSearching
    ? searchLocationsMutation.isPending
    : allLocationsLoading;
  const error = isSearching ? searchLocationsMutation.error : allLocationsError;

  // Get locations based on search or all locations
  const displayedLocations = isSearching
    ? searchLocationsMutation.data || []
    : allLocations;

  // Filter locations based on active status
  const locations = showInactive
    ? displayedLocations
    : displayedLocations.filter((location) => location.active);
  const inactiveCount = displayedLocations.filter(
    (location) => !location.active,
  ).length;

  // Handle search input change with debouncing
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocationsMutation.mutate(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchLocationsMutation]);

  const handleDelete = async (id: bigint) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocationMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete location:", error);
      }
    }
  };

  const handleActiveStatusToggle = async (id: bigint, active: boolean) => {
    try {
      await updateActiveStatusMutation.mutateAsync({ id, active });
    } catch (error) {
      console.error("Failed to update active status:", error);
    }
  };

  const handleCompletionStatusToggle = async (
    id: bigint,
    completed: boolean,
  ) => {
    try {
      await updateCompletionStatusMutation.mutateAsync({ id, completed });
    } catch (error) {
      console.error("Failed to update completion status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Failed to update completion status: ${errorMessage}`);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowEditForm(true);
  };

  const handleEditComplete = () => {
    setEditingLocation(null);
    setShowEditForm(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Failed to load locations. Please try again.
        </p>
      </div>
    );
  }

  if (showEditForm && editingLocation) {
    return (
      <EditLocationForm
        location={editingLocation}
        onComplete={handleEditComplete}
      />
    );
  }

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Maintenance Locations
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View HVAC maintenance locations with their belt and filter
            requirements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
              showInactive
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showInactive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>
              {showInactive
                ? "Hide Inactive"
                : `Show All${inactiveCount > 0 ? ` (${inactiveCount} inactive)` : ""}`}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search locations…"
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isSearching && locations.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No locations found
          </h3>
          <p className="text-gray-600 text-center">
            No locations match your search "{searchTerm}". Try a different
            search term.
          </p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showInactive ? "No inactive locations" : "No locations yet"}
          </h3>
          <p className="text-gray-600 text-center">
            {showInactive
              ? "All locations are currently active."
              : "Add your first maintenance location to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {isSearching && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Showing {locations.length} location
                {locations.length !== 1 ? "s" : ""} matching "{searchTerm}"
              </p>
            </div>
          )}
          {locations.map((location) => {
            const isCompleted = location.completed === true;
            const isActive = location.active === true;

            return (
              <div
                key={location.id.toString()}
                className={`mobile-card hover:shadow-md transition-shadow ${
                  !isActive
                    ? "bg-gray-50 border-gray-300"
                    : isCompleted
                      ? "bg-green-50 border-green-200"
                      : ""
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <MapPin
                          className={`w-5 h-5 flex-shrink-0 ${
                            !isActive
                              ? "text-gray-300"
                              : isCompleted
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        />
                        <h3
                          className={`font-semibold text-lg break-words ${
                            !isActive
                              ? "text-gray-500"
                              : isCompleted
                                ? "text-green-800"
                                : "text-gray-900"
                          }`}
                        >
                          {location.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) =>
                            handleCompletionStatusToggle(
                              location.id,
                              e.target.checked,
                            )
                          }
                          disabled={updateCompletionStatusMutation.isPending}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Completed</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) =>
                            handleActiveStatusToggle(
                              location.id,
                              e.target.checked,
                            )
                          }
                          disabled={updateActiveStatusMutation.isPending}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleEdit(location)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 px-2 py-1 rounded min-h-[44px]"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(location.id)}
                        disabled={deleteLocationMutation.isPending}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1 disabled:opacity-50 px-2 py-1 rounded min-h-[44px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        Belt Requirements
                      </h4>
                      {location.beltRequirements.length > 0 ? (
                        <div className="space-y-1">
                          {location.beltRequirements.map(([size, quantity]) => (
                            <div
                              key={size}
                              className="flex justify-between items-center text-sm bg-blue-50 px-3 py-1 rounded"
                            >
                              <span className="text-gray-700">Belt {size}</span>
                              <span className="font-medium text-blue-700">
                                {quantity.toString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No belt requirements
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Filter Requirements
                      </h4>
                      {location.filterRequirements.length > 0 ? (
                        <div className="space-y-1">
                          {location.filterRequirements.map(
                            ([size, quantity]) => (
                              <div
                                key={size}
                                className="flex justify-between items-center text-sm bg-green-50 px-3 py-1 rounded"
                              >
                                <span className="text-gray-700">
                                  Filter {size}
                                </span>
                                <span className="font-medium text-green-700">
                                  {quantity.toString()}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No filter requirements
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditLocationForm({
  location,
  onComplete,
}: { location: Location; onComplete: () => void }) {
  const [formData, setFormData] = useState({ name: location.name });
  const [beltRequirements, setBeltRequirements] = useState<BeltRequirement[]>(
    location.beltRequirements.map(([size, quantity]) => ({
      size,
      quantity: Number(quantity),
    })),
  );
  const [filterRequirements, setFilterRequirements] = useState<
    FilterRequirement[]
  >(
    location.filterRequirements.map(([size, quantity]) => ({
      size,
      quantity: Number(quantity),
    })),
  );

  const updateLocationMutation = useUpdateLocation();

  const beltSizes = [
    ...Array.from({ length: 43 }, (_, i) => `A${18 + i}`),
    ...Array.from({ length: 31 }, (_, i) => `B${30 + i}`),
  ];

  const filterSizes = [
    "12x12x2",
    "12x16x2",
    "12x20x2",
    "12x24x2",
    "12x25x2",
    "12x30x2",
    "14x14x2",
    "14x20x2",
    "14x24x2",
    "14x25x2",
    "14x30x2",
    "16x16x2",
    "16x20x2",
    "16x24x2",
    "16x25x2",
    "16x30x2",
    "18x18x2",
    "18x20x2",
    "18x24x2",
    "18x25x2",
    "18x30x2",
    "20x20x2",
    "20x24x2",
    "20x25x2",
    "20x30x2",
    "20x35x2",
    "24x24x2",
    "24x25x2",
    "24x30x2",
    "25x25x2",
    "25x30x2",
    "30x30x2",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const beltReqs: Array<[string, bigint]> = beltRequirements
        .filter((req) => req.size && req.quantity > 0)
        .map((req) => [req.size, BigInt(req.quantity)]);

      const filterReqs: Array<[string, bigint]> = filterRequirements
        .filter((req) => req.size && req.quantity > 0)
        .map((req) => [req.size, BigInt(req.quantity)]);

      await updateLocationMutation.mutateAsync({
        id: location.id,
        name: formData.name.trim(),
        beltRequirements: beltReqs,
        filterRequirements: filterReqs,
      });

      onComplete();
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const addBeltRequirement = () => {
    setBeltRequirements([...beltRequirements, { size: "", quantity: 1 }]);
  };

  const updateBeltRequirement = (
    index: number,
    field: keyof BeltRequirement,
    value: string | number,
  ) => {
    const updated = [...beltRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setBeltRequirements(updated);
  };

  const removeBeltRequirement = (index: number) => {
    setBeltRequirements(beltRequirements.filter((_, i) => i !== index));
  };

  const addFilterRequirement = () => {
    setFilterRequirements([...filterRequirements, { size: "", quantity: 1 }]);
  };

  const updateFilterRequirement = (
    index: number,
    field: keyof FilterRequirement,
    value: string | number,
  ) => {
    const updated = [...filterRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setFilterRequirements(updated);
  };

  const removeFilterRequirement = (index: number) => {
    setFilterRequirements(filterRequirements.filter((_, i) => i !== index));
  };

  return (
    <div className="mobile-spacing">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Location
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Update location details and requirements
          </p>
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="text-gray-400 hover:text-gray-600 p-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg mobile-padding">
        <form onSubmit={handleSubmit} className="mobile-spacing">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mobile-input"
              placeholder="Enter location name"
              required
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
              <h4 className="font-medium text-gray-700">Belt Requirements</h4>
              <button
                type="button"
                onClick={addBeltRequirement}
                className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Plus className="w-3 h-3" />
                <span>Add Belt</span>
              </button>
            </div>
            <div className="space-y-3">
              {beltRequirements.map((req, index) => (
                <div
                  key={req.size || `belt-edit-${index}`}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                >
                  <select
                    value={req.size}
                    onChange={(e) =>
                      updateBeltRequirement(index, "size", e.target.value)
                    }
                    className="flex-1 mobile-input"
                  >
                    <option value="">Select belt size</option>
                    {beltSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <select
                      value={req.quantity}
                      onChange={(e) =>
                        updateBeltRequirement(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value),
                        )
                      }
                      className="w-24 mobile-input"
                    >
                      {quantityOptions.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeBeltRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-2 min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {beltRequirements.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No belt requirements added yet
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
              <h4 className="font-medium text-gray-700">
                2-inch Filter Requirements
              </h4>
              <button
                type="button"
                onClick={addFilterRequirement}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Plus className="w-3 h-3" />
                <span>Add Filter</span>
              </button>
            </div>
            <div className="space-y-3">
              {filterRequirements.map((req, index) => (
                <div
                  key={req.size || `filter-edit-${index}`}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                >
                  <select
                    value={req.size}
                    onChange={(e) =>
                      updateFilterRequirement(index, "size", e.target.value)
                    }
                    className="flex-1 mobile-input"
                  >
                    <option value="">Select filter size</option>
                    {filterSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <select
                      value={req.quantity}
                      onChange={(e) =>
                        updateFilterRequirement(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value),
                        )
                      }
                      className="w-24 mobile-input"
                    >
                      {quantityOptions.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFilterRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-2 min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filterRequirements.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No filter requirements added yet
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={updateLocationMutation.isPending}
              className="mobile-btn-primary disabled:bg-gray-400 w-full sm:w-auto"
            >
              {updateLocationMutation.isPending
                ? "Updating..."
                : "Update Location"}
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="mobile-btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {updateLocationMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Location updated successfully!</p>
        </div>
      )}

      {updateLocationMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to update location. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}

function AddLocationTab() {
  const [formData, setFormData] = useState({ name: "" });
  const [beltRequirements, setBeltRequirements] = useState<BeltRequirement[]>(
    [],
  );
  const [filterRequirements, setFilterRequirements] = useState<
    FilterRequirement[]
  >([]);

  const createLocationMutation = useCreateLocation();

  const beltSizes = [
    ...Array.from({ length: 43 }, (_, i) => `A${18 + i}`),
    ...Array.from({ length: 31 }, (_, i) => `B${30 + i}`),
  ];

  const filterSizes = [
    "12x12x2",
    "12x16x2",
    "12x20x2",
    "12x24x2",
    "12x25x2",
    "12x30x2",
    "14x14x2",
    "14x20x2",
    "14x24x2",
    "14x25x2",
    "14x30x2",
    "16x16x2",
    "16x20x2",
    "16x24x2",
    "16x25x2",
    "16x30x2",
    "18x18x2",
    "18x20x2",
    "18x24x2",
    "18x25x2",
    "18x30x2",
    "20x20x2",
    "20x24x2",
    "20x25x2",
    "20x30x2",
    "20x35x2",
    "24x24x2",
    "24x25x2",
    "24x30x2",
    "25x25x2",
    "25x30x2",
    "30x30x2",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const beltReqs: Array<[string, bigint]> = beltRequirements
        .filter((req) => req.size && req.quantity > 0)
        .map((req) => [req.size, BigInt(req.quantity)]);

      const filterReqs: Array<[string, bigint]> = filterRequirements
        .filter((req) => req.size && req.quantity > 0)
        .map((req) => [req.size, BigInt(req.quantity)]);

      await createLocationMutation.mutateAsync({
        name: formData.name.trim(),
        beltRequirements: beltReqs,
        filterRequirements: filterReqs,
      });

      setFormData({ name: "" });
      setBeltRequirements([]);
      setFilterRequirements([]);
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const addBeltRequirement = () => {
    setBeltRequirements([...beltRequirements, { size: "", quantity: 1 }]);
  };

  const updateBeltRequirement = (
    index: number,
    field: keyof BeltRequirement,
    value: string | number,
  ) => {
    const updated = [...beltRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setBeltRequirements(updated);
  };

  const removeBeltRequirement = (index: number) => {
    setBeltRequirements(beltRequirements.filter((_, i) => i !== index));
  };

  const addFilterRequirement = () => {
    setFilterRequirements([...filterRequirements, { size: "", quantity: 1 }]);
  };

  const updateFilterRequirement = (
    index: number,
    field: keyof FilterRequirement,
    value: string | number,
  ) => {
    const updated = [...filterRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setFilterRequirements(updated);
  };

  const removeFilterRequirement = (index: number) => {
    setFilterRequirements(filterRequirements.filter((_, i) => i !== index));
  };

  return (
    <div className="mobile-spacing">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Add New Location
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Create a new HVAC maintenance location with belt and filter
          requirements
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg mobile-padding">
        <form onSubmit={handleSubmit} className="mobile-spacing">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mobile-input"
              placeholder="Enter location name"
              required
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
              <h4 className="font-medium text-gray-700">Belt Requirements</h4>
              <button
                type="button"
                onClick={addBeltRequirement}
                className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Plus className="w-3 h-3" />
                <span>Add Belt</span>
              </button>
            </div>
            <div className="space-y-3">
              {beltRequirements.map((req, index) => (
                <div
                  key={req.size || `belt-add-${index}`}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                >
                  <select
                    value={req.size}
                    onChange={(e) =>
                      updateBeltRequirement(index, "size", e.target.value)
                    }
                    className="flex-1 mobile-input"
                  >
                    <option value="">Select belt size</option>
                    {beltSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <select
                      value={req.quantity}
                      onChange={(e) =>
                        updateBeltRequirement(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value),
                        )
                      }
                      className="w-24 mobile-input"
                    >
                      {quantityOptions.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeBeltRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-2 min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {beltRequirements.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No belt requirements added yet
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
              <h4 className="font-medium text-gray-700">
                2-inch Filter Requirements
              </h4>
              <button
                type="button"
                onClick={addFilterRequirement}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Plus className="w-3 h-3" />
                <span>Add Filter</span>
              </button>
            </div>
            <div className="space-y-3">
              {filterRequirements.map((req, index) => (
                <div
                  key={req.size || `filter-add-${index}`}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
                >
                  <select
                    value={req.size}
                    onChange={(e) =>
                      updateFilterRequirement(index, "size", e.target.value)
                    }
                    className="flex-1 mobile-input"
                  >
                    <option value="">Select filter size</option>
                    {filterSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <select
                      value={req.quantity}
                      onChange={(e) =>
                        updateFilterRequirement(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value),
                        )
                      }
                      className="w-24 mobile-input"
                    >
                      {quantityOptions.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFilterRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-2 min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filterRequirements.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No filter requirements added yet
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={createLocationMutation.isPending}
              className="mobile-btn-primary disabled:bg-gray-400 w-full sm:w-auto"
            >
              {createLocationMutation.isPending
                ? "Creating..."
                : "Create Location"}
            </button>
          </div>
        </form>
      </div>

      {createLocationMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Location created successfully!</p>
        </div>
      )}

      {createLocationMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to create location. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}

function ItemsTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
  });

  const { data: items = [], isLoading, error } = useGetAllItems();
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.unit.trim()
    )
      return;

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          unit: formData.unit.trim(),
        });
      } else {
        await createItemMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim(),
          unit: formData.unit.trim(),
        });
      }
      setFormData({ name: "", description: "", unit: "" });
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      unit: item.unit,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: bigint) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItemMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: "", description: "", unit: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load items. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Maintenance Items
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage inventory items and their specifications
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mobile-btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg mobile-padding">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="mobile-spacing">
            <div className="form-grid">
              <div>
                <label
                  htmlFor="itemName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mobile-input"
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Unit of Measure
                </label>
                <input
                  type="text"
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="mobile-input"
                  placeholder="e.g., Each, Quart, Box"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="itemDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="itemDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mobile-input"
                rows={3}
                placeholder="Enter item description"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={
                  createItemMutation.isPending || updateItemMutation.isPending
                }
                className="mobile-btn-primary disabled:bg-gray-400 w-full sm:w-auto"
              >
                {createItemMutation.isPending || updateItemMutation.isPending
                  ? "Saving..."
                  : editingItem
                    ? "Update Item"
                    : "Add Item"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="mobile-btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items yet
          </h3>
          <p className="text-gray-600">
            Add your first maintenance item to get started.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 p-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteItemMutation.isPending}
                        className="text-red-600 hover:text-red-700 inline-flex items-center space-x-1 disabled:opacity-50 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-4">
            {items.map((item) => (
              <div key={item.id.toString()} className="mobile-card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2">
                    {item.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700 p-2 min-h-[44px]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteItemMutation.isPending}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 p-2 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <p className="text-sm text-gray-500">Unit: {item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryTab() {
  const { data: items = [], isLoading: itemsLoading } = useGetAllItems();
  const {
    data: stockLevels = [],
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useGetAllStockLevels();
  const { data: locations = [] } = useGetAllLocations();
  const identity = true;
  const updateStockMutation = useUpdateStockLevel();

  const [editingFields, setEditingFields] = useState<
    Map<string, InventoryFields>
  >(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const isLoading = itemsLoading || stockLoading;
  // All authenticated users have full access
  const canEdit = !!identity;

  const calculateItemsUsed = (itemName: string): number => {
    let total = 0;
    for (const location of locations) {
      if (location.completed) {
        for (const [size, quantity] of location.beltRequirements) {
          if (itemName === `Belt ${size}`) {
            total += Number(quantity);
          }
        }
        for (const [size, quantity] of location.filterRequirements) {
          if (itemName === `Filter ${size}`) {
            total += Number(quantity);
          }
        }
      }
    }
    return total;
  };

  useEffect(() => {
    if (stockLevels.length > 0 && editingFields.size === 0) {
      const newFields = new Map<string, InventoryFields>();
      for (const stock of stockLevels) {
        newFields.set(stock.itemId.toString(), {
          beginningInventory:
            stock.beginningInventory && Number(stock.beginningInventory) !== 0
              ? String(Number(stock.beginningInventory))
              : "",
          receive1:
            stock.receive1 && Number(stock.receive1) !== 0
              ? String(Number(stock.receive1))
              : "",
          receive2:
            stock.receive2 && Number(stock.receive2) !== 0
              ? String(Number(stock.receive2))
              : "",
          receive3:
            stock.receive3 && Number(stock.receive3) !== 0
              ? String(Number(stock.receive3))
              : "",
          currentStock:
            stock.currentStock && Number(stock.currentStock) !== 0
              ? String(Number(stock.currentStock))
              : "",
        });
      }
      setEditingFields(newFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockLevels, editingFields.size]);

  const handleFieldChange = (
    itemId: string,
    field: keyof InventoryFields,
    value: string,
  ) => {
    const newFields = new Map(editingFields);
    const current = newFields.get(itemId) || {
      beginningInventory: "",
      receive1: "",
      receive2: "",
      receive3: "",
      currentStock: "",
    };
    newFields.set(itemId, { ...current, [field]: value });
    setEditingFields(newFields);
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setSaveStatus("saving");
    try {
      const updates = Array.from(editingFields.entries()).map(
        ([itemId, fields]) =>
          updateStockMutation.mutateAsync({
            itemId: BigInt(itemId),
            beginningInventory:
              fields.beginningInventory === ""
                ? BigInt(0)
                : BigInt(Number.parseInt(fields.beginningInventory)),
            receive1:
              fields.receive1 === ""
                ? BigInt(0)
                : BigInt(Number.parseInt(fields.receive1)),
            receive2:
              fields.receive2 === ""
                ? BigInt(0)
                : BigInt(Number.parseInt(fields.receive2)),
            receive3:
              fields.receive3 === ""
                ? BigInt(0)
                : BigInt(Number.parseInt(fields.receive3)),
            currentStock:
              fields.currentStock === ""
                ? BigInt(0)
                : BigInt(Number.parseInt(fields.currentStock)),
          }),
      );

      await Promise.all(updates);
      await refetchStock();
      setHasChanges(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save inventory:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="mobile-spacing">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage inventory levels for all maintenance items
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!hasChanges || saveStatus === "saving" || !canEdit}
            className="mobile-btn bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "success"
                  ? "Saved!"
                  : "Save All Changes"}
            </span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="mobile-btn bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {saveStatus === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 no-print">
          <p className="text-red-800">
            Failed to save changes. Please try again.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beginning Inventory
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receive 1
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receive 2
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receive 3
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items Used
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Inventory
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const itemIdStr = item.id.toString();
              const fields = editingFields.get(itemIdStr) || {
                beginningInventory: "",
                receive1: "",
                receive2: "",
                receive3: "",
                currentStock: "",
              };
              const itemsUsed = calculateItemsUsed(item.name);
              const totalInventory =
                (Number.parseInt(fields.beginningInventory) || 0) +
                (Number.parseInt(fields.receive1) || 0) +
                (Number.parseInt(fields.receive2) || 0) +
                (Number.parseInt(fields.receive3) || 0) +
                (Number.parseInt(fields.currentStock) || 0);
              const availableInventory = totalInventory - itemsUsed;

              return (
                <tr key={item.id.toString()} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        value={fields.beginningInventory}
                        onChange={(e) =>
                          handleFieldChange(
                            itemIdStr,
                            "beginningInventory",
                            e.target.value,
                          )
                        }
                        placeholder=""
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm no-print-input"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {fields.beginningInventory || ""}
                      </span>
                    )}
                    <span className="print-only">
                      {fields.beginningInventory || ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        value={fields.receive1}
                        onChange={(e) =>
                          handleFieldChange(
                            itemIdStr,
                            "receive1",
                            e.target.value,
                          )
                        }
                        placeholder=""
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm no-print-input"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {fields.receive1 || ""}
                      </span>
                    )}
                    <span className="print-only">{fields.receive1 || ""}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        value={fields.receive2}
                        onChange={(e) =>
                          handleFieldChange(
                            itemIdStr,
                            "receive2",
                            e.target.value,
                          )
                        }
                        placeholder=""
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm no-print-input"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {fields.receive2 || ""}
                      </span>
                    )}
                    <span className="print-only">{fields.receive2 || ""}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        value={fields.receive3}
                        onChange={(e) =>
                          handleFieldChange(
                            itemIdStr,
                            "receive3",
                            e.target.value,
                          )
                        }
                        placeholder=""
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm no-print-input"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {fields.receive3 || ""}
                      </span>
                    )}
                    <span className="print-only">{fields.receive3 || ""}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        value={fields.currentStock}
                        onChange={(e) =>
                          handleFieldChange(
                            itemIdStr,
                            "currentStock",
                            e.target.value,
                          )
                        }
                        placeholder=""
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm no-print-input"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {fields.currentStock || ""}
                      </span>
                    )}
                    <span className="print-only">
                      {fields.currentStock || ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {itemsUsed}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {availableInventory}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const generateOrderMutation = useGenerateOrder();
  const { data: items = [] } = useGetAllItems();

  const handleGenerateOrder = async () => {
    setIsGenerating(true);
    try {
      const result = await generateOrderMutation.mutateAsync();
      setOrderItems(result);
      setLastGenerated(new Date());
      setShowExportModal(true);
    } catch (error) {
      console.error("Failed to generate order:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + Number(item.quantity), 0);
  };

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Purchase Orders
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Generate purchase orders based on active location requirements and
            current available inventory
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateOrder}
          disabled={isGenerating || generateOrderMutation.isPending}
          className="mobile-btn bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {isGenerating || generateOrderMutation.isPending
              ? "Generating..."
              : "Generate Order"}
          </span>
        </button>
      </div>

      {generateOrderMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to generate order. Please try again.
          </p>
        </div>
      )}

      {orderItems.length === 0 &&
      !isGenerating &&
      !generateOrderMutation.isPending ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg mobile-padding">
          <div className="text-center">
            <ShoppingCart className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              No Order Generated Yet
            </h3>
            <p className="text-blue-700 mb-4">
              Click "Generate Order" to calculate what items need to be
              purchased based on your active location requirements and current
              available inventory levels.
            </p>
          </div>
        </div>
      ) : orderItems.length === 0 && lastGenerated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg mobile-padding">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              No Items Need Ordering
            </h3>
            <p className="text-green-700">
              Great! Your current available inventory levels are sufficient to
              meet all active location requirements. No purchase order is needed
              at this time.
            </p>
            {lastGenerated && (
              <p className="text-sm text-green-600 mt-2">
                Last checked: {lastGenerated.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ) : orderItems.length > 0 ? (
        <div className="mobile-spacing">
          <div className="bg-purple-50 border border-purple-200 rounded-lg mobile-padding">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  Purchase Order Summary
                </h3>
                {lastGenerated && (
                  <p className="text-sm text-purple-600">
                    Generated: {lastGenerated.toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px] no-print"
              >
                <Download className="w-4 h-4" />
                <span>Export Order</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {orderItems.length}
                </div>
                <div className="text-sm text-purple-600">Different Items</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {getTotalItems()}
                </div>
                <div className="text-sm text-purple-600">Total Quantity</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {
                    orderItems.filter((item) => item.name.includes("Belt"))
                      .length
                  }
                </div>
                <div className="text-sm text-purple-600">Belt Items</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          orderItems={orderItems}
          items={items}
        />
      )}
    </div>
  );
}

function ReportsTab() {
  const [reportType, setReportType] = useState<"inventory" | "staging" | null>(
    null,
  );
  const [showInventoryReportModal, setShowInventoryReportModal] =
    useState(false);

  const handleReportTypeSelection = (type: "inventory" | "staging") => {
    setReportType(type);
    if (type === "inventory") {
      setShowInventoryReportModal(true);
    }
  };

  if (!reportType) {
    return (
      <div className="mobile-spacing">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Reports
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Choose the type of report you want to generate
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg mobile-padding">
          <div className="text-center">
            <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Select Report Type
            </h3>
            <p className="text-indigo-700 mb-6">
              Choose between generating an inventory report or a staging report
              for your maintenance operations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => handleReportTypeSelection("inventory")}
                className="bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-lg p-6 text-left transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="w-6 h-6 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-indigo-900">
                    Inventory Report
                  </h4>
                </div>
                <p className="text-indigo-700 text-sm">
                  Generate comprehensive inventory reports showing beginning
                  inventory, all received fields, current stock, usage from
                  completed locations, and available inventory for all items.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleReportTypeSelection("staging")}
                className="bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-lg p-6 text-left transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-indigo-900">
                    Staging Report
                  </h4>
                </div>
                <p className="text-indigo-700 text-sm">
                  Generate staging reports showing which items and quantities to
                  prepare for each active location for field teams.
                </p>
              </button>
            </div>
          </div>
        </div>

        {showInventoryReportModal && (
          <InventoryReportModal
            isOpen={showInventoryReportModal}
            onClose={() => {
              setShowInventoryReportModal(false);
              setReportType(null);
            }}
          />
        )}
      </div>
    );
  }

  return null;
}

function CustomReportsTab() {
  const [selectedLocations, setSelectedLocations] = useState<Set<bigint>>(
    new Set(),
  );
  const [reportData, setReportData] = useState<CustomReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: allLocations = [] } = useGetAllLocations();
  const generateCustomReportMutation = useGenerateCustomRequirementsReport();

  const locations = showInactive
    ? allLocations
    : allLocations.filter((location) => location.active);
  const inactiveCount = allLocations.filter(
    (location) => !location.active,
  ).length;

  const handleLocationToggle = (locationId: bigint) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLocations.size === locations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(locations.map((loc) => loc.id)));
    }
  };

  const handleGenerateReport = async () => {
    if (selectedLocations.size === 0) return;

    setIsGenerating(true);
    try {
      const locationIds = Array.from(selectedLocations);
      const result =
        await generateCustomReportMutation.mutateAsync(locationIds);
      setReportData(result);
      setLastGenerated(new Date());
    } catch (error) {
      console.error("Failed to generate custom report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = [
      ["Location", "Item Name", "Quantity"],
      ...reportData.selectedLocations.flatMap((location) => [
        ...location.beltRequirements.map(([size, quantity]) => [
          location.name,
          `Belt ${size}`,
          quantity.toString(),
        ]),
        ...location.filterRequirements.map(([size, quantity]) => [
          location.name,
          `Filter ${size}`,
          quantity.toString(),
        ]),
      ]),
      ["", "", ""],
      ["COMBINED TOTALS", "", ""],
      ...reportData.combinedTotals.map(([itemName, quantity]) => [
        "Total",
        itemName,
        quantity.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `custom-requirements-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Custom Requirements Report
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Select locations to generate a combined requirements summary with
            totals
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="mobile-padding border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Locations
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => setShowInactive(!showInactive)}
                className={`text-sm px-3 py-2 rounded-md font-medium transition-colors w-full sm:w-auto min-h-[44px] ${
                  showInactive
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showInactive
                  ? "Hide Inactive"
                  : `Show All${inactiveCount > 0 ? ` (${inactiveCount} inactive)` : ""}`}
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md w-full sm:w-auto min-h-[44px]"
              >
                {selectedLocations.size === locations.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={selectedLocations.size === 0 || isGenerating}
                className="mobile-btn bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {isGenerating ? "Generating..." : "Generate Report"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {locations.length === 0 ? (
          <div className="mobile-padding text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {showInactive
                ? "No inactive locations"
                : "No active locations available"}
            </h4>
            <p className="text-gray-600">
              {showInactive
                ? "All locations are currently active."
                : "Add active locations first to generate custom reports."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {locations.map((location) => {
              const isCompleted = location.completed === true;
              const isActive = location.active === true;

              return (
                <div key={location.id.toString()} className="mobile-padding">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocations.has(location.id)}
                      onChange={() => handleLocationToggle(location.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <MapPin
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gray-400" : "text-gray-300"}`}
                        />
                        <span
                          className={`font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {location.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {location.beltRequirements.length} belt types,{" "}
                        {location.filterRequirements.length} filter types
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reportData && (
        <div className="mobile-spacing">
          <div className="bg-purple-50 border border-purple-200 rounded-lg mobile-padding">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  Requirements Summary
                </h3>
                {lastGenerated && (
                  <p className="text-sm text-purple-600">
                    Generated: {lastGenerated.toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={exportReport}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px] no-print"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="space-y-4">
              {reportData.selectedLocations.map((location) => {
                const isCompleted = location.completed === true;
                const isActive = location.active === true;

                return (
                  <div
                    key={location.id.toString()}
                    className="bg-white rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        {location.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          Belt Requirements
                        </h5>
                        {location.beltRequirements.length > 0 ? (
                          <div className="space-y-1">
                            {location.beltRequirements.map(
                              ([size, quantity]) => (
                                <div
                                  key={size}
                                  className="flex justify-between items-center text-sm bg-blue-50 px-3 py-1 rounded"
                                >
                                  <span className="text-gray-700">
                                    Belt {size}
                                  </span>
                                  <span className="font-medium text-blue-700">
                                    {quantity.toString()}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No belt requirements
                          </p>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Filter Requirements
                        </h5>
                        {location.filterRequirements.length > 0 ? (
                          <div className="space-y-1">
                            {location.filterRequirements.map(
                              ([size, quantity]) => (
                                <div
                                  key={size}
                                  className="flex justify-between items-center text-sm bg-green-50 px-3 py-1 rounded"
                                >
                                  <span className="text-gray-700">
                                    Filter {size}
                                  </span>
                                  <span className="font-medium text-green-700">
                                    {quantity.toString()}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No filter requirements
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {reportData.combinedTotals.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg mobile-padding">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                  Combined Totals Across All Selected Locations
                </h3>
                <p className="text-sm text-indigo-600 mt-1">
                  Total quantities needed for each size across{" "}
                  {reportData.selectedLocations.length} selected location
                  {reportData.selectedLocations.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reportData.combinedTotals
                  .sort(([a], [b]) => {
                    const aIsBelt = a.startsWith("Belt");
                    const bIsBelt = b.startsWith("Belt");
                    if (aIsBelt && !bIsBelt) return -1;
                    if (!aIsBelt && bIsBelt) return 1;
                    return a.localeCompare(b);
                  })
                  .map(([itemName, quantity]) => {
                    const isBelt = itemName.startsWith("Belt");
                    const bgColor = isBelt ? "bg-blue-100" : "bg-green-100";
                    const textColor = isBelt
                      ? "text-blue-800"
                      : "text-green-800";
                    const borderColor = isBelt
                      ? "border-blue-200"
                      : "border-green-200";

                    return (
                      <div
                        key={itemName}
                        className={`${bgColor} ${borderColor} border rounded-lg p-3`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${textColor}`}>
                            {itemName}
                          </span>
                          <span className={`text-lg font-bold ${textColor}`}>
                            {quantity.toString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-900">
                      {
                        reportData.combinedTotals.filter(([name]) =>
                          name.startsWith("Belt"),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-indigo-600">Belt Sizes</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-900">
                      {
                        reportData.combinedTotals.filter(([name]) =>
                          name.startsWith("Filter"),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-indigo-600">Filter Sizes</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-900">
                      {reportData.combinedTotals.reduce(
                        (sum, [, quantity]) => sum + Number(quantity),
                        0,
                      )}
                    </div>
                    <div className="text-sm text-indigo-600">Total Items</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {generateCustomReportMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to generate custom report. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
