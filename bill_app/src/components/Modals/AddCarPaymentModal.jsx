import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../utils/GlobalConfig";
import { toast } from "react-toastify";
import TransactionSyncService from "../../utils/TransactionSyncService";
import BankAccountService from "../../utils/BankAccountService";

const AddCarPaymentModal = ({ isOpen, onClose, carId, onPaymentAdded }) => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    car_id: carId,
    amount: "",
    payment_date: getTodayDate(),
    payment_type: "advance",
    notes: "",
    payment_method: "cash",
    bank_account_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Bank account related states
  const [bankAccounts, setBankAccounts] = useState([]);

  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "cheque",
    "upi",
    "card",
    "other",
  ];

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await BankAccountService.getAllBankAccountsWithBalance();
        setBankAccounts(response.data.data);
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        toast.error("Failed to fetch bank accounts");
      }
    };

    if (formData.payment_method !== "cash") {
      fetchBankAccounts();
    }
  }, [formData.payment_method]);

  // Handle bank account selection
  const handleBankAccountSelect = (accountId) => {
    console.log("Selected Bank Account:", accountId);
    const selectedAccount = bankAccounts.find(
      (account) => account.account_id === accountId
    );

    setSelectedBankAccount(selectedAccount);
    setFormData((prev) => ({
      ...prev,
      bank_account_id: accountId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate bank account for non-cash payments
      if (formData.payment_method !== "cash" && !formData.bank_account_id) {
        throw new Error("Please select a bank account");
      }

      const selectedDate = new Date(formData.payment_date);
      const currentDate = new Date();

      // Create a new date with selected date and current time
      const paymentDate = new Date();
      paymentDate.setFullYear(selectedDate.getFullYear());
      paymentDate.setMonth(selectedDate.getMonth());
      paymentDate.setDate(selectedDate.getDate());

      console.log("Selected Date:", formData);

      const paymentData = {
        ...formData,
        car_id: carId,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type || "advance",
        payment_date: paymentDate.toISOString(),
      };

      // Create Car Payment
      const carPaymentResponse = await axios.post(
        `${Config.API_BASE_URL}/cars/payments`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Create Daybook Transaction if car payment is successful
      if (carPaymentResponse.data.data.payment.payment_id) {
        const daybookData = {
          transaction_date: paymentDate,
          description: `Advance Car Payment - ${carId}`,
          transaction_type: "DEBIT",
          amount: paymentData.amount,
          reference_number: carPaymentResponse.data.data.payment.payment_id,
          category: "DIRECT",
          sub_group:"ADVANCE",
          payment_method: paymentData.payment_method,
          notes: paymentData.notes,
          account_head: "Expenses",
          sub_account: paymentData.payment_method === "cash" ? "Cash" : "Bank",
          voucher_type: "Payment",
          party_type: "Employee",
          party_name: `${carId} - Car Payment`,
          car_id: carId,
          car_payment_id: carPaymentResponse.data.data.payment.payment_id,
          bank_account_id: paymentData.bank_account_id || null,
        };

        const daybookResponse =
          await TransactionSyncService.createDaybookFromCarPayment(daybookData);
      }

      // Success notifications
      toast.success("Car payment added successfully");
      onPaymentAdded(); // Refresh payment history
      onClose(); // Close modal
    } catch (error) {
      // Detailed error handling
      console.error("Error in payment submission:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while saving the payment";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-6">Add Car Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full pl-8 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={(e) =>
                setFormData({ ...formData, payment_date: e.target.value })
              }
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              max={getTodayDate()}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  payment_method: e.target.value,
                  bank_account_id: "" // Reset bank account when method changes
                })
              }
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Account Selection (for non-cash payments) */}
          {formData.payment_method !== "cash" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Bank Account *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {bankAccounts.map((account) => (
                  <div
                    key={account.account_id}
                    onClick={() => handleBankAccountSelect(account.account_id)}
                    className={`
                      border rounded p-2 cursor-pointer transition-all
                      ${
                        selectedBankAccount?.account_id === account.account_id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-semibold">
                          {account.bank_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.account_number.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">
                          ₹{account.current_balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {formData.payment_method !== "cash" && !formData.bank_account_id && (
                <p className="text-red-500 text-xs mt-1">
                  Please select a bank account
                </p>
              )}
            </div>
          )}

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <select
              name="payment_type"
              value={formData.payment_type}
              onChange={(e) =>
                setFormData({ ...formData, payment_type: e.target.value })
              }
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="advance">Advance</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Add any additional notes here..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-4 rounded-md flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarPaymentModal;