import { useState } from "react";
import PaymentHistoryTable from "./PaymentHistoryTable";
import EditCompanyPaymentModal from "../Modals/EditCompanyPaymentModal";
import jsPDF from "jspdf";
const PaymentHistorySection = ({
  payments,
  loading,
  error,
  currentPage,
  totalPages,
  filters,
  onFilterChange,
  onPageChange,
  onDelete,
  onEdit,
  onViewReceipt,
}) => {
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    payment: null,
  });

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payment History Report", 20, 20);

    doc.setFontSize(12);
    let yPosition = 40;

    payments.forEach((payment, index) => {
      doc.text(`Receipt No: ${payment.receipt_number}`, 20, yPosition);
      doc.text(
        `Date: ${new Date(payment.payment_date).toLocaleDateString()}`,
        20,
        yPosition + 10
      );
      doc.text(
        `Amount: $${parseFloat(payment.amount).toFixed(2)}`,
        20,
        yPosition + 20
      );
      doc.text(`Method: ${payment.payment_method}`, 20, yPosition + 30);
      doc.text(`Mode: ${payment.payment_mode}`, 20, yPosition + 40);
      doc.text(`Status: ${payment.status}`, 20, yPosition + 50);
      doc.text(`Notes: ${payment.notes || "N/A"}`, 20, yPosition + 60);

      yPosition += 80;

      if (yPosition > 270) {
        // Check if we need a new page
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save("Payment_History_Report.pdf");
  };

  const handleEdit = async (paymentId, updatedData) => {
    await onEdit(paymentId, updatedData);
    setEditModalData({ isOpen: false, payment: null });
  };

  const FilterSection = () => (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange("startDate", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange("endDate", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          value={filters.paymentMethod}
          onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="upi">UPI</option>
          <option value="cheque">Cheque</option>
        </select>
      </div>

      <div className="col-span-2 justify-self-end">
        <label className="block text-sm font-medium text-gray-700">
          Generate Report
        </label>
        <button
          onClick={generateReport}
          className="mt-1 block w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600"
        >
          Generate PDF
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <FilterSection />
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4 bg-red-50 rounded-md">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-md">
            No payment history available
          </div>
        ) : (
          <>
            <PaymentHistoryTable
              payments={payments}
              onDelete={onDelete}
              onEdit={(payment) => setEditModalData({ isOpen: true, payment })}
              onViewReceipt={onViewReceipt}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => onPageChange(idx + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === idx + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      onPageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editModalData.isOpen && (
        <EditCompanyPaymentModal
          isOpen={editModalData.isOpen}
          onClose={() => setEditModalData({ isOpen: false, payment: null })}
          payment={editModalData.payment}
          onSave={handleEdit}
        />
      )}
    </div>
  );
};

export default PaymentHistorySection;
