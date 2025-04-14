import React, { useState, useEffect } from "react";
import Config from "../../../utils/GlobalConfig";

const AssignCarToCompanyModal = ({
  isOpen,
  onClose,
  carId,
  onCompaniesAssigned,
}) => {
  const [companies, setCompanies] = useState([]);
  const [subVendors, setSubVendors] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState({
    companies: false,
    subVendors: false,
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubVendor, setSelectedSubVendor] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableData();
    }
  }, [isOpen]);

  const fetchAvailableData = async () => {
    try {
      // Reset states
      setLoading({ companies: true, subVendors: true });
      setError(null);
      setSelectedCompanies([]);
      setSelectedSubVendor(null);

      // Fetch companies and sub-vendors concurrently
      const [companiesResponse, subVendorsResponse] = await Promise.all([
        fetch(`${Config.API_BASE_URL}/cars/${carId}/available-companies`),
        fetch(`${Config.API_BASE_URL}/subVendors/with-companies`),
      ]);

      // Check responses
      if (!companiesResponse.ok || !subVendorsResponse.ok) {
        throw new Error("Failed to fetch available data");
      }

      const companiesData = await companiesResponse.json();
      const subVendorsData = await subVendorsResponse.json();

      // Set fetched data
      setCompanies(companiesData.companies || []);
      setSubVendors(subVendorsData.subVendors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ companies: false, subVendors: false });
    }
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleAssignCompanies = async () => {
    try {
      setLoading({ ...loading, companies: true });
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/${carId}/assign-companies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companies: selectedCompanies,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign companies");
      }

      // Trigger parent component to refresh assigned companies
      onCompaniesAssigned();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, companies: false });
    }
  };

  // Render companies based on the active tab and selected sub-vendor
  const renderCompanies = () => {
    if (loading.companies || loading.subVendors) {
      return <div className="text-center">Loading companies...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    // All companies without a sub-vendor
    if (activeTab === "all") {
      const companiesWithoutSubVendor = companies.filter(
        (company) => !company.sub_vendor_id
      );

      return companiesWithoutSubVendor.map((company) => (
        <div key={company.fleet_company_id} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`company-${company.fleet_company_id}`}
            checked={selectedCompanies.includes(company.fleet_company_id)}
            onChange={() => handleCompanySelect(company.fleet_company_id)}
            className="mr-2"
          />
          <label
            htmlFor={`company-${company.fleet_company_id}`}
            className="flex-1"
          >
            {company.company_name}
          </label>
        </div>
      ));
    }

    // Sub-vendor companies logic
    if (activeTab === "subVendor") {
      // If no sub-vendor is selected, show sub-vendor list
      if (!selectedSubVendor) {
        return subVendors.map((vendor) => (
          <div
            key={vendor.sub_vendor_id}
            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setSelectedSubVendor(vendor)}
          >
            <span className="flex-1">{vendor.sub_vendor_name}</span>
            <span className="text-gray-500 text-sm">
              {vendor.companies ? vendor.companies.length : 0} Companies
            </span>
          </div>
        ));
      }

      // Show companies for the selected sub-vendor
      return selectedSubVendor.companies.map((company) => (
        <div key={company.fleet_company_id} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`company-${company.fleet_company_id}`}
            checked={selectedCompanies.includes(company.fleet_company_id)}
            onChange={() => handleCompanySelect(company.fleet_company_id)}
            className="mr-2"
          />
          <label
            htmlFor={`company-${company.fleet_company_id}`}
            className="flex-1"
          >
            {company.company_name}
          </label>
        </div>
      ));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-2xl font-semibold">
              {activeTab === "subVendor" && selectedSubVendor
                ? `Companies for ${selectedSubVendor.sub_vendor_name}`
                : "Assign Companies to Car"}
            </h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={() => {
                if (selectedSubVendor) {
                  setSelectedSubVendor(null);
                } else {
                  onClose();
                }
              }}
            >
              {selectedSubVendor ? "Back" : "×"}
            </button>
          </div>

          {/* Tabs */}
          {!selectedSubVendor && (
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 ${
                  activeTab === "all"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("all")}
              >
                Standalone Companies
              </button>
              <button
                className={`flex-1 py-2 ${
                  activeTab === "subVendor"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("subVendor")}
              >
                Sub Vendor Companies
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="relative flex-auto p-6 max-h-[500px] overflow-y-auto">
            {renderCompanies()}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
            <button
              className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase outline-none background-transparent focus:outline-none"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase bg-green-500 rounded shadow outline-none active:bg-green-600 hover:shadow-lg focus:outline-none"
              type="button"
              onClick={handleAssignCompanies}
              disabled={
                loading.companies ||
                loading.subVendors ||
                selectedCompanies.length === 0
              }
            >
              {loading.companies || loading.subVendors
                ? "Assigning..."
                : "Assign Companies"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCarToCompanyModal;
