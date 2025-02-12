import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoImage from "../assets/LetterHead.png"; // Import your logo
import Sidebar from "./Sidebar";
import Config from "../utils/GlobalConfig";
import axios from "axios";
import GenerateInvoiceModal from "./Modals/InvoiceModals/GenerateInvoiceModal";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] =
    useState(false);

  const addInvoiceToDB = (products, invoiceDetails) => {
    console.log(products, invoiceDetails);
  };

  // useEffect(() => {
  //   const fetchInvoices = async () => {
  //     try {
  //       const response = await axios.get(`${Config.API_BASE_URL}/invoices`);
  //       setInvoices(response.data.invoices);
  //       setLoading(false);
  //     } catch (error) {
  //       setError("Failed to fetch invoices");
  //       setLoading(false);
  //     }
  //   };

  //   fetchInvoices();
  // }, []);

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

  // if (loading) return <div>Loading invoices...</div>;
  // if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <button
          onClick={() => setIsGenerateInvoiceModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Generate Invoice
        </button>
        <h1 className="text-2xl font-bold mb-6">Invoice List</h1>
        <div className="bg-white shadow-md rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Invoice Number</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Bill Date</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="border-b">
                  <td className="px-4 py-2">{invoice.bill_number}</td>
                  <td className="px-4 py-2">{invoice.customer_name}</td>
                  <td className="px-4 py-2">
                    {new Date(invoice.bill_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    ₹{invoice.grand_total.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {renderInvoiceStatus(invoice.status)}
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-500 mr-2">View</button>
                    <button className="text-green-500">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
