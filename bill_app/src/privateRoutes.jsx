// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

const PrivateRoute = ({
  children,
  requiredPermission = [],
  fallback = null,
}) => {
  const { isAuthenticated, user } = useAuth();
  console.log(user);
  // console.log(!user.permissions.includes(requiredPermission));

  // Unauthorized Component
  const UnauthorizedComponent = () => (
    <div className="flex items-center justify-center h-screen bg-red-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-4">
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  // If no authentication
  if (!isAuthenticated) {
    return fallback || <Navigate to="/login" replace />;
  }

  // Check if user has any of the required permissions
  const hasPermission = requiredPermission.some((permission) =>
    user?.permissions?.includes(permission)
  );

  // If user doesn't have required permissions
  if (!hasPermission) {
    console.log("User permissions:", user?.permissions);
    console.log("Required permissions:", requiredPermission);
    return fallback || <UnauthorizedComponent />;
  }

  return children;
};

export default PrivateRoute;
