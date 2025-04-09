import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/authContext.jsx";
import store from "../store/store";
import "./App.css";

// Import components
import Lander from "./pages/Lander";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Invoices from "./components/Invoices";
import Reports from "./components/Reports";
import Settings from "./components/Modals/Settings.jsx";
import Fleet from "./components/Fleet";
import CarDetails from "./pages/CarDetails";
import ClientDetails from "./pages/ClientDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PurchaseInvoices from "./pages/PurchaseInvoice";
import NewPurchaseInvoice from "../src/components/Modals/InvoiceModals/NewPuchaseInvoice";

// RBAC Components
import PrivateRoute from "../src/privateRoutes";
import { PERMISSIONS } from "./config/permissions";
import Sidebar from "./components/Sidebar";
import DayBookPage from "./pages/DayBookPage";
import BankReconciliationPage from "./pages/BankReconciliationPage";
import BalanceSheetPage from "./pages/BalanceSheet";
import ProfitAndLossPage from "./pages/ProfitAndLossPages";
import CreateUserPage from "./pages/CreateUserPage";
import GSTReportPage from "./pages/GST_Reports.jsx";
import TDSReportPage from "./pages/TDS_REPORTS.jsx";

// Unauthorized Access Component
const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate("/"); // Use React Router for navigation
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Unauthorized Access
            </h1>
            <p className="text-gray-600 mb-6">
              You do not have the necessary permissions to access this page.
              Please contact your system administrator if you believe this is an
              error.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleReturnToDashboard}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Return to Dashboard
            </button>

            <button
              // onClick={() => window.location.reload()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/d" element={<Dashboard />} /> */}

            {/* Protected Routes with RBAC */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.DASHBOARD.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/purchase-invoices"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.PURCHASE_INVOICES.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <PurchaseInvoices />
                </PrivateRoute>
              }
            />
            <Route
              path="/purchase-invoices/new"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.PURCHASE_INVOICES.CREATE]}
                  fallback={<UnauthorizedAccess />}
                >
                  <NewPurchaseInvoice />
                </PrivateRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.COMPANIES.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Clients />
                </PrivateRoute>
              }
            />

            <Route
              path="/clients/details"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.COMPANIES.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <ClientDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/fleet"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.CARS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Fleet />
                </PrivateRoute>
              }
            />

            <Route
              path="/fleet/details"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.CARS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <CarDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/invoices"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.SALES_INVOICES.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Invoices />
                </PrivateRoute>
              }
            />
            <Route
              path="/DayBookPage"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.DAYBOOK.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <DayBookPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/bank-reconciliation"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.BANK_RECONCILIATION.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <BankReconciliationPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.REPORTS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Reports />
                </PrivateRoute>
              }
            />

            <Route
              path="/profit-and-loss"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.FINANCIAL_REPORTS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <ProfitAndLossPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/balance-sheet"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.FINANCIAL_REPORTS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <BalanceSheetPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/GST-Reports"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.FINANCIAL_REPORTS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <GSTReportPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/role-management"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.ROLE_MANAGEMENT.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <CreateUserPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.ROLE_MANAGEMENT.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/TDS_Reports"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.ROLE_MANAGEMENT.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <TDSReportPage />
                </PrivateRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Provider>
    </AuthProvider>
  );
}

export default App;
