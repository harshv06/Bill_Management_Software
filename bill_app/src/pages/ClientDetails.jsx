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

  if (!company) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/clients")}
              className="text-blue-500 hover:text-blue-700 flex items-center"
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
              Back to Clients
            </button>
            <h1 className="text-2xl font-bold">Client Details</h1>
          </div>
          {/* <button
            onClick={() => setIsAddPaymentModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Invoice
          </button> */}
        </div>

        {/* Company Information Card */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Company Information</h2>
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Company Name
                </label>
                <p className="text-lg font-semibold">{company.company_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  GST Number
                </label>
                <p className="text-lg">{company.gst_number || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  PAN Number
                </label>
                <p className="text-lg">{company.pan_number || "N/A"}</p>
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <p className="text-lg">{company.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <p className="text-lg">{company.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Client Type
                </label>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 capitalize">
                  {company.client_type.replace("_", " ")}
                </span>
              </div>

              {/* Revenue */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Total Revenue
                </label>
                <p className="text-2xl font-bold text-green-600">
                  ₹{total_revenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Full Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Address
              </label>
              <p className="text-lg">
                {company.address || "No address provided"}
              </p>
            </div>
          </div>
        </div>

        <InvoiceList companyId={company.company_id} />

        {/* Payment History Card */}
        {/* <PaymentHistorySection
          payments={paymentHistory}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onViewReceipt={handleViewReceipt}
        /> */}

        {/* Add Payment Modal */}
        {/* {isAddPaymentModalOpen && (
          <AddCompanyPaymentModal
            isOpen={isAddPaymentModalOpen}
            onClose={() => setIsAddPaymentModalOpen(false)}
            companyId={company.company_id}
            onPaymentAdded={fetchPaymentHistory}
          />
        )} */}
      </div>
    </div>
  );
};

// Add Payment Modal Component

export default ClientDetails;
