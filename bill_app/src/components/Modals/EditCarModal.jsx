import React, { useState, useEffect } from 'react';

const EditCarModal = ({ isOpen, onClose, onEdit, carData }) => {
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
    induction_date: ""
  });

  useEffect(() => {
    if (carData) {
      setFormData({
        car_id: carData.car_id || "",
        car_name: carData.car_name || "",
        car_model: carData.car_model || "",
        type_of_car: carData.type_of_car || "Sedan",
        driver_name: carData.driver_name || "",
        driver_number: carData.driver_number || "",
        owner_name: carData.owner_name || "",
        owner_number: carData.owner_number || "",
        owner_account_number: carData.owner_account_number || "",
        ifsc_code: carData.ifsc_code || "",
        address: carData.address || "",
        induction_date: carData.induction_date 
          ? carData.induction_date.split('T')[0] 
          : ""
      });
    }
  }, [carData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.car_name && formData.car_id) {
      onEdit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Car</h2>
        <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto pr-2">
          {Object.keys(formData).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {key.replace(/_/g, " ").toUpperCase()}
              </label>
              {key === "type_of_car" ? (
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Other">Other</option>
                </select>
              ) : key === "car_id" ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3"
                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                  disabled
                />
              ) : (
                <input
                  type={key.includes("date") ? "date" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3"
                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                  required={key !== "address" && key !== "ifsc_code"}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCarModal;