// pages/CarDetails.js
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AddCompanyPaymentModal from "../components/Modals/AddCompanyPaymentModal";
import AddCarPaymentModal from "../components/Modals/AddCarPaymentModal";
import AssignCarToCompanyModal from "../components/Modals/CarModals/AssignCarToCompanyModal";
import ConfirmationModal from "../components/Modals/ConfirmationModal";
import Config from "../utils/GlobalConfig";
import EditAdvancePaymentModal from "../components/Modals/EditModals/EditAdvancePaymentModal";
import TransactionSyncService from "../utils/TransactionSyncService";
import config from "../utils/GlobalConfig";
import axios from "axios";
import AddSubVendorModal from "../components/Modals/CarModals/AddSubVendorModal";
import AddFleetCompanyModal from "../components/Modals/CarModals/AddFleetCompanyModal";

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
  const [subVendors, setSubVendors] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [companyToUnassign, setCompanyToUnassign] = useState(null);
  const [carDetails, setCarDetails] = useState({
    clientType: null,
    subVendorName: null,
  });

  const [newSubVendorData, setNewSubVendorData] = useState({
    sub_vendor_name: "",
    contact_person: "",
    contact_number: "",
    email: "",
  });
  const [newCompanyData, setNewCompanyData] = useState({
    company_name: "",
    contact_person: "",
    contact_number: "",
    email: "",
    sub_vendor_id: null,
  });
  const [companies, setCompanies] = useState([]);
  // State for client information
  const [clientInfo, setClientInfo] = useState({
    type: null,
    subVendorDetails: null,
    ownedDetails: null,
  });

  const [formData, setFormData] = useState({
    status: "IN_PROCESS",
    client_type: "OWNED",
    sub_vendor_id: null,
    company_ids: [], // Changed to support multiple companies
  });
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showAddSubVendorModal, setShowAddSubVendorModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  const handleCompanySelection = useCallback(
    (companyId) => {
      setFormData((prev) => {
        // If in SUB_VENDOR mode, ensure only companies from the selected sub-vendor are selectable
        if (prev.client_type === "SUB_VENDOR" && prev.sub_vendor_id) {
          // Find the selected company
          const selectedCompany = companies.find(
            (company) => company.fleet_company_id === companyId
          );

          // Ensure the company belongs to the selected sub-vendor
          if (
            !selectedCompany ||
            selectedCompany.sub_vendor_id !== prev.sub_vendor_id
          ) {
            return prev; // Do nothing if company is not valid
          }
        }

        // Toggle company selection
        const currentCompanyIds = prev.company_ids || [];
        const isCurrentlySelected = currentCompanyIds.includes(companyId);

        // For SUB_VENDOR, allow multiple selections
        const updatedCompanyIds = isCurrentlySelected
          ? currentCompanyIds.filter((id) => id !== companyId)
          : [...currentCompanyIds, companyId];

        return {
          ...prev,
          company_ids: updatedCompanyIds,
        };
      });
    },
    [companies]
  );

  const fetchSubVendors = async () => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/v1/getAllSubVendors`
      );
      setSubVendors(response.data || []);
    } catch (error) {
      console.error("Error fetching sub vendors", error);
    }
  };

  const fetchCompanies = async (subVendorId) => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/v1/getAllCompanies`,
        {
          params: {
            sub_vendor_id: subVendorId,
          },
        }
      );
      const companies = response.data || [];

      console.log("Fetched Companies:", companies);

      // Filter companies based on sub vendor if provided
      if (subVendorId) {
        const filteredCompanies = companies.filter(
          (company) => company.sub_vendor_id === subVendorId
        );
        console.log("Filtered Companies:", filteredCompanies);
        setCompanies(filteredCompanies);
        setSelectedCompanies(filteredCompanies);
      } else {
        setCompanies(companies);
        setSelectedCompanies(companies);
      }
    } catch (error) {
      console.error("Error fetching companies", error);
    }
  };

  useEffect(() => {
    fetchSubVendors();
  }, []);

  const handleClientTypeChange = (e) => {
    const clientType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      client_type: clientType,
      sub_vendor_id: clientType === "SUB_VENDOR" ? "" : null,
      company_ids: [], // Reset companies
    }));

    // Reset companies when switching client type
    setSelectedCompanies([]);
    setCompanies([]);

    // If switching to OWNED, fetch all companies
    if (clientType === "OWNED") {
      fetchCompanies();
    }
  };

  const fetchClientDetails = async () => {
    try {
      // Determine client type and fetch appropriate details
      if (car.client_type === "SUB_VENDOR") {
        // Fetch sub-vendor details
        const subVendorResponse = await fetch(
          `${Config.API_BASE_URL}/subvendors/${car.sub_vendor_id}`
        );
        const subVendorData = await subVendorResponse.json();

        setClientInfo({
          type: "SUB_VENDOR",
          subVendorDetails: subVendorData,
        });
      } else {
        // For owned vehicles
        setClientInfo({
          type: "OWNED",
          ownedDetails: {
            ownerName: car.owner_name,
            ownerContact: car.owner_number,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching client details", error);
    }
  };

  const handleSubVendorChange = (e) => {
    const subVendorId = e.target.value;
    console.log("Selected Sub Vendor ID:", subVendorId);

    setFormData((prev) => ({
      ...prev,
      sub_vendor_id: subVendorId,
      company_ids: [], // Reset companies when sub vendor changes
    }));

    // Fetch companies only when a sub vendor is selected
    if (subVendorId) {
      fetchCompanies(subVendorId);
    } else {
      setSelectedCompanies([]);
      setCompanies([]);
    }
  };

  const handleAddSubVendor = async (newSubVendorData) => {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/v1/createSubVendor`,
        newSubVendorData
      );

      // Add new sub vendor to the list
      const newSubVendor = response.data;
      setSubVendors((prev) => [...prev, newSubVendor]);

      // Automatically select the newly added sub-vendor
      setFormData((prev) => ({
        ...prev,
        sub_vendor_id: newSubVendor.sub_vendor_id,
      }));

      // Update the selected companies based on the new sub-vendor
      setSelectedCompanies(
        companies.filter(
          (company) => company.sub_vendor_id === newSubVendor.sub_vendor_id
        )
      );

      setShowAddSubVendorModal(false);
    } catch (error) {
      console.error("Error adding sub vendor", error);
      alert(error.response?.data?.message || "Failed to add sub vendor");
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      // Prepare company data based on client type
      let companyData = { ...newCompanyData };

      if (formData.client_type === "SUB_VENDOR" && formData.sub_vendor_id) {
        companyData.sub_vendor_id = formData.sub_vendor_id;
      } else {
        companyData.sub_vendor_id = null;
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/v1/createCompany`,
        companyData
      );

      // Add new company to the list
      const newCompany = response.data;
      setCompanies((prev) => [...prev, newCompany]);

      // Automatically select the newly added company
      setFormData((prev) => ({
        ...prev,
        company_ids: [newCompany.fleet_company_id],
      }));

      // If we're in sub-vendor mode, update the selected companies
      if (formData.client_type === "SUB_VENDOR" && formData.sub_vendor_id) {
        setSelectedCompanies((prev) => [...prev, newCompany]);
      }

      // Reset form and close modal
      setNewCompanyData({
        company_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        sub_vendor_id: null,
      });
      setShowAddCompanyModal(false);
    } catch (error) {
      console.error("Error adding company", error);
      alert(error.response?.data?.message || "Failed to add company");
    }
  };

  useEffect(() => {
    if (car) {
      fetchClientDetails();
    }
  }, [car]);

  const renderClientInformation = () => {
    if (clientInfo.type === "SUB_VENDOR") {
      const subVendor = clientInfo.subVendorDetails;
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sub Vendor Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Sub Vendor Name
              </label>
              <p className="text-gray-900">
                {subVendor?.sub_vendor_name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Person
              </label>
              <p className="text-gray-900">
                {subVendor?.contact_person || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Number
              </label>
              <p className="text-gray-900">
                {subVendor?.contact_number || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <p className="text-gray-900">{subVendor?.email || "N/A"}</p>
            </div>
          </div>

          {/* Action Buttons for Sub Vendor */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => {
                /* Open Edit Sub Vendor Modal */
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit Sub Vendor
            </button>
            <button
              onClick={() => {
                /* Open View Companies Modal */
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              View Companies
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Owned Vehicle Details
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Owner Name
            </label>
            <p className="text-gray-900">
              {clientInfo.ownedDetails?.ownerName || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Owner Contact
            </label>
            <p className="text-gray-900">
              {clientInfo.ownedDetails?.ownerContact || "N/A"}
            </p>
          </div>
        </div>

        {/* Action Buttons for Owned Vehicle */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => {
              /* Open Edit Owner Details Modal */
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit Owner Details
          </button>
          <button
            onClick={() => {
              /* Open Transfer Vehicle Modal */
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Transfer Vehicle
          </button>
        </div>
      </div>
    );
  };

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
        `${Config.API_BASE_URL}/v1/cars/${car.car_id}/companies-details`
      );

      if (!response.ok) throw new Error("Failed to fetch assigned companies");

      const data = await response.json();
      console.log("Assigned Companies Details", data);

      setAssignedCompanies(data.companies || []);
      // Optionally set additional car details
      setCarDetails({
        clientType: data.car.client_type,
        subVendorName: data.car.sub_vendor_name,
      });
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
      console.log(paymentId);
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

      const response2 =
        await TransactionSyncService.deleteDaybookTransactionFromCarPayment(
          paymentId
        );
      console.log(response2);
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
        `${Config.API_BASE_URL}/cars/${car.car_id}/unassign-companies/${companyToUnassign.fleet_company_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unassign company");
      }

      // Refresh the assigned companies list
      await fetchAssignedCompanies();

      // Close the confirmation modal
      setIsUnassignModalOpen(false);
      setCompanyToUnassign(null);
    } catch (error) {
      console.error("Failed to unassign company:", error);
      // Optionally show an error toast or alert
      alert(error.message);
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

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Client Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Client Type
                </label>
                <select
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleClientTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="OWNED">Owned</option>
                  <option value="SUB_VENDOR">Sub Vendor</option>
                </select>
              </div>

              {formData.client_type === "SUB_VENDOR" && (
                <div className="flex items-center gap-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Sub Vendor
                    </label>
                    <select
                      name="sub_vendor_id"
                      value={formData.sub_vendor_id}
                      onChange={handleSubVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Sub Vendor</option>
                      {subVendors.map((vendor) => (
                        <option
                          key={vendor.sub_vendor_id}
                          value={vendor.sub_vendor_id}
                        >
                          {vendor.sub_vendor_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="self-end">
                    <button
                      type="button"
                      onClick={() => setShowAddSubVendorModal(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Select Companies
              </label>
              <div className="grid md:grid-cols-3 gap-2">
                {(() => {
                  // Determine the companies to render based on client type
                  const companiesForRendering =
                    formData.client_type === "SUB_VENDOR"
                      ? selectedCompanies
                      : companies;

                  // Create a map to track unique companies and their details
                  const uniqueCompaniesMap = new Map();

                  companiesForRendering.forEach((company) => {
                    // Use company name as the key
                    if (!uniqueCompaniesMap.has(company.company_name)) {
                      uniqueCompaniesMap.set(company.company_name, {
                        companies: [company],
                        isSelectable:
                          formData.client_type === "OWNED" ||
                          (formData.client_type === "SUB_VENDOR" &&
                            company.sub_vendor_id === formData.sub_vendor_id),
                      });
                    } else {
                      const existingEntry = uniqueCompaniesMap.get(
                        company.company_name
                      );
                      existingEntry.companies.push(company);

                      // Update selectability if any company is selectable
                      existingEntry.isSelectable =
                        existingEntry.isSelectable ||
                        formData.client_type === "OWNED" ||
                        (formData.client_type === "SUB_VENDOR" &&
                          company.sub_vendor_id === formData.sub_vendor_id);
                    }
                  });

                  return Array.from(uniqueCompaniesMap.entries()).map(
                    ([companyName, details]) => {
                      // Find a selectable company
                      const selectableCompany = details.companies.find(
                        (company) =>
                          formData.client_type === "OWNED" ||
                          (formData.client_type === "SUB_VENDOR" &&
                            company.sub_vendor_id === formData.sub_vendor_id)
                      );

                      // Check if any version of this company is selected
                      const isSelected = selectableCompany
                        ? formData.company_ids.includes(
                            selectableCompany.fleet_company_id
                          )
                        : false;

                      return (
                        <div
                          key={companyName}
                          className={`flex items-center border rounded-md p-2 ${
                            !details.isSelectable
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } ${
                            isSelected
                              ? "bg-blue-50 border-blue-500"
                              : "bg-white"
                          }`}
                          onClick={() => {
                            if (details.isSelectable && selectableCompany) {
                              handleCompanySelection(
                                selectableCompany.fleet_company_id
                              );
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Prevent default behavior
                            disabled={!details.isSelectable}
                            className="mr-2"
                          />
                          <span>{companyName}</span>
                        </div>
                      );
                    }
                  );
                })()}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  + Add New Company
                </button>
              </div>
            </div>
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
            {/* <div className="space-y-6 mt-6">{renderClientInformation()}</div> */}
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
                  <div className="space-y-4">
                    {/* Client Type Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        Client Type: {carDetails.clientType || "N/A"}
                        <br />
                        Client Name: {carDetails.subVendorName || "N/A"}
                      </h3>

                      {car.client_type === "SUB_VENDOR" &&
                        car.sub_vendor_name && (
                          <div className="mb-2">
                            <span className="font-medium text-gray-600">
                              Sub Vendor: {car.sub_vendor_name}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Companies Table */}
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
                            <tr key={company.fleet_company_id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {company.company_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {company.assignment_date
                                  ? new Date(
                                      company.assignment_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    company.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {company.status || "Inactive"}
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
          <AddSubVendorModal
            isOpen={showAddSubVendorModal}
            onClose={() => setShowAddSubVendorModal(false)}
            onSubmit={handleAddSubVendor}
          />

          {/* Company Modal */}
          <AddFleetCompanyModal
            isOpen={showAddCompanyModal}
            onClose={() => setShowAddCompanyModal(false)}
            onSubmit={handleAddCompany}
            subVendors={subVendors}
            clientType={formData.client_type}
            selectedSubVendorId={formData.sub_vendor_id} // Pass the selected sub vendor ID
          />
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
