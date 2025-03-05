import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaDownload, FaFilter, FaSearch } from "react-icons/fa";
import axios from "axios";
import Sidebar from "./Sidebar";
import Config from "../utils/GlobalConfig";
import GenerateInvoiceModal from "./Modals/InvoiceModals/GenerateInvoiceModal";
import InvoiceDetailsModal from "./Modals/InvoiceModals/ViewInvoiceDetailsModal";
import { useLocation, useNavigate } from "react-router-dom";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] =
    useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceDetailsModalOpen, setIsInvoiceDetailsModalOpen] =
    useState(false);

  // Filtering and Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const location = useLocation();
  const navigate = useNavigate();

  const filterInvoices = (allInvoices, status) => {
    if (status === "all") {
      return allInvoices;
    }
    return allInvoices.filter(
      (invoice) => invoice.status.toLowerCase() === status.toLowerCase()
    );
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
    const fetchInvoices = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${Config.API_BASE_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allInvoices = response.data.data.invoices || [];
        setInvoices(allInvoices);

        // Apply initial filtering
        const filtered = filterInvoices(allInvoices, statusFilter);
        setFilteredInvoices(filtered);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch invoices");
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    const filtered = filterInvoices(invoices, statusFilter);
    setFilteredInvoices(filtered);
  }, [statusFilter, invoices]);

  const renderInvoiceStatus = (status) => {
    const statusColors = {
      draft: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const addInvoiceToDB = (products, invoiceDetails) => {
    console.log(products, invoiceDetails);
    // Implement invoice creation logic
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/invoices/${invoiceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
      // Open a modal or navigate to invoice details page
      setSelectedInvoice(response.data.data);
      setIsInvoiceDetailsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch invoice details", error);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/invoices/${invoiceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Failed to download invoice", error);
    }
  };
  const handleInvoiceUpdate = async (updatedInvoice) => {
    const updatedInvoices = invoices.map((invoice) =>
      invoice.invoice_id === updatedInvoice.invoice_id
        ? updatedInvoice
        : invoice
    );
    setInvoices(updatedInvoices);
    setFilteredInvoices(updatedInvoices);
  };

  const FilterSection = () => {
    const filterButtons = [
      { status: "all", label: "All", color: "blue" },
      { status: "pending", label: "Pending", color: "yellow" },
      { status: "paid", label: "Paid", color: "green" },
      { status: "cancelled", label: "Cancelled", color: "red" },
    ];

    return (
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {filterButtons.map(({ status, label, color }) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === status
                  ? `bg-${color}-500 text-white`
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleFilterChange(status)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    const filtered = filterInvoices(invoices, status);
    setFilteredInvoices(filtered);
    navigate(`/invoices${status === "all" ? "" : `?status=${status}`}`);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
        </div>

        <FilterSection />

        {/* Invoices Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No invoices found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.invoice_id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{invoice.grand_total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderInvoiceStatus(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.invoice_id)}
                          className="text-blue-500 hover:text-blue-700 transition flex items-center"
                          title="View Invoice"
                        >
                          <FaEye className="mr-1" /> View
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadInvoice(invoice.invoice_id)
                          }
                          className="text-green-500 hover:text-green-700 transition flex items-center"
                          title="Download Invoice"
                        >
                          <FaDownload className="mr-1" /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isInvoiceDetailsModalOpen && selectedInvoice && (
          <InvoiceDetailsModal
            isOpen={isInvoiceDetailsModalOpen}
            onClose={() => setIsInvoiceDetailsModalOpen(false)}
            invoice={selectedInvoice}
            onDownload={() => handleDownloadInvoice(selectedInvoice.invoice_id)}
            onUpdate={handleInvoiceUpdate}
          />
        )}

        {/* Invoice Generation Modal */}
        {isGenerateInvoiceModalOpen && (
          <GenerateInvoiceModal
            addDataToDB={addInvoiceToDB}
            onClose={() => setIsGenerateInvoiceModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
