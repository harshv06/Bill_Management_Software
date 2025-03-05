// components/PurchaseInvoices/InvoiceDetailsModal.jsx
import React, { useState } from "react";
import axios from "axios";
import config from '../../../utils/GlobalConfig'
const InvoiceDetailsModal = ({ invoice, onClose,onUpdate }) => {
  const [status, setStatus] = useState(invoice.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleDownloadPDF = () => {
    generatePurchaseInvoicePDF(invoice);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.patch(
        `${config.API_BASE_URL}/purchase-invoices/${invoice.purchase_invoice_id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Call the onUpdate callback to refresh the parent component
      if (onUpdate) {
        onUpdate();
      }

      // Show success message
      alert("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update invoice status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!invoice) return null;
  const hasChanges = status !== invoice.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Status Change Section */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Current Status:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusChange("pending")}
                  className={`px-4 py-2 rounded-md ${
                    status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange("paid")}
                  className={`px-4 py-2 rounded-md ${
                    status === "paid"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  className={`px-4 py-2 rounded-md ${
                    status === "cancelled"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Invoice Header Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Invoice Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Invoice Number:</span>{" "}
                  {invoice.invoice_number}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(invoice.invoice_date).toLocaleDateString("en-IN")}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {invoice.vendor_name}
                </p>
                {invoice.vendor_address && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {invoice.vendor_address}
                  </p>
                )}
                {invoice.vendor_gst && (
                  <p>
                    <span className="font-medium">GST:</span>{" "}
                    {invoice.vendor_gst}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      GST Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      GST Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={item.item_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(item.rate).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.gst_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(item.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(item.gst_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>₹{Number(invoice.subtotal).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total GST:</span>
                <span>
                  ₹{Number(invoice.total_gst).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>
                  ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
