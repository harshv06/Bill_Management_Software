import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../utils/GlobalConfig";
import Sidebar from "../components/Sidebar";

const TDSReportPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tdsReport, setTDSReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const fetchTDSReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/TDS/tds-report/current-month`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        }
      );
      console.log("TDS Report Response:", response.data);
      setTDSReport(response.data);
    } catch (error) {
      console.error("Failed to fetch TDS report", error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTDSReport();
  }, [selectedMonth, selectedYear]);

  const renderTDSSummary = () => {
    if (!tdsReport) return null;

    const { summary } = tdsReport;

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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-bold text-blue-700">TDS Summary</h3>
          </div>
          <p>Total TDS Collected: ₹{summary.total_tds_collected}</p>
          <p>Total Invoices: {summary.total_invoices}</p>
          {/* <p>Pending Deposit: ₹{summary.pending_deposit}</p>
          <p>Deposited: ₹{summary.deposited}</p> */}
        </div>
        {/* <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-md">
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
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 5a.5.5 0 11-1 0 .5.5 0 011 0z"
              />
            </svg>
            <h3 className="font-bold text-green-700">TDS by Section</h3>
            {Object.entries(summary.tds_by_section).map(
              ([section, details]) => (
                <div key={section} className="mt-2">
                  <p>
                    {section}: ₹{details.amount} ({details.count} invoices)
                  </p>
                </div>
              )
            )}
          </div>
        </div> */}
        {/* <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-md">
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
            <h3 className="font-bold text-yellow-700">TDS Status</h3>
            <p>Collected: {summary.status.collected}%</p>
            <p>Deposited: {summary.status.deposited}%</p>
            <p>Pending: {summary.status.pending}%</p>
          </div>
        </div> */}
      </div>
    );
  };

  const renderDetailedTDSRecords = () => {
    if (!tdsReport) return null;

    const { tds_records } = tdsReport;

    const TDSRecordTable = () => {
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
                  Party Name
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TDS Rate
                </th>
                <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TDS Amount
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tds_records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No TDS records found
                  </td>
                </tr>
              ) : (
                tds_records.map((record, index) => {
                  // Calculate total amount based on TDS amount and rate
                  const totalAmount = record.tds_amount
                    ? (
                        Number(record.tds_amount) /
                        (Number(record.tds_rate) / 100)
                      ).toFixed(2)
                    : "0.00";

                  return (
                    <tr
                      key={record.tds_record_id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(record.payment_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm text-blue-600 font-medium">
                        {record.invoice_number}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {record.company.company_name}
                      </td>
                      <td className="p-3 text-sm text-right text-gray-700">
                        ₹{totalAmount}
                      </td>
                      <td className="p-3 text-sm text-right text-gray-700">
                        {record.tds_rate}%
                      </td>
                      <td className="p-3 text-sm text-right text-green-600">
                        ₹{Number(record.tds_amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            record.payment_status === "DEPOSITED"
                              ? "bg-green-100 text-green-800"
                              : record.payment_status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {record.payment_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td
                  colSpan="3"
                  className="p-3 text-right font-bold text-gray-700"
                >
                  Total
                </td>
                <td className="p-3 text-right font-bold text-gray-700">
                  ₹
                  {tds_records
                    .reduce((sum, record) => {
                      const totalAmount = record.tds_amount
                        ? Number(record.tds_amount) /
                          (Number(record.tds_rate) / 100)
                        : 0;
                      return sum + totalAmount;
                    }, 0)
                    .toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-gray-700">-</td>
                <td className="p-3 text-right font-bold text-green-600">
                  ₹
                  {tds_records
                    .reduce((sum, record) => sum + Number(record.tds_amount), 0)
                    .toFixed(2)}
                </td>
                <td></td>
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
            TDS Records
          </h3>
          <TDSRecordTable />
        </div>
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
            TDS Report
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
              onClick={fetchTDSReport}
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
              TDS Summary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 border-b-2 ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Detailed TDS Records
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
                d="M4 12a8 8 0 018-8V0C5.373 0 5.373 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {activeTab === "summary" && renderTDSSummary()}
            {activeTab === "details" && renderDetailedTDSRecords()}
          </>
        )}
      </div>
    </div>
  );
};

export default TDSReportPage;
