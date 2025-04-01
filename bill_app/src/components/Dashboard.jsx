import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import config from "../utils/GlobalConfig";
import { COLOR_PALETTE, CHART_COLORS } from "../utils/Themes";
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
  const navigate = useNavigate();
  const handlePendingPaymentsClick = () => {
    navigate("/invoices?status=pending");
  };

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    totalExpenses: 0,
    total_expense: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    monthlyRevenue: [],
    expenseBreakdown: [],
    invoiceStatusBreakdown: [],
    totalRemainingAmount: 0,
    daybookDebitTransactions: [],
    totalDaybookDebitAmount: 0,
    purchaseInvoice:0,
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
  const [expenseLineData, setExpenseLineData] = useState([]);

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

  // Enhanced Loading Component
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  // First useEffect for fetching dashboard data and filtered data
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setIsFilteredDataLoading(true);
        const token = localStorage.getItem("token");

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
        console.log(response)
        const transformedExpenseBreakdown = (data.expenseBreakdown || []).map(
          (item) => ({
            ...item,
            value: parseFloat(item.value || 0),
            payment_type: item.payment_type || "Unknown",
          })
        );

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
          daybookDebitTransactions: data.daybookDebitTransactions || [],
          totalDaybookDebitAmount: data.totalDaybookDebitAmount || 0,
          dayBookDebitTotalAmount:
            data.daybookDebitTransactionBreakdown.total_amount || 0,
          purchaseInvoice:data.purchaseInvoices
        });
        setLoading(false);

        console.log("Dashboard data:", data);
        // Process expense line data
        const processedExpenseLineData = (
          data.daybookDebitTransactions || []
        ).map((item) => ({
          name: item.party_type,
          amount: parseFloat(item.total_amount || 0),
          transaction_count: item.transaction_count || 0,
          date: new Date().toLocaleDateString(),
        }));

        setExpenseLineData(processedExpenseLineData);

        // Process filtered expense and revenue data
        setFilteredExpenseData(transformedExpenseBreakdown);
        setFilteredRevenueData(data.monthlyRevenue || []);

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

  const processedRevenueData = useMemo(() => {
    return (dashboardData.monthlyRevenue || []).map((item) => ({
      ...item,
      revenue: parseFloat(item.revenue || 0),
    }));
  }, [dashboardData.monthlyRevenue]);

  const processedExpenseData = useMemo(() => {
    return (dashboardData.daybookDebitTransactions || []).map((item) => ({
      ...item,
      total_amount: parseFloat(item.total_amount || 0),
    }));
  }, [dashboardData.daybookDebitTransactions]);

  // Render methods with improved error handling
  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => {
          setError(null);
          // Trigger data refetch
          fetchDashboardData();
        }}
      />
    );
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

  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <svg
        className="w-24 h-24 text-red-500 mb-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Oops! Something Went Wrong
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
      >
        <RefreshIcon className="mr-2" />
        Retry
      </button>
    </div>
  );

  const DateRangePicker = ({ startDate, endDate, onChange }) => (
    <div className="flex items-center space-x-4">
      <div>
        <label className="block text-sm text-neutral-600 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate.toISOString().split("T")[0]}
          onChange={(e) => onChange("start", new Date(e.target.value))}
          className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-600 mb-1">End Date</label>
        <input
          type="date"
          value={endDate.toISOString().split("T")[0]}
          onChange={(e) => onChange("end", new Date(e.target.value))}
          className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

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
    <div className="flex bg-gray-100">
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
                  ₹
                  {dashboardData.dayBookDebitTotalAmount?.toLocaleString() ||
                    "0"}
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
              <div className="flex items-center justify-center h-[300px] ">
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
          {isFilteredDataLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : dashboardData.daybookDebitTransactions.length > 0 ? (
            <div className="bg-white p-5 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Expense Breakdown
                </h2>
                <div className="flex gap-2">
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="total_amount"
                    nameKey="party_type"
                  >
                    {processedExpenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
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
                          Total Debit
                          <tspan
                            x={cx}
                            y={cy + 20}
                            fontSize={16}
                            fontWeight="bold"
                          >
                            ₹
                            {processedExpenseData
                              .reduce(
                                (sum, item) =>
                                  sum + parseFloat(item.total_amount || 0),
                                0
                              )
                              .toLocaleString()}
                          </tspan>
                        </text>
                      )}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const item = processedExpenseData.find(
                        (d) => d.party_type === name
                      );
                      const total = processedExpenseData.reduce(
                        (sum, item) => sum + parseFloat(item.total_amount || 0),
                        0
                      );
                      const percentage = (
                        (parseFloat(value || 0) / total) *
                        100
                      ).toFixed(1);
                      return [
                        `₹${parseFloat(value).toLocaleString()}`,
                        `${name} (${percentage}%) - ${
                          item.transaction_count?.toLocaleString() || 0
                        } transactions`,
                      ];
                    }}
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
                      const total = processedExpenseData.reduce(
                        (sum, item) => sum + parseFloat(item.total_amount || 0),
                        0
                      );
                      const percentage = (
                        (parseFloat(payload.total_amount || 0) / total) *
                        100
                      ).toFixed(1);
                      return `${value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-center h-[300px] text-gray-500">
              No debit transaction data available for this period
            </div>
          )}
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
                formatter={(value, name) => [
                  `₹${value.toLocaleString()}`,
                  `${name} Expenses`,
                ]}
                cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => `${value} Expenses`}
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
