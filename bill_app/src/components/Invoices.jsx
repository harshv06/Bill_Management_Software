import React, { useEffect, useState } from "react";
import { 
  FaPlus, 
  FaEye, 
  FaDownload, 
  FaFilter, 
  FaSearch 
} from 'react-icons/fa';
import axios from "axios";
import Sidebar from "./Sidebar";
import Config from "../utils/GlobalConfig";
import GenerateInvoiceModal from "./Modals/InvoiceModals/GenerateInvoiceModal";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false);
  
  // Filtering and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${Config.API_BASE_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInvoices(response.data.data.invoices);
        setFilteredInvoices(response.data.data.invoices);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch invoices");
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter and Search Logic
  useEffect(() => {
    let result = invoices;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(result);
  }, [searchTerm, statusFilter, invoices]);

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

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
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
          {/* <button
            onClick={() => setIsGenerateInvoiceModalOpen(true)}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <FaPlus className="mr-2" /> Generate Invoice
          </button> */}
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.invoice_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.customer_name}</td>
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
                          className="text-blue-500 hover:text-blue-700 transition flex items-center"
                          title="View Invoice"
                        >
                          <FaEye className="mr-1" /> View
                        </button>
                        <button 
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