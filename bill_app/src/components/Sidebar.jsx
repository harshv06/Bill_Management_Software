import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext.jsx";
import "../style/Sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isFinancialDropdownOpen, setIsFinancialDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleFinancialDropdown = () => {
    setIsFinancialDropdownOpen(!isFinancialDropdownOpen);
  };

  // Reusable menu item component for consistent styling
  const MenuItem = ({ to, imgSrc, alt, children, icon }) => (
    <Link to={to} className="rounded-4xl flex items-center p-2 link-hover">
      {imgSrc ? (
        <img src={imgSrc} className="mr-3 w-6 h-6" alt={alt} />
      ) : (
        <span className="mr-3">{icon}</span>
      )}
      <span className="text-sm">{children}</span>
    </Link>
  );

  return (
    <div className="w-64 h-screen sticky top-0 text-white p-4 sidebar-bg">
      <div className="w-full h-full sidebar-glass">
        <h1 className="text-xl font-bold text-center py-4">Matoshree Fleet</h1>

        <nav className="flex flex-col space-y-2 font-medium">
          <MenuItem
            to="/dashboard"
            imgSrc="https://cdn-icons-png.flaticon.com/128/5187/5187508.png"
            alt="Dashboard"
          >
            Dashboard
          </MenuItem>
          <MenuItem
            to="/invoices"
            imgSrc="https://cdn-icons-png.flaticon.com/128/726/726182.png"
            alt="Invoices"
          >
            Sales Invoices
          </MenuItem>
          <MenuItem
            to="/purchase-invoices"
            imgSrc="https://cdn-icons-png.flaticon.com/128/1562/1562711.png"
            alt="Purchase Invoices"
          >
            Purchase Invoices
          </MenuItem>
          <MenuItem
            to="/clients"
            imgSrc="https://cdn-icons-png.flaticon.com/128/10426/10426399.png"
            alt="Clients"
          >
            Clients
          </MenuItem>
          <MenuItem
            to="/reports"
            imgSrc="https://cdn-icons-png.flaticon.com/128/3192/3192618.png"
            alt="Reports"
          >
            Reports
          </MenuItem>
          <MenuItem
            to="/fleet"
            imgSrc="https://cdn-icons-png.flaticon.com/128/1023/1023757.png"
            alt="Fleet"
          >
            Fleet
          </MenuItem>
          <MenuItem
            to="/DayBookPage"
            imgSrc="https://cdn-icons-png.flaticon.com/128/1023/1023757.png"
            alt="Daybook"
          >
            Daybook
          </MenuItem>
          <MenuItem
            to="/bank-reconciliation"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          >
            Bank Reconciliation
          </MenuItem>
          {/* Financial Reports Dropdown */}
          <div
            onClick={toggleFinancialDropdown}
            className="rounded-4xl flex items-center justify-between p-2 link-hover cursor-pointer"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm">Financial Reports</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isFinancialDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {isFinancialDropdownOpen && (
            <div className="pl-6 space-y-1">
              <Link
                to="/profit-and-loss"
                className="rounded-4xl flex items-center p-2 link-hover text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="text-xs">Profit & Loss</span>
              </Link>
              <Link
                to="/balance-sheet"
                className="rounded-4xl flex items-center p-2 link-hover text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span className="text-xs">Balance Sheet</span>
              </Link>
            </div>
          )}
          <MenuItem
            to="/GST-Reports"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 014 4V14a4 4 0 01-4 4H4a4 4 0 01-4-4v-5.646a4 4 0 014-4h8zM12 8V4a4 4 0 00-4-4H4a4 4 0 00-4 4v5.646a4 4 0 004 4h8a4 4 0 004-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2z"
                />
              </svg>
            }
          >
            GST Reports
          </MenuItem>

          <MenuItem
            to="/TDS_Reports"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          >
            TDS Reports
          </MenuItem>
          <MenuItem
            to="/role-management"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 014 4V14a4 4 0 01-4 4H4a4 4 0 01-4-4v-5.646a4 4 0 014-4h8zM12 8V4a4 4 0 00-4-4H4a4 4 0 00-4 4v5.646a4 4 0 004 4h8a4 4 0 004-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Role Management
          </MenuItem>
          {/* // In your Sidebar component, add this before the Logout button */}
          <MenuItem
            to="/settings"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          >
            Settings
          </MenuItem>

          {/* Financial Reports Dropdown Content */}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl flex items-center justify-center p-2 link-hover bg-red-400 hover:bg-red-600 transition-colors duration-300 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 w-5 h-5"
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
