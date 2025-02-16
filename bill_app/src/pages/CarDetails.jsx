// pages/CarDetails.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AddCompanyPaymentModal from "../components/Modals/AddCompanyPaymentModal";
import AddCarPaymentModal from "../components/Modals/AddCarPaymentModal";
import AssignCarToCompanyModal from "../components/Modals/CarModals/AssignCarToCompanyModal";
import ConfirmationModal from "../components/Modals/ConfirmationModal";
import Config from "../utils/GlobalConfig";

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
    // fetchAssignedCompanies();
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
      setPaymentHistory(data.data.payments || []);
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
        `${API_BASE_URL}/cars/${car.car_id}/companies`
      );

      if (!response.ok) throw new Error("Failed to fetch assigned companies");

      const data = await response.json();
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
        `${API_BASE_URL}/cars/payments/delete/${paymentId}`,
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

  // Cancel delete
  const cancelDeletePayment = () => {
    setIsConfirmationModalOpen(false);
    setPaymentToDelete(null);
  };

  if (!car) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex h-screen">
          <div className="flex-1 p-8 overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/fleet")}
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
                Back to Fleet
              </button>
              <h1 className="text-2xl font-bold">Car Details</h1>
            </div>

            {/* Car Details Card */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Vehicle Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Vehicle Information
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Car ID" value={car.car_id} />
                      <DetailRow label="Car Name" value={car.car_name} />
                      <DetailRow label="Car Model" value={car.car_model} />
                      <DetailRow label="Car Type" value={car.type_of_car} />
                      <DetailRow
                        label="Induction Date"
                        value={new Date(
                          car.induction_date
                        ).toLocaleDateString()}
                      />
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Driver Details
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Driver Name" value={car.driver_name} />
                      <DetailRow
                        label="Driver Contact"
                        value={car.driver_number}
                      />
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Owner Details
                    </h2>
                    <div className="space-y-3">
                      <DetailRow label="Owner Name" value={car.owner_name} />
                      <DetailRow
                        label="Owner Contact"
                        value={car.owner_number}
                      />
                      <DetailRow
                        label="Account Number"
                        value={car.owner_account_number}
                      />
                      <DetailRow label="IFSC Code" value={car.ifsc_code} />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Address</h2>
                    <div className="space-y-3">
                      <DetailRow label="Full Address" value={car.address} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Companies Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assigned Companies</h2>
              <button
                onClick={() => setIsAssignCompanyModalOpen(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Assign to Company
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
                          <button
                            onClick={() => {
                              /* Handle unassign */
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Unassign
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

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Payment
              </button>
            </div>

            {loading.payments ? (
              <div className="text-center py-4">Loading payment history...</div>
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
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(payment.payment_date).toLocaleDateString()}
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
                            onClick={() => {
                              /* Handle edit */
                            }}
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
      </div>
    </div>
  );
};

export default CarDetails;
