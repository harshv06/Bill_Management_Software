import React, { useState } from "react";

const Modal = ({ isOpen, onClose, company, initialPaymentHistory }) => {
  if (!isOpen) return null;

  // Manage payment history state
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);

  // Calculate the total sum of payments
  const totalSum = initialPaymentHistory.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  // Function to add a new payment
  const addNewPayment = () => {
    const newPayment = {
      payment_date: new Date().toISOString(),
      amount: Math.floor(Math.random() * 100) + 1, // Random amount for demonstration
    };
    setPaymentHistory([...paymentHistory, newPayment]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{company.company_name}</h2>
        <p className="text-gray-700 mb-2">{company.city}, {company.country}</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Payment History</h3>
        <div className="max-h-60 overflow-y-auto">
          {paymentHistory.map((item, index) => (
            <div key={index} className="flex justify-between p-2 border-b">
              <span className="text-gray-600">{item.payment_date.split("T")[0]}</span>
              <span className="text-gray-800 font-medium">${parseFloat(item.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 font-semibold">
          <span>Total:</span>
          <span>${totalSum.toFixed(2)}</span>
        </div>

        <button
          className="mt-4 p-2 bg-green-500 text-white rounded w-full"
          onClick={addNewPayment}
        >
          Add New Payment
        </button>

        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;