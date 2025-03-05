// components/DayBook/AddTransactionModal.js
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddTransactionModal = ({ onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      transaction_date: new Date(),
      description: "",
      transaction_type: "CREDIT",
      amount: "",
      reference_number: "",
      category: "",
      payment_method: "",
      notes: "",
      // New accounting-specific fields
      account_head: "",
      sub_account: "",
      voucher_type: "",
      voucher_number: "",
      gst_applicable: false,
      gst_amount: "",
      gst_rate: "",
      narration: "",
      party_name: "",
      party_type: "",
    }
  );

  const accountHeads = [
    "Assets",
    "Liabilities",
    "Income",
    "Expenses",
    "Capital",
  ];

  const subAccounts = {
    Assets: [
      "Cash",
      "Bank",
      "Accounts Receivable",
      "Fixed Assets",
      "Inventory",
    ],
    Liabilities: ["Accounts Payable", "Loans", "Tax Payable"],
    Income: ["Sales", "Service Revenue", "Interest Income"],
    Expenses: ["Purchase", "Salary", "Rent", "Utilities", "Office Expenses"],
    Capital: ["Owner's Capital", "Drawings"],
  };

  const voucherTypes = [
    "Payment",
    "Receipt",
    "Contra",
    "Journal",
    "Sales",
    "Purchase",
  ];

  const partyTypes = ["Customer", "Vendor", "Employee", "Other"];
  const [errors, setErrors] = useState({});

  const categories = [
    "salary",
    "rent",
    "utilities",
    "supplies",
    "maintenance",
    "other",
  ];

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "cheque",
    "upi",
    "card",
    "other",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Valid amount is required";
    // if (!formData.category) newErrors.category = "Category is required";
    // if (!formData.payment_method)
    //   newErrors.payment_method = "Payment method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Clicked:",errors)
    if (validateForm()) {
        onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 my-6">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <DatePicker
                    selected={formData.transaction_date}
                    onChange={(date) =>
                      setFormData({ ...formData, transaction_date: date })
                    }
                    className="w-full border rounded-lg p-2"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voucher Type
                  </label>
                  <select
                    value={formData.voucher_type}
                    onChange={(e) =>
                      setFormData({ ...formData, voucher_type: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select Voucher Type</option>
                    {voucherTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voucher Number
                  </label>
                  <input
                    type="text"
                    value={formData.voucher_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        voucher_number: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full border rounded-lg p-2 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Head
                  </label>
                  <select
                    value={formData.account_head}
                    onChange={(e) =>
                      setFormData({ ...formData, account_head: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select Account Head</option>
                    {accountHeads.map((head) => (
                      <option key={head} value={head}>
                        {head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Account
                  </label>
                  <select
                    value={formData.sub_account}
                    onChange={(e) =>
                      setFormData({ ...formData, sub_account: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select Sub Account</option>
                    {formData.account_head &&
                      subAccounts[formData.account_head].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Amount Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Amount Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_type: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.gst_applicable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gst_applicable: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      GST Applicable
                    </label>
                  </div>
                  {formData.gst_applicable && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST Rate (%)
                        </label>
                        <input
                          type="number"
                          value={formData.gst_rate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gst_rate: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST Amount
                        </label>
                        <input
                          type="number"
                          value={formData.gst_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gst_amount: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg p-2"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Party Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Party Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Type
                  </label>
                  <select
                    value={formData.party_type}
                    onChange={(e) =>
                      setFormData({ ...formData, party_type: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select Party Type</option>
                    {partyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name
                  </label>
                  <input
                    type="text"
                    value={formData.party_name}
                    onChange={(e) =>
                      setFormData({ ...formData, party_name: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Narration
                </label>
                <textarea
                  value={formData.narration}
                  onChange={(e) =>
                    setFormData({ ...formData, narration: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  rows="3"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                // onClick={handleSubmit}
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {initialData ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default AddTransactionModal;
