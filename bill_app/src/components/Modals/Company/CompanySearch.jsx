import React, { useState, useMemo, useEffect } from "react";

const CompanySearch = ({ companies, onSelectCompany, onAddNewCompany }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // More comprehensive search across multiple fields
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;

    return companies
      .filter((company) => {
        const searchValue = searchTerm.toLowerCase();

        switch (searchField) {
          case "name":
            return company.company_name.toLowerCase().includes(searchValue);
          case "gst":
            return company.gst_number.toLowerCase().includes(searchValue);
          case "address":
            return company.address.toLowerCase().includes(searchValue);
          default:
            return company.company_name.toLowerCase().includes(searchValue);
        }
      })
      .sort((a, b) => a.company_name.localeCompare(b.company_name));
  }, [companies, searchTerm, searchField]);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSearchTerm(company.company_name);
    setIsDropdownOpen(false);
    onSelectCompany(company);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedCompany(null);
    setIsDropdownOpen(true);
  };

  // Add event listener to handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      const companySearchElement = document.getElementById(
        "company-search-container"
      );
      if (
        companySearchElement &&
        !companySearchElement.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id="company-search-container" className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {/* Search Input */}
        <div className="col-span-2">
          <input
            type="text"
            placeholder={`Search companies by ${searchField}`}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Dropdown for Companies */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div
                key={company.company_id}
                onClick={() => handleCompanySelect(company)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between"
              >
                <div>
                  <div className="font-semibold">{company.company_name}</div>
                  <div className="text-xs text-gray-500">
                    GST: {company.gst_number}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{company.address}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-center text-gray-500">
              No companies found
              <button
                onClick={() => {
                  onAddNewCompany();
                  setIsDropdownOpen(false);
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Add New Company
              </button>
            </div>
          )}
        </div>
      )}

      {/* Companies Count */}
      {isDropdownOpen && (
        <div className="text-sm text-gray-500 text-center mt-1">
          {filteredCompanies.length} companies found
        </div>
      )}

      {/* Add New Company Button */}
      <div className="mt-2">
        <button
          onClick={() => {
            onAddNewCompany();
            setIsDropdownOpen(false);
          }}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          + Add New Company
        </button>
      </div>
    </div>
  );
};

export default CompanySearch;
