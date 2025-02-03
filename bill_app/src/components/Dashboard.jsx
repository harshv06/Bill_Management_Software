import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "./Sidebar";
import { 
  CurrencyRupeeIcon, 
  TrendingUpIcon, 
  TrendingDownIcon 
} from '@heroicons/react/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white shadow-md rounded-lg p-5 flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h3 className="text-sm text-gray-500 uppercase">{title}</h3>
      <p className="text-xl font-bold">₹{(value || 0).toLocaleString()}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    monthly_expenses: Array(12).fill({ total_expense: 0 }),
    monthly_revenues: Array(12).fill({ total_revenue: 0 }),
    overall_stats: {
      total_revenue: 0,
      total_expenses: 0
    },
    current_month: {
      total_expense: 0,
      total_revenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://192.168.0.106:5000/api/dashboard-stats");
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        // Additional logging
        console.log('Raw Dashboard Data:', data);
        
        // Validate and set data
        setDashboardData({
          monthly_expenses: data.monthly_expenses || Array(12).fill({ total_expense: 0 }),
          monthly_revenues: data.monthly_revenues || Array(12).fill({ total_revenue: 0 }),
          overall_stats: data.overall_stats || { total_revenue: 0, total_expenses: 0 },
          current_month: data.current_month || { total_expense: 0, total_revenue: 0 }
        });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Expenses Chart Data
  const expensesChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Monthly Expenses",
        data: dashboardData.monthly_expenses.map((item) => item.total_expense),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Revenues Chart Data
  const revenuesChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Monthly Revenues",
        data: dashboardData.monthly_revenues.map((item) => item.total_revenue),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Financial Overview",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  // Calculate Net Position
  const netPosition = (dashboardData.overall_stats.total_revenue || 0) - 
                      (dashboardData.overall_stats.total_expenses || 0);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Financial Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={dashboardData.overall_stats.total_revenue} 
            icon={TrendingUpIcon}
            color="bg-green-500"
          />
          <StatCard 
            title="Total Expenses" 
            value={dashboardData.overall_stats.total_expenses} 
            icon={TrendingDownIcon}
            color="bg-red-500"
          />
          <StatCard 
            title="Net Position" 
            value={netPosition}
            icon={CurrencyRupeeIcon}
            color="bg-blue-500"
          />
        </div>

        {/* Current Month Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Current Month Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{dashboardData.current_month.total_revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Current Month Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              ₹{dashboardData.current_month.total_expense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
            <div className="h-96">
              <Bar data={expensesChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Revenues</h2>
            <div className="h-96">
              <Bar data={revenuesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;