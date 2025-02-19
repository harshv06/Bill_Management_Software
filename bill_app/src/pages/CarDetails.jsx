// pages/CarDetails.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AddCompanyPaymentModal from "../components/Modals/AddCompanyPaymentModal";
import AddCarPaymentModal from "../components/Modals/AddCarPaymentModal";
import AssignCarToCompanyModal from "../components/Modals/CarModals/AssignCarToCompanyModal";
import ConfirmationModal from "../components/Modals/ConfirmationModal";
import Config from "../utils/GlobalConfig";
import EditAdvancePaymentModal from "../components/Modals/EditModals/EditAdvancePaymentModal";

const CarDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { car } = location.state || {};
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [isAssignCompanyModalOpen, setIsAssignCompanyModalOpen] =
    useState(false);
  const [loading, setLoading] = useState({
    payments: true,
    companies: true,
  });
  const [error, setError] = useState({
    payments: null,
    companies: null,
  });
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [companyToUnassign, setCompanyToUnassign] = useState(null);

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsEditPaymentModalOpen(true);
  };

  // Reusable component for displaying detail rows
  const DetailRow = ({ label, value }) => (
    <div className="detail-row">
      <span className="text-gray-600 font-medium text-sm">{label}:</span>
      <span className="text-gray-800 font-semibold text-base">
        {value || "N/A"}
      </span>
    </div>
  );

  const API_BASE_URL = "http://192.168.0.106:5000/api";

  useEffect(() => {
    if (!car) {
      navigate("/fleet");
      return;
    }
    console.log(car);

    fetchPaymentHistory();
    fetchAssignedCompanies();
  }, [car, navigate]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, payments: true }));
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/payments/detail/${car.car_id}`
      );

      if (!response.ok) throw new Error("Failed to fetch payment history");

      const data = await response.json();
      console.log(data);
      setPaymentHistory(data.data.carPayments || []);
    } catch (err) {
      setError((prev) => ({ ...prev, payments: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, payments: false }));
    }
  };

  const fetchAssignedCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/${car.car_id}/companies`
      );

      if (!response.ok) throw new Error("Failed to fetch assigned companies");

      const data = await response.json();
      console.log("Assigned Companies", data);
      setAssignedCompanies(data.companies || []);
    } catch (err) {
      setError((prev) => ({ ...prev, companies: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };
  const handleDeletePayment = async (payment) => {
    try {
      // Ensure payment_id is used
      const paymentId = paymentToDelete?.payment_id;

      // Validate payment ID
      if (!paymentId) {
        console.error("Invalid payment ID");
        return;
      }

      // Perform delete request
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/payments/delete/${paymentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete payment");
      }

      // Parse response
      const data = await response.json();
      setIsConfirmationModalOpen(false);
      fetchPaymentHistory();
    } catch (error) {
      console.error("Failed to delete payment", error);
      // Show error notification
      // toast.error(error.message);
    }
  };

  // Trigger delete confirmation
  const confirmDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setIsConfirmationModalOpen(true);
  };

  const handleUnassignCompany = async () => {
    try {
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/${car.car_id}/unassign-companies/${companyToUnassign.company_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unassign company");
      }

      await fetchAssignedCompanies();
      setIsUnassignModalOpen(false);
      setCompanyToUnassign(null);
    } catch (error) {
      console.error("Failed to unassign company:", error);
      // You can add toast notification here
    }
  };

  const confirmUnassignCompany = (company) => {
    setCompanyToUnassign(company);
    setIsUnassignModalOpen(true);
  };

  if (!car) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/fleet")}
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
                <span className="font-medium">Back to Fleet</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vehicle Details
            </h1>
          </div>

          {/* Car Details Card */}
          <div className="space-y-6">
            {/* Vehicle Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {/* Vehicle Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                        />
                      </svg>
                      Vehicle Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Car ID" value={car.car_id} />
                      <DetailRow label="Car Name" value={car.car_name} />
                      <DetailRow label="Model" value={car.car_model} />
                      <DetailRow label="Type" value={car.type_of_car} />
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Driver Details
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Name" value={car.driver_name} />
                      <DetailRow label="Contact" value={car.driver_number} />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Owner Details
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Name" value={car.owner_name} />
                      <DetailRow label="Contact" value={car.owner_number} />
                      <DetailRow
                        label="Account"
                        value={car.owner_account_number}
                      />
                      <DetailRow label="IFSC" value={car.ifsc_code} />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <div>
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
                      Address
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Location" value={car.address} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Companies Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-500"
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
                    Assigned Companies
                  </h2>
                  <button
                    onClick={() => setIsAssignCompanyModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Assign Company
                  </button>
                </div>

                {loading.companies ? (
                  <div className="text-center py-4">
                    Loading assigned companies...
                  </div>
                ) : error.companies ? (
                  <div className="text-red-500 text-center py-4">
                    {error.companies}
                  </div>
                ) : assignedCompanies.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No companies assigned
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignment Date
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
                        {assignedCompanies.map((company) => (
                          <tr key={company.company_id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {company.company_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(
                                company.assignment_date
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  company.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {company.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() =>
                                    confirmUnassignCompany(company)
                                  }
                                  className="inline-flex items-center text-sm text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                                >
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                                    />
                                  </svg>
                                  Unassign
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Payment History
                  </h2>
                  <button
                    onClick={() => setIsAddPaymentModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Payment
                  </button>
                </div>

                {loading.payments ? (
                  <div className="text-center py-4">
                    Loading payment history...
                  </div>
                ) : error.payments ? (
                  <div className="text-red-500 text-center py-4">
                    {error.payments}
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No payment history available
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.payment_id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              ${parseFloat(payment.amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  confirmDeletePayment(payment);
                                }}
                                className="text-red-600 hover:text-red-900 mr-4"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleEditPayment(payment)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        /* Confirmation Modal */
        isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={() => setIsConfirmationModalOpen(false)}
            onConfirm={handleDeletePayment}
            title="Confirm Payment Deletion"
            message={`Are you sure you want to delete the payment of $${
              paymentToDelete
                ? parseFloat(paymentToDelete.amount).toFixed(2)
                : ""
            }?`}
          />
        )
      }

      {/* Add Payment Modal */}
      {isAddPaymentModalOpen && (
        <AddCarPaymentModal
          isOpen={isAddPaymentModalOpen}
          onClose={() => setIsAddPaymentModalOpen(false)}
          carId={car.car_id}
          onPaymentAdded={fetchPaymentHistory}
        />
      )}

      {isAssignCompanyModalOpen && (
        <AssignCarToCompanyModal
          isOpen={isAssignCompanyModalOpen}
          onClose={() => setIsAssignCompanyModalOpen(false)}
          carId={car.car_id}
          onCompaniesAssigned={fetchAssignedCompanies}
        />
      )}

      {isEditPaymentModalOpen && (
        <EditAdvancePaymentModal
          isOpen={isEditPaymentModalOpen}
          onClose={() => {
            setIsEditPaymentModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          carId={car.car_id}
          onPaymentUpdated={() => {
            fetchPaymentHistory();
            setIsEditPaymentModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}

      {isUnassignModalOpen && (
        <ConfirmationModal
          isOpen={isUnassignModalOpen}
          onClose={() => {
            setIsUnassignModalOpen(false);
            setCompanyToUnassign(null);
          }}
          onConfirm={handleUnassignCompany}
          title="Confirm Company Unassignment"
          message={`Are you sure you want to unassign ${companyToUnassign?.company_name} from this vehicle?`}
        />
      )}
    </div>
  );
};

export default CarDetails;
