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
      console.log(response);
      // Store token
      localStorage.setItem("token", response.data.user.token);

      // Set user with permissions
      setUser({
        ...response.data.user.user,
        permissions: ROLE_PERMISSIONS[response.data.user.user.role] || [],
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
      console.log({username:name,email,password})
      const response = await axios.post(`${config.API_BASE_URL}/signup`, {
        username:name,
        email,
        password,
      });
      
      if (response.data) {
        console.log("Registration successful:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
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
