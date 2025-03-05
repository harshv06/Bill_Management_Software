// components/DayBook/DayBookPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  FaPlus,
  FaFileDownload,
  FaFilter,
  FaChartLine,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";
import Config from "../utils/GlobalConfig";
import Sidebar from "../components/Sidebar";
import AddTransactionModal from "../components/DayBook/AddTransactionModal";
import TransactionTable from "../components/DayBook/TransactionTable";
import MonthlyBalanceCard from "../components/DayBook/MonthlyBalanceCard";
import FilterSection from "../components/DayBook/FilterSection";
import { toast } from "react-toastify";

const DayBookPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [monthlyBalance, setMonthlyBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    type: "all",
    category: "all",
  });
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [hasOpeningBalance, setHasOpeningBalance] = useState(false);
  const [isClosingMonth, setIsClosingMonth] = useState(false);

  const checkOpeningBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/opening-balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
      setHasOpeningBalance(!!response.data.data);
    } catch (error) {
      console.error("Error checking opening balance:", error);
    }
  };

  useEffect(() => {
    checkOpeningBalance();
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions`,
        {
          params: {
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
            type: filters.type === "all" ? null : filters.type,
            category: filters.category === "all" ? null : filters.category,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      setTransactions(response.data.data);

      // Fetch monthly balance
      const year = filters.startDate.getFullYear();
      const month = filters.startDate.getMonth() + 1;
      const balanceResponse = await axios.get(
        `${Config.API_BASE_URL}/daybook/monthly-report/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMonthlyBalance(balanceResponse.data.data.monthlyBalance);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || "Failed to fetch data");
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleAddTransaction = async (transactionData) => {
    try {
        console.log(transactionData)
      const token = localStorage.getItem("token");
      await axios.post(
        `${Config.API_BASE_URL}/daybook/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowAddModal(false);
      fetchData();
      toast.success("Transaction added successfully");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(error.response?.data?.message || "Failed to add transaction");
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/export`,
        {
          params: {
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
            type: filters.type === "all" ? null : filters.type,
            category: filters.category === "all" ? null : filters.category,
          },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with date range
      const fileName = `daybook_${format(
        filters.startDate,
        "yyyy-MM-dd"
      )}_to_${format(filters.endDate, "yyyy-MM-dd")}.xlsx`;
      link.setAttribute("download", fileName);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      console.log(transactionId);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Transaction deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete transaction"
      );
    }
  };

  const handleUpdateTransaction = async (transactionId, updateData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowAddModal(false);
      setEditingTransaction(null);
      fetchData();
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error(
        error.response?.data?.message || "Failed to update transaction"
      );
    }
  };

  const handleSetOpeningBalance = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${Config.API_BASE_URL}/daybook/opening-balance`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowOpeningBalanceModal(false);
      setHasOpeningBalance(true);
      fetchData();
      toast.success("Opening balance set successfully");
    } catch (error) {
      console.error("Error setting opening balance:", error);
      toast.error(
        error.response?.data?.message || "Failed to set opening balance"
      );
    }
  };

  const handleCloseMonth = async () => {
    try {
      const token = localStorage.getItem("token");
      const year = filters.startDate.getFullYear();
      const month = filters.startDate.getMonth() + 1;

      await axios.post(
        `${Config.API_BASE_URL}/daybook/close-month/${year}/${month}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchData();
      toast.success("Month closed successfully");
    } catch (error) {
      console.error("Error closing month:", error);
      toast.error(error.response?.data?.message || "Failed to close month");
    }
  };

  const CloseMonthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Close Month</h2>
        <p className="mb-4 text-gray-600">
          Are you sure you want to close this month? This will:
          <ul className="list-disc ml-4 mt-2">
            <li>Lock all transactions for this month</li>
            <li>Carry forward the closing balance to next month</li>
            <li>Create a new opening balance for next month</li>
          </ul>
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsClosingMonth(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleCloseMonth();
              setIsClosingMonth(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
      <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
      <p className="text-red-700 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        <FaSync className="mr-2" /> Retry
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <FaChartLine className="text-gray-400 text-4xl mb-4" />
      <p className="text-gray-500 mb-4">
        No transactions found for the selected period
      </p>
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        <FaPlus className="mr-2" /> Add First Transaction
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Day Book</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="mr-2" /> Add Transaction
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
              disabled={!transactions.length}
            >
              <FaFileDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        <MonthlyBalanceCard balance={monthlyBalance} />

        <FilterSection filters={filters} setFilters={setFilters} />

        {error ? (
          <ErrorDisplay message={error} onRetry={fetchData} />
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <TransactionTable
            transactions={transactions}
            loading={loading}
            onRefresh={fetchData}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {(showAddModal || editingTransaction) && (
          <AddTransactionModal
            onClose={() => {
              setShowAddModal(false);
              setEditingTransaction(null);
            }}
            onSubmit={
              editingTransaction
                ? (data) =>
                    handleUpdateTransaction(
                      editingTransaction.transaction_id,
                      data
                    )
                : handleAddTransaction
            }
            initialData={editingTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default DayBookPage;
