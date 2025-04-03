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
import TransactionSyncService from "../utils/TransactionSyncService"; // Import the sync service
import { toast } from "react-hot-toast";
import BankAccountService from "../utils/BankAccountService";
import { useAuth } from "@/context/AuthContext";
import config from "../utils/GlobalConfig";

const DayBookPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
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
  const [initialTransactionType, setInitialTransactionType] = useState(null);
  const { user } = useAuth();

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
  }, [pagination.page, filters]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent shortcuts if modal is already open or user is typing in an input
      if (
        showAddModal ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.contentEditable === "true"
      ) {
        return;
      }

      // Ctrl + N or Ctrl + Insert: Open modal with default (Credit) transaction
      if (
        (event.ctrlKey && event.key === "n") ||
        (event.ctrlKey && event.key === "Insert")
      ) {
        event.preventDefault();
        setInitialTransactionType(null);
        setShowAddModal(true);
      }

      // Ctrl + D: Open modal with Debit transaction
      if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        setInitialTransactionType("DEBIT");
        setShowAddModal(true);
      }

      // Ctrl + C: Open modal with Credit transaction
      if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        setInitialTransactionType("CREDIT");
        setShowAddModal(true);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAddModal]);

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
            page: pagination.page,
            limit: pagination.pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure response has the expected pagination structure
      console.log(response.data);
      const responseData = response.data;

      setTransactions(responseData.data || []);

      // Update pagination state with server-provided pagination info
      setPagination((prevPagination) => ({
        ...prevPagination,
        page: responseData.pagination.page || prevPagination.page,
        pageSize: responseData.pagination.pageSize || prevPagination.pageSize,
        totalPages: responseData.pagination.totalPages || 1,
        totalCount: responseData.pagination.total || 0,
        hasNextPage: responseData.pagination.hasNextPage || false,
        hasPrevPage: responseData.pagination.hasPrevPage || false,
      }));

      const year = filters.startDate.getFullYear();
      const month = filters.startDate.getMonth() + 1;
      console.log(year, month);
      const balanceResponse = await axios.get(
        `${config.API_BASE_URL}/daybook/monthly-report/${year}/${month}}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMonthlyBalance(balanceResponse.data.data.monthlyBalance);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.response?.data?.message || "Failed to fetch transactions");

      // Reset pagination on error
      setPagination((prev) => ({
        ...prev,
        hasNextPage: false,
        hasPrevPage: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    // Validate page number
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  const PaginationControls = () => {
    // Only render if there are multiple pages
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center space-x-2">
          {/* Page number input */}
          <input
            type="number"
            min="1"
            max={pagination.totalPages}
            value={pagination.page}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              handlePageChange(page);
            }}
            className="w-16 text-center border rounded px-2 py-1"
          />
          <span>of {pagination.totalPages}</span>
        </div>

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>

        {/* Total count display */}
        <div className="text-gray-600">
          Total: {pagination.totalCount} transactions
        </div>
      </div>
    );
  };

  const generateUniqueReferenceNumber = () => {
    return `TXN-${Date.now()}`;
  };
  // components/DayBook/DayBookPage.js
  const handleAddTransaction = async (transactionData) => {
    try {
      let carPaymentResponse = null;
      let invoiceResponse = null;
      const token = localStorage.getItem("token");
      console.log("Transaction Data:", transactionData);

      // Handle car payment for employee transactions
      if (transactionData.party_type === "Employee" && transactionData.car_id) {
        if (transactionData.transaction_type === "CREDIT") {
          return toast.error("Credit transaction for employee not allowed");
        }
        carPaymentResponse =
          await TransactionSyncService.createCarPaymentFromDaybook(
            transactionData
          );
      }

      // Prepare final daybook transaction data
      const finalTransactionData = {
        ...transactionData,
        reference_number: carPaymentResponse
          ? carPaymentResponse.data.data.payment.payment_id
          : invoiceResponse
          ? invoiceResponse.data.data.invoice.invoice_number
          : generateUniqueReferenceNumber(),
        bank_account_id: transactionData.bank_account_id || null,
        bank_name: transactionData.bank_name || null,
        bank_account_number: transactionData.bank_account_number || null,
        bank_ifsc_code: transactionData.bank_ifsc_code || null,
        // Add invoice reference if created
        invoice_id: invoiceResponse
          ? invoiceResponse.data.data.invoice.invoice_id
          : null,
      };

      console.log("Final Transaction Data:", finalTransactionData);

      // Create daybook transaction
      const daybookResponse = await axios.post(
        `${Config.API_BASE_URL}/daybook/transactions`,
        finalTransactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update bank account balance for ALL transactions with a bank account
      if (finalTransactionData.bank_account_id) {
        try {
          const balanceUpdateData = {
            bank_account_id: finalTransactionData.bank_account_id,
            amount: finalTransactionData.amount,
            transaction_type: finalTransactionData.transaction_type,
            transaction_date:
              finalTransactionData.transaction_date || new Date(),
            description: finalTransactionData.description || "Transaction",
            reference_number: finalTransactionData.reference_number,
            category: finalTransactionData.category || null,
            notes: finalTransactionData.notes || null,
          };

          await BankAccountService.updateAccountBalance(
            balanceUpdateData.bank_account_id,
            balanceUpdateData
          );
        } catch (balanceUpdateError) {
          console.error("Balance update error:", balanceUpdateError);
          toast.error(
            balanceUpdateError.response?.data?.message ||
              "Failed to update bank account balance"
          );
        }
      }

      setShowAddModal(false);
      setEditingTransaction(null);
      fetchData();

      // Prepare success message
      const successMessage = invoiceResponse
        ? "Transaction and Invoice created successfully"
        : carPaymentResponse
        ? "Transaction and Car Payment created successfully"
        : "Transaction added successfully";

      toast.success(successMessage);

      // Return additional data if needed
      return {
        daybookTransaction: daybookResponse.data,
        carPayment: carPaymentResponse?.data,
        invoice: invoiceResponse?.data,
      };
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(error.response?.data?.message || "Failed to add transaction");
      throw error;
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
    // Prepare initial data for editing
    console.log("Transaction", transaction);
    const initialEditData = {
      ...transaction,
      transaction_date: new Date(transaction.transaction_date),
      // Add any additional formatting or transformations needed
    };

    console.log("Daybook", initialEditData);
    setEditingTransaction(initialEditData);
    setShowAddModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      console.log(transactionId);
      const token = localStorage.getItem("token");
      const transactionResponse = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(transactionResponse);
      const transaction = transactionResponse.data.data;

      const balanceRevertData = {
        bank_account_id: transaction.bank_account_id,
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        reference_number: transaction.reference_number,
      };

      if (transaction.bank_account_id) {
        try {
          await BankAccountService.revertTransactionBalance(balanceRevertData);
        } catch (balanceRevertError) {
          console.error("Balance revert error:", balanceRevertError);
          toast.error("Failed to adjust bank account balance");
          // Optionally, you can choose to stop the deletion process
          // return;
        }
      }

      // Handle car payment deletion if applicable
      if (transaction.reference_number.includes("CAR")) {
        try {
          await TransactionSyncService.deleteCarPayment(
            transaction.reference_number.split("-")[2]
          );
        } catch (carPaymentDeleteError) {
          console.error("Car payment deletion error:", carPaymentDeleteError);
          // Log the error but continue with transaction deletion
        }
      }

      await axios.delete(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Data:", data.data.data.reference_number);
      // TransactionSyncService.deleteCarPayment(data.data.data.reference_number);
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
      // Fetch the existing transaction first to compare changes
      const existingTransaction = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const originalTransaction = existingTransaction.data.data;
      console.log("Original Transaction:", originalTransaction);

      // Handle car payment for employee transactions
      let carPaymentResponse = null;
      if (
        updateData.party_type === "Employee" &&
        updateData.car_id &&
        updateData.transaction_type === "DEBIT"
      ) {
        // If it's an existing car payment transaction, update the car payment
        if (originalTransaction.reference_number.includes("CAR")) {
          carPaymentResponse = await TransactionSyncService.updateCarPayment(
            originalTransaction.reference_number.split("-")[2],
            updateData
          );
        }
      }
      console.log("Car Payment Response:", carPaymentResponse);
      // Prepare final updated transaction data
      const finalUpdateData = {
        ...updateData,
        reference_number: carPaymentResponse
          ? `CAR-${carPaymentResponse.data.payment.car_id}-${carPaymentResponse.data.payment.payment_id}`
          : originalTransaction.reference_number,
        // Preserve or update bank account details
        bank_account_id:
          updateData.bank_account_id || originalTransaction.bank_account_id,
        bank_name: updateData.bank_name || originalTransaction.bank_name,
        bank_account_number:
          updateData.bank_account_number ||
          originalTransaction.bank_account_number,
        bank_ifsc_code:
          updateData.bank_ifsc_code || originalTransaction.bank_ifsc_code,
      };

      console.log("Final Update Data:", finalUpdateData);

      // Prepare balance update data
      const balanceUpdateData = {
        bank_account_id:
          finalUpdateData.bank_account_id ||
          originalTransaction.bank_account_id,
        original_bank_account_id: originalTransaction.bank_account_id,
        original_amount: originalTransaction.amount,
        original_transaction_type: originalTransaction.transaction_type,
        new_amount: finalUpdateData.amount,
        new_transaction_type: finalUpdateData.transaction_type,
        reference_number: originalTransaction.reference_number,
      };

      // Update bank account balance if a bank account is involved
      if (
        balanceUpdateData.bank_account_id ||
        balanceUpdateData.original_bank_account_id
      ) {
        try {
          // Use sophisticated balance update method
          await BankAccountService.updateAccountBalanceWithComparison(
            balanceUpdateData
          );
        } catch (balanceUpdateError) {
          console.error("Balance update error:", balanceUpdateError);

          // Detailed error handling
          if (balanceUpdateError.response) {
            toast.error(
              balanceUpdateError.response.data.message ||
                "Failed to update bank account balance"
            );
          } else if (balanceUpdateError.request) {
            toast.error("No response received from server");
          } else {
            toast.error("Error updating bank account balance");
          }

        }
      }

      // Update transaction details
      const response = await axios.put(
        `${Config.API_BASE_URL}/daybook/transactions/${transactionId}`,
        finalUpdateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Close modal and refresh data
      setShowAddModal(false);
      setEditingTransaction(null);
      fetchData();
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);

      // Comprehensive error handling
      if (error.response) {
        // Server responded with an error
        toast.error(
          error.response.data.message || "Failed to update transaction"
        );
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server");
      } else {
        // Something happened in setting up the request
        toast.error("Error updating transaction");
      }
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">
            Day Book{" "}
            <span className="text-xs text-gray-500 ml-2">
              (Ctrl+N: New, Ctrl+C: Credit, Ctrl+D: Debit)
            </span>
          </h1>
          <div className="flex gap-4">
            {user.permissions.includes("daybook:create") && (
              <button
                onClick={() => {
                  setInitialTransactionType(null);
                  setShowAddModal(true);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Transaction
              </button>
            )}

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
          <>
            <TransactionTable
              transactions={transactions}
              loading={loading}
              onRefresh={fetchData}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />

            <PaginationControls />
          </>
        )}

        {(showAddModal || editingTransaction) && (
          <AddTransactionModal
            onClose={() => {
              setShowAddModal(false);
              setEditingTransaction(null);
              setInitialTransactionType(null);
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
            initialData={
              editingTransaction
                ? editingTransaction
                : initialTransactionType
                ? {
                    transaction_type: initialTransactionType,
                    transaction_date: new Date(),
                  }
                : null
            }
            mode={editingTransaction ? "edit" : "add"}
          />
        )}
      </div>
    </div>
  );
};

export default DayBookPage;
