// components/Settings/CompanyProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Config from "../../src/utils/GlobalConfig";

const CompanyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "MATOSHREE FLEET SOLUTIONS PRIVATE LIMITED",
    address_line1: "Office No. 201, 2nd Floor",
    address_line2: "Sai Corporate Park, Near Pune-Solapur Highway",
    city: "Pune",
    state: "Maharashtra",
    area: "Hadapsar",
    pincode: "411028",
    contact_number: "+91 9876543210",
    email: "info@matoshreesolutions.com",
    pan_number: "AAQCM3825L",
    gst_number: "27AAQCM3825L1ZW",
    state_code: "27",
    bank_name: "AMANORA PUNE MH",
    bank_account_number: "2221262245805293",
    ifsc_code: "AUBL0002622",
    hsn: "996412",
    service_category: "EMPLOYEE TRANSPORTATION",
    nature_of_transaction: "BUSINESS TO BUSINESS",
    logo_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanyProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/company-profile/get`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success" && response.data.data) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch company profile:", error);
      toast.error("Failed to fetch company profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(profile);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Config.API_BASE_URL}/company-profile/create`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Save to localStorage for PDF generation
        localStorage.setItem("companyProfile", JSON.stringify(profile));
        toast.success("Company profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Company Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={profile?.company_name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={profile?.contact_number || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={profile?.email || "" }
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={profile?.logo_url || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="address_line1"
                value={profile?.address_line1 || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                name="address_line2"
                value={profile?.address_line2 || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={profile?.area || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={profile?.city || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={profile?.state || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={profile?.pincode || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tax Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                GST Number *
              </label>
              <input
                type="text"
                name="gst_number"
                value={profile?.gst_number || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                PAN Number *
              </label>
              <input
                type="text"
                name="pan_number"
                value={profile?.pan_number || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State Code *
              </label>
              <input
                type="text"
                name="state_code"
                value={profile?.state_code || ""}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                HSN Code
              </label>
              <input
                type="text"
                name="hsn"
                value={profile?.hsn || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Category
              </label>
              <input
                type="text"
                name="service_category"
                value={profile?.service_category || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nature of Transaction
              </label>
              <input
                type="text"
                name="nature_of_transaction"
                value={profile?.nature_of_transaction || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Bank Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                name="bank_name"
                value={profile?.bank_name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                name="bank_account_number"
                value={profile?.bank_account_number || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifsc_code"
                value={profile?.ifsc_code || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md ${
                  isEditing ? "border-gray-300" : "bg-gray-50 border-gray-200"
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={profile.is_active}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "is_active",
                    value: e.target.checked || "",
                  },
                })
              }
              disabled={!isEditing}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active Profile
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanyProfile;
