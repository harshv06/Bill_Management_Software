import React from "react";
import DatePicker from "react-datepicker";

const TransactionLeftSidebar = ({
  formData,
  setFormData,
  accountHeads,
  bankAccounts,
  handleBankAccountSelect,
  selectedBankAccount,
}) => {
  return (
    <div className="w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Voucher Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Voucher Type
          </label>
          <select
            disabled={
              formData.sub_group === "INVOICE" ||
              formData.sub_group === "PURCHASE"
            }
            value={formData.voucher_type}
            onChange={(e) =>
              setFormData({ ...formData, voucher_type: e.target.value })
            }
            className="w-full border rounded p-2 text-xs"
          >
            <option value="">Select Voucher Type</option>
            {formData.voucherTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Date
          </label>
          <DatePicker
            selected={formData.transaction_date}
            onChange={(date) =>
              setFormData({ ...formData, transaction_date: date })
            }
            className="w-full border rounded p-2 text-xs"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {/* Account Head */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Account Head
          </label>
          <select
            value={formData.account_head}
            onChange={(e) =>
              setFormData({ ...formData, account_head: e.target.value })
            }
            className="w-full border rounded p-2 text-xs"
          >
            <option value="">Select Account Head</option>
            {accountHeads.map((head) => (
              <option key={head} value={head}>
                {head}
              </option>
            ))}
          </select>
        </div>

        {/* Bank Accounts Section */}
        {formData.account_head === "Expenses" && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Select Bank Account
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {bankAccounts.map((account) => (
                <div
                  key={account.account_id}
                  onClick={() => handleBankAccountSelect(account.account_id)}
                  className={`
                    border rounded p-2 cursor-pointer transition-all
                    ${
                      selectedBankAccount?.account_id === account.account_id ||
                      formData.bank_account_id === account.account_id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  {/* Bank Account Details */}
                  <div className="flex justify-between items-center">
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
          </div>
        )}

        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Transaction Type
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, transaction_type: "CREDIT" })
              }
              className={`w-1/2 p-2 text-xs rounded ${
                formData.transaction_type === "CREDIT"
                  ? "bg-green-500 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              Credit
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, transaction_type: "DEBIT" })
              }
              className={`w-1/2 p-2 text-xs rounded ${
                formData.transaction_type === "DEBIT"
                  ? "bg-red-500 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              Debit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionLeftSidebar;
