import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { format } from "date-fns";
import config from "../utils/GlobalConfig";

const ProfitAndLossPage = () => {
  const [profitLossData, setProfitLossData] = useState({
    groups: [],
    purchase: {
      accounts: 0,
      percentage: 0,
    },
    sales: {
      accounts: 0,
    },
    netProfit: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-03-01",
    endDate: "2025-03-31",
  });

  // State to track expanded groups
  const [expandedGroups, setExpandedGroups] = useState({});

  const fetchFinancialBreakdown = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/Profit/financial-breakdown/${dateRange.startDate}/${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profit & Loss data:", response.data);
      setProfitLossData(response.data);
    } catch (error) {
      console.error("Error fetching financial breakdown:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialBreakdown();
  }, [dateRange]);

  // Toggle group expansion
  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const renderProfitLossStatement = () => {
    const { groups, purchase, sales, netProfit } = profitLossData;

    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">
            MATOSHREE FLEET SOLUTIONS PRIVATE LIMITED
          </h1>
          <p className="text-sm">Profit & Loss A/c</p>
          <p className="text-sm">
            {format(new Date(dateRange.startDate), "d-MMM-yy")} to{" "}
            {format(new Date(dateRange.endDate), "d-MMM-yy")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold border-b mb-2">Expenses</h2>
            <div className="space-y-2">
              {/* Purchase Accounts Section */}
              <div className="mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Purchase Accounts</span>
                  <span>₹{purchase.accounts.toLocaleString()}</span>
                </div>
              </div>

              {/* Groups Breakdown */}
              {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  <div
                    className="flex justify-between font-semibold cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => toggleGroupExpansion(group.name)}
                  >
                    <div className="flex items-center">
                      {/* Dropdown arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 mr-2 transform transition-transform duration-200 ${
                          expandedGroups[group.name] ? "rotate-90" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span>{group.name}</span>
                    </div>
                    <span>₹{group.total.toLocaleString()}</span>
                  </div>

                  {/* Dropdown content */}
                  {expandedGroups[group.name] &&
                    group.subGroups
                      .filter((subGroup) => subGroup.amount > 0)
                      .map((subGroup, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex justify-between text-sm pl-10 py-1 bg-gray-50 hover:bg-gray-100"
                        >
                          <span>{subGroup.name}</span>
                          <span>₹{subGroup.amount.toLocaleString()}</span>
                        </div>
                      ))}
                </div>
              ))}

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Expenses</span>
                <span>
                  ₹
                  {(
                    purchase.accounts +
                    groups.reduce((total, group) => total + group.total, 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold border-b mb-2">Income</h2>
            <div className="space-y-2">
              <div className="mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Sales Accounts</span>
                  <span>
                    ₹{sales.accounts.toLocaleString()}
                    <span className="text-xs text-gray-500 ml-2">
                      ({sales.percentage}%)
                    </span>
                  </span>
                </div>
              </div>

              {profitLossData.salesGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  <div
                    className="flex justify-between font-semibold cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => toggleGroupExpansion(`sales_${group.name}`)}
                  >
                    <div className="flex items-center">
                      {/* Dropdown arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 mr-2 transform transition-transform duration-200 ${
                          expandedGroups[`sales_${group.name}`]
                            ? "rotate-90"
                            : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span>{group.name}</span>
                    </div>
                    <span>₹{group.total.toLocaleString()}</span>
                  </div>

                  {/* Dropdown content */}
                  {expandedGroups[`sales_${group.name}`] &&
                    group.subGroups.map((subGroup, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex justify-between text-sm pl-10 py-1 bg-gray-50 hover:bg-gray-100"
                      >
                        <span>{subGroup.name}</span>
                        <span>₹{subGroup.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              ))}

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Sales</span>
                <span>
                  ₹
                  {(
                    sales.accounts +
                    profitLossData.salesGroups.reduce(
                      (total, group) => total + group.total,
                      0
                    )
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Gross Profit</span>
                <span>
                  ₹
                  {(
                    sales.accounts -
                    (purchase.accounts +
                      groups.reduce((total, group) => total + group.total, 0))
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-between font-bold">
            <span>Net Profit</span>
            <span>₹{netProfit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Total</span>
            <span>₹{(sales.accounts + netProfit).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Financial Statements</h1>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="border rounded p-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="border rounded p-2 text-sm"
              />
            </div>
          </div>
        </div>

        {renderProfitLossStatement()}
      </div>
    </div>
  );
};

export default ProfitAndLossPage;
