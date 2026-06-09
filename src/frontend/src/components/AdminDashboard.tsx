import {
  Database,
  FileText,
  MapPin,
  Package,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";

type AdminTabType =
  | "locations"
  | "items"
  | "gaskets"
  | "inventory"
  | "orders"
  | "reports"
  | "user-management";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTabType>("locations");

  const tabs = [
    { id: "locations" as AdminTabType, label: "Locations", icon: MapPin },
    { id: "items" as AdminTabType, label: "Items", icon: Package },
    { id: "gaskets" as AdminTabType, label: "Gaskets", icon: Wrench },
    { id: "inventory" as AdminTabType, label: "Inventory", icon: Database },
    { id: "orders" as AdminTabType, label: "Orders", icon: ShoppingCart },
    { id: "reports" as AdminTabType, label: "Reports", icon: FileText },
    {
      id: "user-management" as AdminTabType,
      label: "User Management",
      icon: Users,
    },
  ];

  // Map admin tabs to dashboard tabs
  const getDashboardTab = (adminTab: AdminTabType) => {
    switch (adminTab) {
      case "locations":
        return "locations";
      case "items":
        return "items";
      case "gaskets":
        return "gaskets";
      case "inventory":
        return "inventory";
      case "orders":
        return "orders";
      case "reports":
        return "reports";
      default:
        return "locations";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Admin Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav
            className="flex space-x-8 px-6 overflow-x-auto"
            aria-label="Admin Tabs"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 min-h-[44px]`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mobile-padding">
        {activeTab === "user-management" ? (
          <UserManagement />
        ) : (
          <Dashboard activeTab={getDashboardTab(activeTab)} />
        )}
      </div>
    </div>
  );
}
