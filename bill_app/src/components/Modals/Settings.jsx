// components/Settings/Settings.jsx
import React, { useState } from "react";
import CompanyProfile from "../../pages/CompanyProfilePage";
import Sidebar from "../Sidebar"; // Import your Sidebar component

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === "company"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("company")}
                  >
                    Company Profile
                  </button>
                  {/* Add more tabs as needed */}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "company" && <CompanyProfile />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;