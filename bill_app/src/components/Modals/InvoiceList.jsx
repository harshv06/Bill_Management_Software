import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../utils/GlobalConfig";
import GenerateInvoiceModal from "../Modals/InvoiceModals/GenerateInvoiceModal";
import { toast } from "react-toastify";

const InvoiceList = ({ companyId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] =
    useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingInvoice, setDeletingInvoice] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
  });

  useEffect(() => {
    fetchInvoices();
  }, [companyId, currentPage, filters, pageSize]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await axios.get(`${Config.API_BASE_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          companyId: companyId || undefined,
          page: currentPage,
          limit: pageSize,
          status: filters.status || undefined,
        },
      });

      const { invoices, pagination } = response.data.data;
      setInvoices(invoices);
      setTotalPages(pagination.totalPages);
      setCurrentPage(pagination.currentPage);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to fetch invoices");
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${Config.API_BASE_URL}/invoices/${invoiceId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh invoices
      fetchInvoices();
      toast.success("Invoice status updated successfully");
    } catch (error) {
      console.error("Failed to update invoice status", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem("token");

      // Confirm deletion
      const confirmDelete = window.confirm(
        `Are you sure you want to delete invoice ${invoice.invoice_number}?`
      );

      if (!confirmDelete) return;

      // Set the invoice being deleted
      setDeletingInvoice(invoice);

      // Fetch daybook transactions
      const daybookResponse = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Find matching transaction
      const matchingTransaction = daybookResponse.data.data.find(
        (transaction) =>
          transaction.reference_number === invoice.invoice_number.toString()
      );

      // Delete invoice
      await axios.delete(
        `${Config.API_BASE_URL}/invoices/${invoice.invoice_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Delete matching daybook transaction if found
      if (matchingTransaction) {
        await axios.delete(
          `${Config.API_BASE_URL}/daybook/transactions/${matchingTransaction.transaction_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Refresh invoices
      fetchInvoices();

      toast.success(
        "Invoice and related daybook transaction deleted successfully"
      );
    } catch (error) {
      console.error("Failed to delete invoice", error);
      toast.error("Failed to delete invoice");
    } finally {
      // Reset deleting invoice state
      setDeletingInvoice(null);
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const PaginationComponent = () => {
    // Calculate page range
    const pageRange = 5; // Number of page buttons to show
    const halfRange = Math.floor(pageRange / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + pageRange - 1);

    // Adjust if we're near the start or end
    if (endPage - startPage + 1 < pageRange) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, pageRange);
      } else {
        startPage = Math.max(1, totalPages - pageRange + 1);
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-between items-center mt-4">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-2">
          {/* First Page */}
          {startPage > 1 && (
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 border rounded"
            >
              «
            </button>
          )}

          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 border rounded ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500"
              }`}
            >
              {number}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

          {/* Last Page */}
          {endPage < totalPages && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 border rounded"
            >
              »
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <button
            onClick={() => setIsGenerateInvoiceModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex space-x-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="border rounded px-2 py-1"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-4">
            <span className="loading-spinner">Loading...</span>
          </div>
        )}

        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {/* Invoice Table */}
        {!loading && !error && (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left">Invoice Number</th>
                  <th className="px-4 py-3 text-left">Total Amount</th>
                  <th className="px-4 py-3 text-left">Invoice Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoice_id} className="border-b">
                    <td className="px-4 py-3">{invoice.invoice_number}</td>
                    <td className="px-4 py-3">
                      ₹{invoice.grand_total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      <select
                        value={invoice.status}
                        disabled={invoice.status === "paid"} // Disable if already paid
                        onChange={(e) =>
                          handleStatusUpdate(invoice.invoice_id, e.target.value)
                        }
                        className="border rounded px-2 py-1 mr-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteInvoice(invoice)}
                        disabled={invoice.status === "paid"} // Disable if already paid
                        className="text-red-500 hover:text-red-700"
                        title="Delete Invoice"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && <PaginationComponent />}
          </>
        )}

        {/* Generate Invoice Modal */}
        {isGenerateInvoiceModalOpen && (
          <GenerateInvoiceModal
            onClose={() => setIsGenerateInvoiceModalOpen(false)}
            companyId={companyId}
            onInvoiceCreated={fetchInvoices}
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
