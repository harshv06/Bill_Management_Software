import { useEffect, useState } from "react";
import config from "../../../utils/GlobalConfig";
import axios from "axios";

const AddFleetCompanyModal = ({
  isOpen,
  onClose,
  onSubmit,
  subVendors,
  clientType,
  selectedSubVendorId, // Add this prop
}) => {
  const [companyData, setCompanyData] = useState({
    company_name: "",
    contact_person: "",
    contact_number: "",
    email: "",
    sub_vendor_id: selectedSubVendorId || null,
  });

  useEffect(() => {
    if (clientType === "SUB_VENDOR" && selectedSubVendorId) {
      setCompanyData((prev) => ({
        ...prev,
        sub_vendor_id: selectedSubVendorId,
      }));
    } else {
      setCompanyData((prev) => ({
        ...prev,
        sub_vendor_id: null,
      }));
    }
  }, [clientType, selectedSubVendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/v1/createCompany`,
        companyData
      );
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error("Error adding company", error);
      // Implement error handling (e.g., toast notification)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Company</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              value={companyData.company_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          {clientType === "SUB_VENDOR" && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Sub Vendor *
              </label>
              <select
                name="sub_vendor_id"
                value={companyData.sub_vendor_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
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
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contact_person"
              value={companyData.contact_person}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              name="contact_number"
              value={companyData.contact_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={companyData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFleetCompanyModal;
