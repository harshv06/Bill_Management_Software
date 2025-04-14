import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import config from "../../utils/GlobalConfig";
import AddSubVendorModal from "./CarModals/AddSubVendorModal";
import AddFleetCompanyModal from "./CarModals/AddFleetCompanyModal";

const AddCarToFleetModal = ({ isOpen, onClose, onAdd }) => {
  const [subVendors, setSubVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showAddSubVendorModal, setShowAddSubVendorModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
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

  const [formData, setFormData] = useState({
    car_id: "",
    car_name: "",
    car_model: "",
    type_of_car: "Sedan",
    driver_name: "",
    driver_number: "",
    owner_name: "",
    owner_number: "",
    owner_account_number: "",
    ifsc_code: "",
    address: "",
    induction_date: "",
    per_trip_amount: "",
    monthly_package_rate: "",
    status: "IN_PROCESS",
    client_type: "OWNED",
    sub_vendor_id: null,
    company_ids: [], // Changed to support multiple companies
  });

  const carTypes = [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "IN_PROCESS", label: "In Process" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset related payment fields when payment type changes
      ...(name === "payment_type" && {
        per_trip_amount: value === "TRIP_BASED" ? prev.per_trip_amount : "",
        monthly_package_rate:
          value === "PACKAGE_BASED" ? prev.monthly_package_rate : "",
      }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd(formData);
      resetForm();
    }
  };

  useEffect(() => {
    // Update selected companies whenever companies list changes or sub_vendor_id changes
    if (formData.client_type === "SUB_VENDOR" && formData.sub_vendor_id) {
      const filteredCompanies = companies.filter(
        (company) => company.sub_vendor_id === formData.sub_vendor_id
      );
      setSelectedCompanies(filteredCompanies);
    } else {
      setSelectedCompanies(companies);
    }
  }, [companies, formData.sub_vendor_id, formData.client_type]);

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
    if (isOpen) {
      fetchSubVendors();
    }
  }, [isOpen]);

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

  const validateForm = () => {
    const requiredFields = [
      "car_id",
      "car_name",
      "car_model",
      "driver_name",
      "driver_number",
    ];

    // Check required fields
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return false;
    }

    // Validate phone numbers
    if (formData.driver_number && !/^\d{10}$/.test(formData.driver_number)) {
      alert("Driver number must be 10 digits");
      return false;
    }

    // Validate companies for sub-vendor
    if (formData.client_type === "SUB_VENDOR") {
      if (!formData.sub_vendor_id) {
        alert("Please select a sub-vendor");
        return false;
      }
      if (formData.company_ids.length === 0) {
        alert("Please select at least one company");
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      car_id: "",
      car_name: "",
      car_model: "",
      type_of_car: "Sedan",
      driver_name: "",
      driver_number: "",
      owner_name: "",
      owner_number: "",
      owner_account_number: "",
      ifsc_code: "",
      address: "",
      induction_date: "",
      payment_type: "TRIP_BASED",
      per_trip_amount: "",
      monthly_package_rate: "",
      status: "IN_PROCESS",
      client_type: "OWNED",
      sub_vendor_id: null,
      company_ids: [],
    });
  };

  const renderCompanies = () => {
    const companiesForRendering =
      formData.client_type === "SUB_VENDOR" ? selectedCompanies : companies;

    return companiesForRendering.map((company) => {
      // Determine if the company is selectable
      const isSelectable =
        formData.client_type === "OWNED" ||
        (formData.client_type === "SUB_VENDOR" &&
          company.sub_vendor_id === formData.sub_vendor_id);

      const isSelected = formData.company_ids.includes(
        company.fleet_company_id
      );

      return (
        <div
          key={company.fleet_company_id}
          className={`flex items-center border rounded-md p-2 ${
            !isSelectable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${isSelected ? "bg-blue-50 border-blue-500" : "bg-white"}`}
          onClick={() => {
            if (isSelectable) {
              handleCompanySelection(company.fleet_company_id);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Prevent default checkbox behavior
            disabled={!isSelectable}
            className="mr-2"
          />
          <span>{company.company_name}</span>
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Add New Vehicle to Fleet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Basic Vehicle Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Car ID
                </label>
                <input
                  type="text"
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Car Name
                </label>
                <input
                  type="text"
                  name="car_name"
                  value={formData.car_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Car Model
                </label>
                <input
                  type="text"
                  name="car_model"
                  value={formData.car_model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Type of Car
                </label>
                <select
                  name="type_of_car"
                  value={formData.type_of_car}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  {carTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Client Information Section */}
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

          {/* Driver & Owner Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Driver & Owner Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Driver Number
                </label>
                <input
                  type="text"
                  name="driver_number"
                  value={formData.driver_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Owner Number
                </label>
                <input
                  type="text"
                  name="owner_number"
                  value={formData.owner_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="owner_account_number"
                  value={formData.owner_account_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  placeholder="Enter bank account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Additional Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Induction Date
                </label>
                <input
                  type="date"
                  name="induction_date"
                  value={formData.induction_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
            >
              Add Vehicle
            </button>
          </div>
        </form>

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
  );
};

export default AddCarToFleetModal;
