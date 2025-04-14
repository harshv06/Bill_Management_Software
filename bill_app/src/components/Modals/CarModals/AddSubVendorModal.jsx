import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import config from "../../../utils/GlobalConfig";

const AddSubVendorModal = ({ 
    isOpen, 
    onClose, 
    onSubmit 
  }) => {
    const [subVendorData, setSubVendorData] = useState({
      sub_vendor_name: "",
      contact_person: "",
      contact_number: "",
      email: "",
      gst_number: "",
      pan_number: ""
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSubVendorData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const validateForm = () => {
      const { 
        sub_vendor_name, 
        contact_person, 
        contact_number, 
        email 
      } = subVendorData;
  
      if (!sub_vendor_name) {
        toast.error("Sub Vendor Name is required");
        return false;
      }
  
      if (!contact_person) {
        toast.error("Contact Person is required");
        return false;
      }
  
      if (!contact_number || !/^[6-9]\d{9}$/.test(contact_number)) {
        toast.error("Invalid Contact Number");
        return false;
      }
  
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        toast.error("Invalid Email Format");
        return false;
      }
      console.log("validated")
      return true;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (validateForm()) {
        try {
          const response = await axios.post(
            `${config.API_BASE_URL}/v1/createSubVendor`, 
            subVendorData
          );
          console.log(response);
          onSubmit(response.data);
          onClose();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to add Sub Vendor");
        }
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Sub Vendor</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Sub Vendor Name *
              </label>
              <input
                type="text"
                name="sub_vendor_name"
                value={subVendorData.sub_vendor_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={subVendorData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contact_number"
                value={subVendorData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                pattern="[6-9]\d{9}"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={subVendorData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                GST Number
              </label>
              <input
                type="text"
                name="gst_number"
                value={subVendorData.gst_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                name="pan_number"
                value={subVendorData.pan_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
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
                Add Sub Vendor
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default AddSubVendorModal;