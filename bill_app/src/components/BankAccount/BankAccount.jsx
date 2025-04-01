import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ACCOUNT_TYPES = [
  "SAVINGS",
  "CURRENT",
  "FIXED_DEPOSIT",
  "RECURRING_DEPOSIT",
];

const BankAccountModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    account_type: "SAVINGS",
    initial_balance: "",
    branch_name: "",
    ifsc_code: "",
  });

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + A
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        // You can add logic to open the modal if it's not already open
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.bank_name) {
      toast.error("Bank Name is required");
      return;
    }

    if (!formData.account_number) {
      toast.error("Account Number is required");
      return;
    }

    if (!formData.ifsc_code) {
      toast.error("IFSC Code is required");
      return;
    }

    // Convert initial balance to number
    const initialBalance = parseFloat(formData.initial_balance) || 0;

    // Create account with formatted data
    onCreate({
      ...formData,
      initial_balance: initialBalance,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-30 backdrop-blur-sm 
      flex items-center justify-center z-50 p-4"
    >
      <div
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md 
        p-8 border border-gray-100 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 
          hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add Bank Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank Name */}
          <div>
            <label
              htmlFor="bank_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bank Name
            </label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              required
              placeholder="Enter Bank Name"
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Account Number */}
          <div>
            <label
              htmlFor="account_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Number
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              required
              placeholder="Enter Account Number"
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Account Type */}
          <div>
            <label
              htmlFor="account_type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Type
            </label>
            <select
              id="account_type"
              name="account_type"
              value={formData.account_type}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Name */}
          <div>
            <label
              htmlFor="branch_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Branch Name
            </label>
            <input
              type="text"
              id="branch_name"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleInputChange}
              placeholder="Enter Branch Name"
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label
              htmlFor="ifsc_code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              IFSC Code
            </label>
            <input
              type="text"
              id="ifsc_code"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleInputChange}
              required
              placeholder="Enter IFSC Code"
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label
              htmlFor="initial_balance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Initial Balance
            </label>
            <input
              type="number"
              id="initial_balance"
              name="initial_balance"
              value={formData.initial_balance}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Enter Initial Balance"
              className="w-full p-3 border rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 
              rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white 
              rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;
