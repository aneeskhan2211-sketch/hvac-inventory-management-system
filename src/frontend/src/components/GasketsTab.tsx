import { Loader2, MapPin, Save, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { GasketInfo } from "../backend";
import {
  useGetAllGasketInfos,
  useGetAllLocations,
  useSaveLocationGasketInfo,
  useSearchGasketLocations,
} from "../hooks/useQueries";

interface GasketFormData {
  cooler: string;
  freezer: string;
  fryFreezer: string;
  glassFreezer: string;
  outsideDressTable: string;
  insideDress: string;
  grillBox: string;
}

export default function GasketsTab() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allLocations = [], isLoading: allLocationsLoading } =
    useGetAllLocations();
  const searchLocationsMutation = useSearchGasketLocations();
  const { data: gasketInfos = [], isLoading: gasketInfosLoading } =
    useGetAllGasketInfos();
  const identity = true;
  const saveGasketMutation = useSaveLocationGasketInfo();

  const [formData, setFormData] = useState<Map<string, GasketFormData>>(
    new Map(),
  );
  const [savingLocationId, setSavingLocationId] = useState<bigint | null>(null);

  // All authenticated users have full access
  const canEdit = !!identity;

  // Determine which locations to display
  const isSearching = searchTerm.trim().length > 0;
  const isLoading = isSearching
    ? searchLocationsMutation.isPending
    : allLocationsLoading || gasketInfosLoading;

  // Get locations based on search or all locations
  const locations = isSearching
    ? searchLocationsMutation.data || []
    : allLocations;

  // Handle search input change with debouncing
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocationsMutation.mutate(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, searchLocationsMutation.mutate]);

  // Initialize form data from gasket infos
  useEffect(() => {
    if (gasketInfos.length > 0) {
      const newFormData = new Map<string, GasketFormData>();
      for (const info of gasketInfos) {
        newFormData.set(info.locationId.toString(), {
          cooler: info.cooler,
          freezer: info.freezer,
          fryFreezer: info.fryFreezer,
          glassFreezer: info.glassFreezer,
          outsideDressTable: info.outsideDressTable,
          insideDress: info.insideDress,
          grillBox: info.grillBox,
        });
      }
      setFormData(newFormData);
    }
  }, [gasketInfos]);

  const handleFieldChange = (
    locationId: string,
    field: keyof GasketFormData,
    value: string,
  ) => {
    const newFormData = new Map(formData);
    const current = newFormData.get(locationId) || {
      cooler: "",
      freezer: "",
      fryFreezer: "",
      glassFreezer: "",
      outsideDressTable: "",
      insideDress: "",
      grillBox: "",
    };
    newFormData.set(locationId, { ...current, [field]: value });
    setFormData(newFormData);
  };

  const handleSave = async (locationId: bigint) => {
    if (!canEdit) return;

    setSavingLocationId(locationId);
    try {
      const locationIdStr = locationId.toString();
      const data = formData.get(locationIdStr) || {
        cooler: "",
        freezer: "",
        fryFreezer: "",
        glassFreezer: "",
        outsideDressTable: "",
        insideDress: "",
        grillBox: "",
      };

      const gasketInfo: GasketInfo = {
        locationId,
        cooler: data.cooler,
        freezer: data.freezer,
        fryFreezer: data.fryFreezer,
        glassFreezer: data.glassFreezer,
        outsideDressTable: data.outsideDressTable,
        insideDress: data.insideDress,
        grillBox: data.grillBox,
      };

      await saveGasketMutation.mutateAsync({ locationId, gasketInfo });
    } catch (error) {
      console.error("Failed to save gasket info:", error);
    } finally {
      setSavingLocationId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading && !isSearching) {
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gaskets Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage gasket information for each location
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Please log in to edit gasket information.
          </p>
        </div>
      )}

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
            No locations yet
          </h3>
          <p className="text-gray-600">
            Add locations first to manage gasket information.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {isSearching && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Showing {locations.length} location
                {locations.length !== 1 ? "s" : ""} matching "{searchTerm}"
              </p>
            </div>
          )}
          {locations.map((location) => {
            const locationIdStr = location.id.toString();
            const data = formData.get(locationIdStr) || {
              cooler: "",
              freezer: "",
              fryFreezer: "",
              glassFreezer: "",
              outsideDressTable: "",
              insideDress: "",
              grillBox: "",
            };
            const isSaving = savingLocationId?.toString() === locationIdStr;

            return (
              <div
                key={location.id.toString()}
                className="bg-white border border-gray-200 rounded-lg mobile-padding"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h3>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleSave(location.id)}
                      disabled={isSaving}
                      className="mobile-btn bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cooler */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`cooler-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cooler
                    </label>
                    <textarea
                      id={`cooler-${locationIdStr}`}
                      value={data.cooler}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "cooler",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter cooler gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Freezer */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`freezer-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Freezer
                    </label>
                    <textarea
                      id={`freezer-${locationIdStr}`}
                      value={data.freezer}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "freezer",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter freezer gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Fry Freezer */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`fryFreezer-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fry Freezer
                    </label>
                    <textarea
                      id={`fryFreezer-${locationIdStr}`}
                      value={data.fryFreezer}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "fryFreezer",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter fry freezer gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Glass Freezer */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`glassFreezer-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Glass Freezer
                    </label>
                    <textarea
                      id={`glassFreezer-${locationIdStr}`}
                      value={data.glassFreezer}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "glassFreezer",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter glass freezer gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Outside Dress Table */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`outsideDressTable-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Outside Dress Table
                    </label>
                    <textarea
                      id={`outsideDressTable-${locationIdStr}`}
                      value={data.outsideDressTable}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "outsideDressTable",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter outside dress table gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Inside Dress */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`insideDress-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Inside Dress
                    </label>
                    <textarea
                      id={`insideDress-${locationIdStr}`}
                      value={data.insideDress}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "insideDress",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter inside dress gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Grill Box */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`grillBox-${locationIdStr}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Grill Box
                    </label>
                    <textarea
                      id={`grillBox-${locationIdStr}`}
                      value={data.grillBox}
                      onChange={(e) =>
                        handleFieldChange(
                          locationIdStr,
                          "grillBox",
                          e.target.value,
                        )
                      }
                      placeholder={
                        canEdit
                          ? "Enter grill box gasket information..."
                          : "No information available"
                      }
                      rows={3}
                      disabled={!canEdit}
                      className="mobile-input resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {saveGasketMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            Gasket information saved successfully!
          </p>
        </div>
      )}

      {saveGasketMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to save gasket information. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
