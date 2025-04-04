import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../utils/GlobalConfig";
import Sidebar from "../components/Sidebar";
import InvoiceDetailsModal from "../components/Modals/InvoiceModals/PurchaseInvoiceDetailsModal";
import { generatePurchaseInvoicePDF } from "../utils/PurchaseInvoicePdfGenerator";
import { useAuth } from "@/context/authContext";
import SearchBar from "../components/SearchBar/InvoiceSearchBar";
import { toast } from "react-toastify";

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [deletingInvoice, setDeletingInvoice] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const onUpdate = () => {
    fetchPurchaseInvoices();
  };

  const handleSearch = (searchTerm) => {
    setIsSearching(!!searchTerm);
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const results = filteredInvoices.filter((invoice) =>
      invoice.invoice_number.toUpperCase().includes(searchTerm)
    );
    setSearchResults(results);
  };

  useEffect(() => {
    // Get status from URL query params
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location]);

  useEffect(() => {
    fetchPurchaseInvoices();
  }, [pagination.currentPage, statusFilter]);

  const fetchPurchaseInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/PurchaseInvoices`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pagination.currentPage,
            limit: pagination.limit,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        }
      );

      setInvoices(response.data.data.invoices || []);
      filterInvoices(response.data.data.invoices || [], statusFilter);
      setPagination((prev) => ({
        ...prev,
        ...response.data.data.pagination,
      }));
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch purchase invoices");
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleViewInvoice = (invoice, event) => {
    // If an event is passed, prevent any default behavior
    if (event) {
      event.stopPropagation();
    }
    setSelectedInvoice(invoice);
  };

  const handleDownloadPDF = (invoice, event) => {
    event.stopPropagation(); // Prevent modal from opening
    generatePurchaseInvoicePDF(invoice);
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  // Add this function to handle filtering
  const filterInvoices = (invoices, status) => {
    if (status === "all") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter((invoice) => invoice.status.toLowerCase() === status)
      );
    }
  };

  const FilterSection = () => (
    <div className="mb-6 flex justify-between items-center">
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg ${
            statusFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            statusFilter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleFilterChange("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            statusFilter === "paid"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleFilterChange("paid")}
        >
          Paid
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            statusFilter === "cancelled"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleFilterChange("cancelled")}
        >
          Cancelled
        </button>
      </div>
    </div>
  );

  // Add this function to handle filter changes
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    filterInvoices(invoices, status);
    navigate(
      `/purchase-invoices${status === "all" ? "" : `?status=${status}`}`
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleNewInvoiceShortcut = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault(); // Prevent default browser behavior
        if (user.permissions.includes("purchase_invoices:create")) {
          navigate("/purchase-invoices/new");
        } else {
          toast.error("You don't have permission to create invoices");
        }
      }
    },
    [navigate, user.permissions]
  );

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    window.addEventListener("keydown", handleNewInvoiceShortcut);
    return () => {
      window.removeEventListener("keydown", handleNewInvoiceShortcut);
    };
  }, [handleNewInvoiceShortcut]);

  const PaginationControls = () => {
    return (
      <div className="flex justify-between items-center mt-4 mb-4 px-4">
        <div className="text-sm text-gray-600">
          Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
          {Math.min(
            pagination.currentPage * pagination.limit,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded ${
                pagination.currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
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

      const daybookResponse = await axios.get(
        `${config.API_BASE_URL}/daybook/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const matchingTransaction = daybookResponse.data.data.find(
        (transaction) =>
          transaction.reference_number === invoice.invoice_number.toString()
      );
      // Delete invoice
      await axios.delete(
        `${config.API_BASE_URL}/purchase-invoices/${invoice.purchase_invoice_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (matchingTransaction) {
        await axios.delete(
          `${config.API_BASE_URL}/daybook/transactions/${matchingTransaction.transaction_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Refresh the invoices list
      fetchPurchaseInvoices();

      // Show success message
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    } finally {
      setDeletingInvoice(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Purchase Invoices
          </h1>
          <span className="text-xs text-gray-500">
            Press Ctrl+G to create new invoice
          </span>
          {user.permissions.includes("purchase_invoices:create") && (
            <Link
              to="/purchase-invoices/new"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create New Purchase Invoice
            </Link>
          )}
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        <FilterSection />
        <PaginationControls />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(isSearching ? searchResults : filteredInvoices).map(
                  (invoice) => (
                    <tr
                      key={invoice.purchase_invoice_id}
                      onClick={() => handleViewInvoice(invoice)}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.vendor_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <div>
                            ₹
                            {Number(invoice.total_amount).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            GST: ₹
                            {Number(invoice.total_gst).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleViewInvoice(invoice, e);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View
                          </button>

                          <button
                            onClick={(e) => handleDownloadPDF(invoice, e)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            PDF
                          </button>

                          {/* Add Delete Button */}
                          {user.permissions.includes(
                            "purchase_invoices:delete"
                          ) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInvoice(invoice);
                              }}
                              disabled={deletingInvoice === invoice}
                              className={`text-red-600 hover:text-red-900 text-sm font-medium ${
                                deletingInvoice === invoice
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {deletingInvoice === invoice
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No purchase invoices found
              </div>
            )}
          </div>
        )}

        {selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={handleCloseModal}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoices;
