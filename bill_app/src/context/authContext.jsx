// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Config from "../utils/GlobalConfig";
import { ROLE_PERMISSIONS, PERMISSIONS } from "../config/permissions";
import config from "../utils/GlobalConfig";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check token on app load
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${Config.API_BASE_URL}/login`, {
        email,
        password,
      });
      console.log("Logged In: ", response);

      // Parse permissions
      let userPermissions = [];
      try {
        // Check if permissions are a string (JSON)
        if (typeof response.data.user.user.permissions === "string") {
          console.log("If Block");
          userPermissions = JSON.parse(response.data.user.user.permissions);
        }
        // If it's already an array, use it directly
        else if (Array.isArray(response.data.user.user.permissions)) {
          userPermissions = response.data.user.user.permissions;
          console.log("If Else User Permissions:", userPermissions);
        }
        // Fallback to role-based permissions
        else {
          userPermissions =
            ROLE_PERMISSIONS[response.data.user.user.role] || [];
          console.log("ELSE Block", response.data.user.user.permissions);
        }
      } catch (parseError) {
        console.error("Error parsing permissions:", parseError);
        userPermissions = ROLE_PERMISSIONS[response.data.user.user.role] || [];
      }

      // Store token
      localStorage.setItem("token", response.data.user.token);

      console.log("Final Permissions:", userPermissions);
      // Set user with parsed permissions
      setUser({
        ...response.data.user.user,
        permissions: userPermissions,
      });
      console.log(user);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const Register = async (name, email, password) => {
    try {
      console.log({ username: name, email, password });
      const response = await axios.post(`${config.API_BASE_URL}/signup`, {
        username: name,
        email,
        password,
      });

      if (response.data) {
        console.log("Registration successful:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error; // Rethrow the error to handle it in the component
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await axios.post(
        `${Config.API_BASE_URL}/validate-token`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser({
        ...response.data.user,
        permissions:
          response.data.user.permissions ||
          PERMISSIONS[response.data.user.role] ||
          [],
      });
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        Register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
