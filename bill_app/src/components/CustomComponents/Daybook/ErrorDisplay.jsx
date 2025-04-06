import React from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

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

export default ErrorDisplay;