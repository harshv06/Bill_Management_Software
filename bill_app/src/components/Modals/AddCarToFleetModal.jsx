import React, { useState } from "react";

const AddCarToFleetModal = ({ isOpen, onClose, onAdd }) => {
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
      onAdd(formData);
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
        induction_date: ""
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Car</h2>
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
              ) : (
                <input
                  type={key.includes("date") ? "date" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3"
                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                  required
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
              Add Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarToFleetModal;
