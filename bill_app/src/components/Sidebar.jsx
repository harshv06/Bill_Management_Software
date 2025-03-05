import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust the import path
import "../style/Sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="w-70 h-screen sticky top-0 text-white p-6 sidebar-bg">
      <div className="w-full h-full sidebar-glass">
        <h1 className="text-2xl font-bold">Matoshree Fleet</h1>

        <nav className="flex flex-col space-y-3 mt-8 font-semibold">
          <Link to={"/dashboard"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/5187/5187508.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Dashboard"
            />
            Dashboard
          </Link>
          <Link
            to={"/purchase-invoices"}
            className="rounded-4xl flex p-2 link-hover"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/1562/1562711.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Purchase Invoices"
            />
            Purchase Invoices
          </Link>
          {/* ... other links ... */}
          <Link to={"/invoices"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/726/726182.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Invoices"
            />
            Invoices
          </Link>
          <Link to={"/clients"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/10426/10426399.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Clients"
            />
            Clients
          </Link>
          <Link to={"/reports"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3192/3192618.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Reports"
            />
            Reports
          </Link>
          <Link to={"/fleet"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/1023/1023757.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Fleet"
            />
            Fleet
          </Link>
          <Link to={"/DayBookPage"} className="rounded-4xl flex p-2 link-hover">
            <img
              src="https://cdn-icons-png.flaticon.com/128/1023/1023757.png"
              className="mt-1.5 ml-2 mr-3"
              alt="Fleet"
            />
            DayBook
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl flex p-2 link-hover bg-red-400 hover:bg-red-600 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
