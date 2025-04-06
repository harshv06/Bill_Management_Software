import React from 'react';
import { FaPlus, FaFileDownload } from 'react-icons/fa';

const DayBookHeader = ({ 
  user, 
  onAddTransaction, 
  onExportToExcel, 
  hasTransactions 
}) => {
  return (
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
            onClick={() => onAddTransaction()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <FaPlus className="mr-2" /> Add Transaction
          </button>
        )}

        <button
          onClick={onExportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
          disabled={!hasTransactions}
        >
          <FaFileDownload className="mr-2" /> Export
        </button>
      </div>
    </div>
  );
};

export default DayBookHeader;