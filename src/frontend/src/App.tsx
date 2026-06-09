import { Building2, Heart } from "lucide-react";
import { useState } from "react";
import { Layout } from "./components/Layout";
import LoginButton from "./components/LoginButton";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import UserProfileSetup from "./components/UserProfileSetup";
import { useGoogleAuth } from "./context/GoogleAuthContext";
import { MockDataProvider } from "./context/MockDataContext";
import AlertsPage from "./pages/AlertsPage";
import BarcodesPage from "./pages/BarcodesPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import MaintenancePage from "./pages/MaintenancePage";
import PartsPage from "./pages/PartsPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import ReportsPage from "./pages/ReportsPage";
import ServiceKitsPage from "./pages/ServiceKitsPage";
import SuppliersPage from "./pages/SuppliersPage";
import TransactionsPage from "./pages/TransactionsPage";
import UsersPage from "./pages/UsersPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";

function App() {
  const { user, isAuthenticated, isInitializing, logout } = useGoogleAuth();
  const [profileSetupDone, setProfileSetupDone] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  HVAC Inventory Manager
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-16 gap-8">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to HVAC Inventory Manager
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Manage inventory for preventative maintenance on HVAC systems.
                Track parts, locations, work orders, suppliers, and more.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 w-full max-w-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign In
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Use your Google account to access the system.
              </p>
              <LoginButton className="w-full justify-center" />
            </div>
          </div>
        </main>

        <PWAInstallPrompt />

        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()}. Built with{" "}
              <Heart className="inline w-4 h-4 text-red-500" /> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!profileSetupDone) {
    return <UserProfileSetup onComplete={() => setProfileSetupDone(true)} />;
  }

  return (
    <MockDataProvider>
      <AppShell userName={user?.name} onLogout={logout} />
    </MockDataProvider>
  );
}

const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  parts: PartsPage,
  inventory: InventoryPage,
  suppliers: SuppliersPage,
  "purchase-orders": PurchaseOrdersPage,
  "work-orders": WorkOrdersPage,
  transactions: TransactionsPage,
  alerts: AlertsPage,
  barcodes: BarcodesPage,
  maintenance: MaintenancePage,
  reports: ReportsPage,
  users: UsersPage,
  customers: CustomersPage,
  "service-kits": ServiceKitsPage,
};

interface AppShellProps {
  userName?: string;
  onLogout: () => void;
}

function AppShell({ userName, onLogout }: AppShellProps) {
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  function handleToggleDark() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  const PageComponent = ROUTE_COMPONENTS[activeRoute] ?? DashboardPage;

  return (
    <Layout
      activeRoute={activeRoute}
      onNavigate={setActiveRoute}
      userName={userName}
      onLogout={onLogout}
      isDark={isDark}
      onToggleDark={handleToggleDark}
    >
      <PageComponent />
    </Layout>
  );
}

export default App;
