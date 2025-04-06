import React from "react";
import { FaChartLine, FaPlus } from "react-icons/fa";

const EmptyState = ({ onAddTransaction }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
    <FaChartLine className="text-gray-400 text-4xl mb-4" />
    <p className="text-gray-500 mb-4">
      No transactions found for the selected period
    </p>
    <button
      onClick={onAddTransaction}
      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      <FaPlus className="mr-2" /> Add First Transaction
    </button>
  </div>
);

export default EmptyState;
