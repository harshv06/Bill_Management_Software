import React from 'react';

const PaginationControls = ({ 
  pagination, 
  onPageChange 
}) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-4 space-x-4">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.hasPrevPage}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          max={pagination.totalPages}
          value={pagination.page}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            onPageChange(page);
          }}
          className="w-16 text-center border rounded px-2 py-1"
        />
        <span>of {pagination.totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.hasNextPage}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>

      <div className="text-gray-600">
        Total: {pagination.totalCount} transactions
      </div>
    </div>
  );
};

export default PaginationControls;