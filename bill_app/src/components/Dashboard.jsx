import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaBars,
} from "react-icons/fa";

import Config from "../utils/GlobalConfig";
import Sidebar from "./Sidebar";

// Chart.js registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Color palette
const COLORS = {
  primary: "rgba(54, 162, 235, 0.7)",
  secondary: "rgba(255, 99, 132, 0.7)",
  success: "rgba(75, 192, 192, 0.7)",
  warning: "rgba(255, 206, 86, 0.7)",
  info: "rgba(153, 102, 255, 0.7)",
};

const FinancialDashboard = () => {
  const [financialData, setFinancialData] = useState({
    monthlyRevenue: [],
    monthlyExpenses: [],
    invoiceStats: {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
    },
    companyBreakdown: [],
    paymentMethodBreakdown: [],
    topPerformingCompanies: [],
    cashFlow: [],
    totalRevenue: 0,
    profitMargin: 0,
    expenseBreakdown: [], // Ensure this is included
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("yearly");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [timeframe]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Config.API_BASE_URL}/dashboard`, {
        params: { timeframe },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Ensure expenseBreakdown is always an array
      const data = response.data;
      data.expenseBreakdown = data.expenseBreakdown || [];

      setFinancialData(data);
    } catch (error) {
      console.error("Financial data fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Memoized chart data with enhanced safety
  const chartData = useMemo(() => {
    const safeMap = (arr, key) =>
      arr && arr.length ? arr.map((item) => item[key] || 0) : [];
    const safeLabels = (arr, key) =>
      arr && arr.length ? arr.map((item) => item[key] || "") : [];

    return {
      revenueExpensesChart: {
        labels: safeLabels(financialData.monthlyRevenue, "month"),
        datasets: [
          {
            label: "Revenue",
            data: safeMap(financialData.monthlyRevenue, "amount"),
            borderColor: COLORS.primary,
            backgroundColor: COLORS.primary,
          },
          {
            label: "Expenses",
            data: safeMap(financialData.monthlyExpenses, "amount"),
            borderColor: COLORS.secondary,
            backgroundColor: COLORS.secondary,
          },
        ],
      },
      invoiceStatusChart: {
        labels: ["Paid", "Pending", "Overdue"],
        datasets: [
          {
            data: [
              financialData.invoiceStats.paid || 0,
              financialData.invoiceStats.pending || 0,
              financialData.invoiceStats.overdue || 0,
            ],
            backgroundColor: [COLORS.success, COLORS.warning, COLORS.secondary],
          },
        ],
      },
      companyRevenueChart: {
        labels: safeLabels(financialData.companyBreakdown, "name"),
        datasets: [
          {
            label: "Revenue",
            data: safeMap(financialData.companyBreakdown, "revenue"),
            backgroundColor: Object.values(COLORS),
          },
        ],
      },
      paymentMethodsChart: {
        labels: safeLabels(financialData.paymentMethodBreakdown, "method"),
        datasets: [
          {
            data: safeMap(financialData.paymentMethodBreakdown, "amount"),
            backgroundColor: Object.values(COLORS),
          },
        ],
      },
      cashFlowChart: {
        labels: safeLabels(financialData.cashFlow, "period"),
        datasets: [
          {
            label: "Cash Flow",
            data: safeMap(financialData.cashFlow, "amount"),
            borderColor: COLORS.info,
            backgroundColor: COLORS.info,
          },
        ],
      },
      expenseBreakdownChart: {
        labels: safeLabels(financialData.expenseBreakdown, "transaction_type"),
        datasets: [
          {
            data: safeMap(financialData.expenseBreakdown, "total_amount"),
            backgroundColor: [
              COLORS.secondary,
              COLORS.warning,
              COLORS.info,
              COLORS.primary,
            ],
          },
        ],
      },
    };
  }, [financialData]);

  // KPI Cards Component
  const FinancialKPICard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
      <div className={`mr-4 text-3xl text-${color}-500`}>
        <Icon />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );

  // Chart options
  const createChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: title,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  });

  // Render chart method
  const renderChart = (ChartComponent, data, title) => {
    if (!data || !data.labels || data.labels.length === 0) {
      return (
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="h-96">
          <ChartComponent data={data} options={createChartOptions(title)} />
        </div>
      </div>
    );
  };

  // Render loading or error state
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading financial data...
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Mobile Header with Sidebar Toggle */}
        <div className="md:hidden flex items-center p-4 bg-white shadow-md">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4"
          >
            <FaBars className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center p-6 bg-white shadow-md">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Mobile Timeframe Selector */}
        <div className="md:hidden p-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full border rounded px-2 py-2"
          >
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Charts Grid */}
        <div className="p-4 md:p-6 grid md:grid-cols-2 gap-4 md:gap-6">
          {renderChart(
            Line,
            chartData.revenueExpensesChart,
            "Revenue vs Expenses"
          )}
          {renderChart(Pie, chartData.invoiceStatusChart, "Invoice Status")}
          {renderChart(Bar, chartData.companyRevenueChart, "Company Revenue")}
          {renderChart(
            Doughnut,
            chartData.paymentMethodsChart,
            "Payment Methods"
          )}
          {renderChart(Line, chartData.cashFlowChart, "Cash Flow")}
          {renderChart(
            Pie,
            chartData.expenseBreakdownChart,
            "Expense Breakdown"
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
