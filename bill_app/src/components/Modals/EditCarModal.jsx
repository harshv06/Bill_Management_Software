// EditCarModal.js
import React, { useState, useEffect } from 'react';

const EditCarModal = ({ isOpen, onClose, onEdit, carData }) => {
  const [formData, setFormData] = useState({
    car_id: '',
    car_name: '',
    car_model: '',
    DateOfService: ''
  });

  useEffect(() => {
    if (carData) {
      setFormData({
        car_id: carData.car_id,
        car_name: carData.car_name,
        car_model: carData.car_model,
        DateOfService: carData.DateOfService.split('T')[0] // Format date for input
      });
    }
  }, [carData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Car</h2>
        
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
              disabled
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
              Update Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCarModal;