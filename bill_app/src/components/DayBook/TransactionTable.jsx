import React, { useState } from "react";
import { format } from "date-fns";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TransactionTable = ({
  transactions,
  loading,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [expandedTexts, setExpandedTexts] = useState({});

  const toggleTextExpansion = (field, text) => {
    setExpandedTexts(prev => ({
      ...prev,
      [field]: prev[field] === text ? null : text
    }));
  };

  const renderTruncatedText = (text, field, maxLength = 20) => {
    if (!text) return '';

    const isExpanded = expandedTexts[field] === text;

    if (text.length <= maxLength) {
      return <span>{text}</span>;
    }

    return (
      <div 
        className="cursor-pointer flex items-center"
        onClick={() => toggleTextExpansion(field, text)}
      >
        <span className={isExpanded ? '' : 'line-clamp-2'}>
          {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        </span>
        {!isExpanded && (
          <FaEye 
            className="ml-2 text-blue-500 hover:text-blue-700" 
            title="View full text"
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Balance
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.transaction_id}>
              <td className="px-4 py-4 whitespace-nowrap w-24">
                {format(new Date(transaction.transaction_date), "yyyy-MM-dd")}
              </td>
              <td className="px-4 py-4 w-48">
                <div className="break-words">
                  {renderTruncatedText(
                    transaction.description, 
                    `description_${transaction.transaction_id}`, 
                    30
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                {renderTruncatedText(
                  transaction.category, 
                  `category_${transaction.transaction_id}`
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                {renderTruncatedText(
                  transaction.reference_number, 
                  `reference_${transaction.transaction_id}`
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-24">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.transaction_type === "CREDIT"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.transaction_type}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                <span
                  className={
                    transaction.transaction_type === "CREDIT"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  ₹{transaction.amount.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                ₹{transaction.balance.toLocaleString()}
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-24">
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => {
                      console.log(transaction);
                      onEdit(transaction);
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    disabled = {transaction.reference_number.includes("INV") || transaction.reference_number.includes("PI")}
                    onClick={() => onDelete(transaction.transaction_id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;