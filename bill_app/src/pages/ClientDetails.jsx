// pages/ClientDetails.js
import React, { useEffect, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
// import AddPaymentModal from "../components/Modals/AddPaymentModal";
import PaymentHistorySection from "../components/Payment/PaymentHistorySection";
import AddCompanyPaymentModal from "../components/Modals/AddCompanyPaymentModal";
import Config from "../utils/GlobalConfig";
import InvoiceList from "../components/Modals/InvoiceList";

const ClientDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company } = location.state || {};
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    paymentMethod: "",
  });

  const [total_revenue, setTotalRevenue] = useState(0);

  const API_BASE_URL = "http://192.168.0.106:5000/api";

  useEffect(() => {
    if (!company) {
      navigate("/clients");
      return;
    }

    fetchPaymentHistory();
  }, [company, navigate, filters, currentPage]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { payment_method: filters.paymentMethod }),
      });

      const response = await fetch(
        `${Config.API_BASE_URL}/getPaymentHistory/${company.company_id}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }

      const data = await response.json();

      if (data.status === "success") {
        setPaymentHistory(data.data.payments.reverse());
        setTotalPages(data.data.pagination.totalPages);
        setSummary(data.data.summary);
        setTotalRevenue(data.data.summary.totalAmount);
        console.log("Data: ", data.data);
      } else {
        throw new Error(data.message || "Failed to fetch payment history");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payment) => {
    try {
      if (!window.confirm("Are you sure you want to delete this payment?")) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/deletePayment/${payment.payment_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Refresh payment history
        fetchPaymentHistory();
      } else {
        throw new Error(data.message || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert(error.message);
    }
  };

  // Handle edit payment
  const handleEdit = async (paymentId, updatedData) => {
    try {
      console.log(updatedData);
      const response = await fetch(
        `${API_BASE_URL}/updatePaymentDetails/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Refresh payment history
        fetchPaymentHistory();
      } else {
        throw new Error(data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert(error.message);
    }
  };

  // Handle view receipt
  const handleViewReceipt = async (payment) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/generateReceipt/${payment.payment_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate receipt");
      }

      // Assuming the response is a PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Open in new window
      window.open(url, "_blank");

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert(error.message);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const DetailRow = ({ label, value }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <p className="text-base font-semibold text-gray-900">{value || "N/A"}</p>
    </div>
  );

  if (!company) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/clients")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Back to Clients</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            {/* Company Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Basic Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow
                        label="Company Name"
                        value={company.company_name}
                      />
                      <DetailRow
                        label="Client Type"
                        value={company.client_type.replace("_", " ")}
                      />
                      <DetailRow label="Status" value={company.status} />
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                        />
                      </svg>
                      Tax Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow
                        label="GST Number"
                        value={company.gst_number}
                      />
                      <DetailRow
                        label="PAN Number"
                        value={company.pan_number}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Email" value={company.email} />
                      <DetailRow label="Phone" value={company.phone} />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Financial Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow
                        label="Total Revenue"
                        value={`₹ ${total_revenue.toLocaleString()}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 mt-6 pt-6 px-6 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address Information
                </h2>
                <p className="text-gray-700">
                  {company.address || "No address provided"}
                </p>
              </div>
            </div>

            {/* Invoice List Section */}
            <InvoiceList companyId={company.company_id} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Payment Modal Component

export default ClientDetails;
