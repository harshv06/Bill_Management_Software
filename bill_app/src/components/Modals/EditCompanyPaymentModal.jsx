import React, { useState } from 'react';

const EditCompanyPaymentModal = ({ 
  isOpen, 
  onClose, 
  payment, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    amount: payment.amount,
    payment_method: payment.payment_method,
    payment_mode: payment.payment_mode,
    payment_date: new Date(payment.payment_date).toISOString().split('T')[0],
    status: payment.status,
    notes: payment.notes || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(payment.payment_id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">Edit Payment</h2>
        <form onSubmit={handleSubmit}>
          {/* Add form fields similar to AddPaymentModal */}
          {/* ... */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyPaymentModal;
