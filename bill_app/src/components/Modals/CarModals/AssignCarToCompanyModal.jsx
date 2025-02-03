// components/AssignCompanyModal.js
import React, { useState, useEffect } from "react";

const AssignCarToCompanyModal = ({
  isOpen,
  onClose,
  carId,
  onCompaniesAssigned,
}) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://192.168.0.106:5000/api";

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCompanies();
    }
  }, [isOpen]);

  const fetchAvailableCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/cars/${carId}/available-companies`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/cars/${carId}/assign-companies`,
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
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-2xl font-semibold">Assign Companies to Car</h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <div className="relative flex-auto p-6">
            {loading ? (
              <div className="text-center">Loading companies...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div>
                {companies.map((company) => (
                  <div
                    key={company.company_id}
                    className="flex items-center mb-2"
                  >
                    <input
                      type="checkbox"
                      id={`company-${company.company_id}`}
                      checked={selectedCompanies.includes(company.company_id)}
                      onChange={() => handleCompanySelect(company.company_id)}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`company-${company.company_id}`}
                      className="flex-1"
                    >
                      {company.company_name}
                      <span className="text-gray-500 ml-2">
                        ({company.registration_number})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || selectedCompanies.length === 0}
            >
              {loading ? "Assigning..." : "Assign Companies"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCarToCompanyModal;
