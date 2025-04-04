import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../utils/GlobalConfig";
import Sidebar from "../components/Sidebar";

const GSTReportPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [gstReport, setGstReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const fetchGSTReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/gst-report/current-Month`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        }
      );
      console.log("GST Report Response:", response.data);
      setGstReport(response.data);
    } catch (error) {
      console.error("Failed to fetch GST report", error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGSTReport();
  }, [selectedMonth, selectedYear]);

  const renderGSTSummary = () => {
    if (!gstReport) return null;

    const { summary } = gstReport;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 5a.5.5 0 11-1 0 .5.5 0 011 0z"
              />
            </svg>
            <h3 className="font-bold text-blue-700">Sales GST</h3>
          </div>
          <p>Total Amount: ₹{summary.sales.total_amount}</p>
          <p>SGST: ₹{summary.sales.total_sgst}</p>
          <p>CGST: ₹{summary.sales.total_cgst}</p>
          <p>Invoices: {summary.sales.total_invoices}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            <h3 className="font-bold text-green-700">Purchase GST</h3>
          </div>
          <p>Total Amount: ₹{summary.purchases.total_amount}</p>
          <p>SGST: ₹{summary.purchases.total_sgst}</p>
          <p>CGST: ₹{summary.purchases.total_cgst}</p>
          <p>Invoices: {summary.purchases.total_invoices}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-bold text-yellow-700">Net GST</h3>
          </div>
          <p>GST Payable: ₹{summary.net_gst.payable}</p>
          <p>GST Receivable: ₹{summary.net_gst.receivable}</p>
        </div>
      </div>
    );
  };

  const renderDetailedInvoices = () => {
    if (!gstReport) return null;

    const { sales_invoices, purchase_invoices } = gstReport;

    const InvoiceTable = ({ invoices, type }) => {
      console.log("Invoices:", invoices);
      return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Vendor
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST No
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SGST
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CGST
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No {type} invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr
                    key={invoice.invoice_id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-700">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-blue-600 font-medium">
                      {invoice.invoice_number}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {type === "sales"
                        ? invoice.customer_name
                        : invoice.vendor_name}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {type === "sales"
                        ? invoice.customer_gst
                        : invoice.vendor_gst}
                    </td>
                    <td className="p-3 text-sm text-right text-gray-700">
                      ₹{Number(invoice.total_amount).toFixed(2)}
                    </td>
                    <td className="p-3 text-sm text-right text-green-600">
                      ₹
                      {Number(
                        type === "sales"
                          ? invoice.sgst_amount
                          : invoice.total_gst / 2
                      ).toFixed(2)}
                    </td>
                    <td className="p-3 text-sm text-right text-green-600">
                      ₹
                      {Number(
                        type === "sales"
                          ? invoice.cgst_amount
                          : invoice.total_gst / 2
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td
                  colSpan="4"
                  className="p-3 text-right font-bold text-gray-700"
                >
                  Total
                </td>
                <td className="p-3 text-right font-bold text-gray-700">
                  ₹
                  {invoices
                    .reduce((sum, inv) => sum + Number(inv.total_amount), 0)
                    .toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-green-600">
                  ₹
                  {invoices
                    .reduce((sum, inv) => sum + Number(type==="sales"?inv.sgst_amount:inv.total_gst/2), 0)
                    .toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-green-600">
                  ₹
                  {invoices
                    .reduce((sum, inv) => sum + Number(type==="sales"?inv.cgst_amount:inv.total_gst/2), 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 5a.5.5 0 11-1 0 .5.5 0 011 0z"
              />
            </svg>
            Sales Invoices
          </h3>
          <InvoiceTable invoices={sales_invoices} type="sales" />
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            Purchase Invoices
          </h3>
          <InvoiceTable invoices={purchase_invoices} type="purchase" />
        </div>

        {/* Optional: Pagination or Load More functionality */}
        {(sales_invoices.length > 10 || purchase_invoices.length > 10) && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              // Add pagination logic
            >
              Load More
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 5a.5.5 0 11-1 0 .5.5 0 011 0z"
              />
            </svg>
            GST Report
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border rounded"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            <button
              onClick={fetchGSTReport}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 border-b-2 ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              GST Summary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 border-b-2 ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Detailed Invoices
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {activeTab === "summary" && renderGSTSummary()}
            {activeTab === "details" && renderDetailedInvoices()}
          </>
        )}
      </div>
    </div>
  );
};

export default GSTReportPage;
