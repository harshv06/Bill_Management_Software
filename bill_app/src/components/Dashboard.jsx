import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import config from "../utils/GlobalConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  LabelList,
  Label,
} from "recharts";
import {
  FaCar,
  FaMoneyBillWave,
  FaFileInvoice,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate=useNavigate();
  const handlePendingPaymentsClick = () => {
    navigate('/invoices?status=pending');
  };

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    totalExpenses: 0,
    total_expense: 0, // Add this line
    totalRevenue: 0,
    totalInvoices: 0,
    monthlyRevenue: [],
    expenseBreakdown: [],
    invoiceStatusBreakdown: [],
    totalRemainingAmount: 0, // Add this
  });

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add these new state variables at the beginning of your Dashboard component
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState(
    new Date().getMonth()
  );
  const [selectedExpenseYear, setSelectedExpenseYear] = useState(
    new Date().getFullYear()
  );
  const [revenueTimeframe, setRevenueTimeframe] = useState("monthly");
  const [filteredExpenseData, setFilteredExpenseData] = useState([]);
  const [filteredRevenueData, setFilteredRevenueData] = useState([]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Add this after your existing state declarations
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);

  // Update the fetchFilteredData function
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFilteredDataLoading(true);
        const token = localStorage.getItem("token");

        // Use the filtered data from the main dashboard response
        const response = await axios.get(`${config.API_BASE_URL}/dashboard`, {
          params: {
            month: selectedExpenseMonth,
            year: selectedExpenseYear,
            revenueTimeframe,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data || {};

        const transformedExpenseBreakdown = (data.expenseBreakdown || []).map(
          (item) => ({
            ...item,
            value: parseFloat(item.value || 0),
            payment_type: item.payment_type || "Unknown",
          })
        );
        console.log(data);
        setDashboardData({
          totalCars: data.totalCars || 0,
          totalExpenses: data.totalExpenses || 0,
          totalRevenue: data.totalRevenue || 0,
          totalInvoices: data.totalInvoices || 0,
          monthlyRevenue: data.monthlyRevenue || [],
          expenseBreakdown: transformedExpenseBreakdown,
          invoiceStatusBreakdown: data.invoiceStatusBreakdown || [],
          total_expense: data.total_expenses || 0,
          totalRemainingAmount: data.totalRemainingAmount || 0,
        });
        setLoading(false);
        // Process expense data

        const processedExpenseData = (
          response.data.formattedExpenseBreakdown || []
        )
          .map((item) => ({
            name:
              item.payment_type.charAt(0).toUpperCase() +
              item.payment_type.slice(1),
            value: parseFloat(item.value || 0),
          }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value); // Sort by value descending

        setIsFilteredDataLoading(false);
      } catch (error) {
        console.error("Error fetching filtered data:", error);
        setError(
          error.response?.data?.message || "Failed to fetch filtered data"
        );
        setIsFilteredDataLoading(false);
      }
    };

    fetchFilteredData();
  }, [selectedExpenseMonth, selectedExpenseYear, revenueTimeframe]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFilteredDataLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${config.API_BASE_URL}/dashboard/filtered-data`,
          {
            params: {
              month: selectedExpenseMonth,
              year: selectedExpenseYear,
              timeframe: revenueTimeframe,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "success") {
          setFilteredExpenseData(response.data.data.expenses);
          setFilteredRevenueData(response.data.data.revenue);
        }

        setIsFilteredDataLoading(false);
      } catch (error) {
        console.error("Error fetching filtered data:", error);
        setError(
          error.response?.data?.message || "Failed to fetch filtered data"
        );
        setIsFilteredDataLoading(false);
      }
    };

    fetchFilteredData();
  }, [selectedExpenseMonth, selectedExpenseYear, revenueTimeframe]);

  const [purchaseDistribution, setPurchaseDistribution] = useState([]);

  useEffect(() => {
    const fetchPurchaseDistribution = async () => {
      try {
        setPurchaseLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/purchase-distribution`,
          {
            params: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        setPurchaseDistribution(response.data.data);
        setPurchaseLoading(false);
      } catch (error) {
        console.error("Error fetching purchase distribution:", error);
        setPurchaseLoading(false);
      }
    };

    fetchPurchaseDistribution();
  }, [startDate, endDate]);

  const expenseLineData = dashboardData.expenseBreakdown.map((item) => ({
    name:
      item.payment_type.charAt(0).toUpperCase() + item.payment_type.slice(1),
    amount: parseFloat(item.value),
    date: new Date(item.payment_date).toLocaleDateString(),
  }));

  // Custom Tooltip for Expense Line Chart
  const ExpenseLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-green-600">
            {payload[0].name}: ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Error State Component
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* Total Cars */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">Total Cars</h2>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.totalCars}
                </p>
              </div>
              <FaCar className="text-blue-400 text-3xl" />
            </div>
          </div>

          {/* Car Advanced Payments */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">
                  Car Advanced Payments
                </h2>
                <p className="text-2xl font-bold text-green-600">
                  ₹{dashboardData.totalExpenses.toLocaleString()}
                </p>
              </div>
              <FaMoneyBillWave className="text-green-400 text-3xl" />
            </div>
          </div>

          {/* Total Expenses - New Box */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">Total Expenses</h2>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{dashboardData.total_expense?.toLocaleString() || "0"}
                </p>
              </div>
              <FaMoneyBillWave className="text-orange-400 text-3xl" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">Total Revenue</h2>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{dashboardData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <FaChartLine className="text-purple-400 text-3xl" />
            </div>
          </div>

          {/* Total Invoices */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">Total Invoices</h2>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData.totalInvoices}
                </p>
              </div>
              <FaFileInvoice className="text-red-400 text-3xl" />
            </div>
          </div>

          <div
            className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            onClick={handlePendingPaymentsClick}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-500 text-sm mb-2">Pending Payments</h2>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{dashboardData.totalRemainingAmount.toLocaleString()}
                </p>
              </div>
              <div className="relative">
                <FaFileInvoice className="text-yellow-400 text-3xl" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Revenue Analysis
              </h2>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-1 text-sm"
                  value={revenueTimeframe}
                  onChange={(e) => setRevenueTimeframe(e.target.value)}
                >
                  <option value="all">All Months</option>
                  <option value="monthly">Selected Month</option>
                  <option value="quarterly">Selected Quarter</option>
                  <option value="yearly">Yearly</option>
                </select>
                <select
                  className="border rounded-md px-3 py-1 text-sm"
                  value={selectedExpenseYear}
                  onChange={(e) =>
                    setSelectedExpenseYear(parseInt(e.target.value))
                  }
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {isFilteredDataLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filteredRevenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    // fontSize={2}
                    tickSize={7}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                    // itemStyle={{ color: "#3B82F6" ,fontSize:"1px"}}
                    // labelStyle={{ color: "#3B82F6" ,fontSize:"1px"}}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3B82F6"
                    barSize={revenueTimeframe === "all" ? 20 : 40} // Smaller bars for all months
                    radius={[10, 10, 0, 0]}
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Expense Breakdown Chart */}
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Expense Breakdown
              </h2>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-1 text-sm"
                  value={selectedExpenseMonth}
                  onChange={(e) =>
                    setSelectedExpenseMonth(parseInt(e.target.value))
                  }
                >
                  {MONTH_NAMES.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded-md px-3 py-1 text-sm"
                  value={selectedExpenseYear}
                  onChange={(e) =>
                    setSelectedExpenseYear(parseInt(e.target.value))
                  }
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {isFilteredDataLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
              </div>
            ) : filteredExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {filteredExpenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <Label
                      position="center"
                      content={({ viewBox: { cx, cy } }) => (
                        <text
                          x={cx}
                          y={cy}
                          fill="#333"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={14}
                        >
                          Total Expenses
                          <tspan x={cx} y={cy + 20}>
                            ₹
                            {filteredExpenseData
                              .reduce((sum, item) => sum + item.value, 0)
                              .toLocaleString()}
                          </tspan>
                        </text>
                      )}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                      padding: "0.5rem",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      const total = filteredExpenseData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );
                      const percentage = (
                        (payload.value / total) *
                        100
                      ).toFixed(1);
                      return `${value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No expense data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Expense Line Chart Section */}
        <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Expense Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={expenseLineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip
                content={<ExpenseLineTooltip />}
                cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={3}
                activeDot={{
                  r: 8,
                  fill: "#10B981",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Purchase Distribution Chart */}
        <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Purchase Distribution by Vendor
            </h2>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate.toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate.toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>

          {purchaseLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : purchaseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purchaseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="total_amount"
                  nameKey="vendor_name"
                >
                  {purchaseDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox: { cx, cy } }) => (
                      <text
                        x={cx}
                        y={cy}
                        fill="#333"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                      >
                        Total Purchases
                        <tspan x={cx} y={cy + 20}>
                          ₹
                          {purchaseDistribution
                            .reduce((sum, item) => sum + item.total_amount, 0)
                            .toLocaleString()}
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                    padding: "0.5rem",
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry) => {
                    const { payload } = entry;
                    const total = purchaseDistribution.reduce(
                      (sum, item) => sum + item.total_amount,
                      0
                    );
                    const percentage = (
                      (payload.total_amount / total) *
                      100
                    ).toFixed(1);
                    return `${value} (${percentage}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No purchase data available for this period
            </div>
          )}
        </div>

        {/* Invoice Status Section */}
        <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Invoice Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.invoiceStatusBreakdown.map((status, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded-lg text-center"
              >
                <h3 className="text-sm text-gray-600 capitalize">
                  {status.status} Invoices
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {status.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
