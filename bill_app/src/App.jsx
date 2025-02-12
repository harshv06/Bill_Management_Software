import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/authContext";
import store from "../store/store";
import "./App.css";

// Import components
import Lander from "./pages/Lander";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Invoices from "./components/Invoices";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Fleet from "./components/Fleet";
import CarDetails from "./pages/CarDetails";
import ClientDetails from "./pages/ClientDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// RBAC Components
import PrivateRoute from "../src/privateRoutes";
import { PERMISSIONS } from "./config/permissions";

// Unauthorized Access Component
const UnauthorizedAccess = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Unauthorized Access
      </h1>
      <p className="text-gray-600 mb-4">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Return to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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
                  requiredPermission={[PERMISSIONS.PAYMENTS.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Invoices />
                </PrivateRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <PrivateRoute
                  requiredPermission={[PERMISSIONS.COMPANIES.VIEW]}
                  fallback={<UnauthorizedAccess />}
                >
                  <Reports />
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
