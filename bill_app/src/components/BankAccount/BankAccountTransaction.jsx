import React, { useState, useEffect } from "react";
import {
  FilterIcon,
  DownloadIcon,
  RefreshIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import axios from "axios";
import { toast } from "react-toastify";
import Config from "../../utils/GlobalConfig";

const BankAccountTransactions = ({ account, onAddTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
    transactionType: "ALL",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/bank/account/${account.account_id}/statement`,
        {
          params: {
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
            bank_account_id: account.account_id,
            type:
              filters.transactionType === "ALL"
                ? null
                : filters.transactionType,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Transactions:", response);
      setTransactions(response.data.data.transactions || []);
    } catch (error) {
      console.error("Error fetching bank account transactions:", error);
      setError(error.response?.data?.message || "Failed to fetch transactions");
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (transactionIds) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${Config.API_BASE_URL}/daybook/transactions/reconcile`,
        { transactionIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTransactions();
      setSelectedTransactions([]);
      toast.success("Transactions reconciled successfully");
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Reconciliation failed");
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/export`,
        {
          params: {
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
            bank_account_id: account.account_id,
          },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `bank_transactions_${account.bank_name}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export transactions");
    }
  };

  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTransactions(transactions.map((t) => t.transaction_id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const renderTransactionRow = (transaction) => (
    <tr
      key={transaction.transaction_id}
      className={
        transaction.transaction_type === "CREDIT"
          ? "bg-green-50 hover:bg-green-100"
          : "bg-red-50 hover:bg-red-100"
      }
    >
      <td className="p-2">
        <input
          type="checkbox"
          checked={selectedTransactions.includes(transaction.transaction_id)}
          onChange={() => handleTransactionSelect(transaction.transaction_id)}
          className="mr-2"
        />
      </td>
      <td className="p-2">
        {new Date(transaction.transaction_date).toLocaleDateString()}
      </td>
      <td className="p-2">{transaction.description}</td>
      <td className="p-2 text-right font-bold">
        {transaction.transaction_type === "CREDIT" ? "+" : "-"}₹
        {parseFloat(transaction.amount).toLocaleString()}
      </td>
      {/* <td className="p-2">
        {transaction.is_reconciled ? (
          <span className="text-green-500">Reconciled</span>
        ) : (
          <span className="text-yellow-500">Pending</span>
        )}
      </td> */}
    </tr>
  );

  const FilterModal = () => {
    const [localFilters, setLocalFilters] = useState({ ...filters });

    const applyFilters = () => {
      setFilters(localFilters);
      setShowFilterModal(false);
    };

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Filter Transactions</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={localFilters.startDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    startDate: new Date(e.target.value),
                  }))
                }
                className="w-full border rounded p-2"
              />
              <input
                type="date"
                value={localFilters.endDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    endDate: new Date(e.target.value),
                  }))
                }
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              value={localFilters.transactionType}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  transactionType: e.target.value,
                }))
              }
              className="w-full border rounded p-2"
            >
              <option value="ALL">All Transactions</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Account Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{account.bank_name}</h2>
                <p className="text-gray-500">
                  A/c No: {account.account_number} | {account.account_type}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">
              ₹{parseFloat(account.current_balance).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Current Balance</p>
          </div>
        </div>
      </div>

      {/* Transactions Toolbar */}
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button
            onClick={onAddTransaction}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Transaction
          </button>
          <button
            className="flex items-center border px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => setShowFilterModal(true)}
          >
            <FilterIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
          {selectedTransactions.length > 0 && (
            <button
              onClick={() => handleReconcile(selectedTransactions)}
              className="border px-4 py-2 rounded hover:bg-gray-100 text-green-600"
            >
              Reconcile Selected
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            className="border px-4 py-2 rounded hover:bg-gray-100"
            onClick={fetchTransactions}
          >
            <RefreshIcon className="h-5 w-5" />
          </button>
          <button
            className="flex items-center border px-4 py-2 rounded hover:bg-gray-100"
            onClick={handleExport}
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-500 p-4 text-center">
            No transactions found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedTransactions.length === transactions.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Amount</th>
                {/* <th className="p-2 text-left">Status</th> */}
              </tr>
            </thead>
            <tbody>{transactions.map(renderTransactionRow)}</tbody>
          </table>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && <FilterModal />}
    </div>
  );
};

export default BankAccountTransactions;