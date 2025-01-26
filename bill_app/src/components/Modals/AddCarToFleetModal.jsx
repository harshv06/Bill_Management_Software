// AddCarToFleetModal.js
import React, { useState } from "react";

const AddCarToFleetModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    car_id: "",
    car_name: "",
    car_model: "",
    DateOfService: "",
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
        DateOfService: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add New Car</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Car ID
            </label>
            <input
              type="text"
              name="car_id"
              value={formData.car_id}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter car ID"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Car Name
            </label>
            <input
              type="text"
              name="car_name"
              value={formData.car_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter car name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Car Model
            </label>
            <input
              type="text"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter car model"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Service Date
            </label>
            <input
              type="date"
              name="DateOfService"
              value={formData.DateOfService}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
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
