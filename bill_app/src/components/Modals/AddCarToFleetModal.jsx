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
    induction_date: "",
    payment_type: "TRIP_BASED",
    per_trip_amount: "",
    monthly_package_rate: "",
    status: "IN_PROCESS",
  });

  const carTypes = [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Other", label: "Other" },
  ];

  const paymentTypes = [
    { value: "TRIP_BASED", label: "Trip Based" },
    { value: "PACKAGE_BASED", label: "Package Based" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "IN_PROCESS", label: "In Process" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset related payment fields when payment type changes
      ...(name === "payment_type" && {
        per_trip_amount: value === "TRIP_BASED" ? prev.per_trip_amount : "",
        monthly_package_rate:
          value === "PACKAGE_BASED" ? prev.monthly_package_rate : "",
      }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd(formData);
      resetForm();
    }
  };

  const validateForm = () => {
    // Add your validation logic here
    const requiredFields = [
      "car_id",
      "car_name",
      "car_model",
      "driver_name",
      "driver_number",
    ];
    const isValid = requiredFields.every((field) => formData[field]);

    // Payment type specific validation
    if (formData.payment_type === "TRIP_BASED" && !formData.per_trip_amount) {
      alert("Per trip amount is required for trip-based payment");
      return false;
    }
    if (
      formData.payment_type === "PACKAGE_BASED" &&
      !formData.monthly_package_rate
    ) {
      alert("Monthly package rate is required for package-based payment");
      return false;
    }

    if (!isValid) {
      alert("Please fill in all required fields");
    }
    return isValid;
  };

  const resetForm = () => {
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
      induction_date: "",
      payment_type: "TRIP_BASED",
      per_trip_amount: "",
      monthly_package_rate: "",
      status: "IN_PROCESS",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Car</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car ID
                </label>
                <input
                  type="text"
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Name
                </label>
                <input
                  type="text"
                  name="car_name"
                  value={formData.car_name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Model
                </label>
                <input
                  type="text"
                  name="car_model"
                  value={formData.car_model}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Car
                </label>
                <select
                  name="type_of_car"
                  value={formData.type_of_car}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  {carTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Driver & Owner Information */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Driver & Owner Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Number
                </label>
                <input
                  type="text"
                  name="driver_number"
                  value={formData.driver_number}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Number
                </label>
                <input
                  type="text"
                  name="owner_number"
                  value={formData.owner_number}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="owner_account_number"
                  value={formData.owner_account_number}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  placeholder="Enter bank account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  {paymentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.payment_type === "TRIP_BASED" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Trip Amount
                  </label>
                  <input
                    type="number"
                    name="per_trip_amount"
                    value={formData.per_trip_amount}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Package Rate
                  </label>
                  <input
                    type="number"
                    name="monthly_package_rate"
                    value={formData.monthly_package_rate}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status and Additional Information */}
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Induction Date
                </label>
                <input
                  type="date"
                  name="induction_date"
                  value={formData.induction_date}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
