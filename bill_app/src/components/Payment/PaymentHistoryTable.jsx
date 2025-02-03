import React from "react";
import jsPDF from "jspdf";

const PaymentHistoryTable = ({ payments, onDelete, onEdit }) => {
  const handleViewReceipt = (payment) => {
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(20);
    doc.text("Payment Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Receipt Number: ${payment.receipt_number}`, 20, 40);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, 50);
    doc.text(`Amount: $${parseFloat(payment.amount).toFixed(2)}`, 20, 60);
    doc.text(`Payment Method: ${payment.payment_method}`, 20, 70);
    doc.text(`Payment Mode: ${payment.payment_mode}`, 20, 80);
    doc.text(`Status: ${payment.status}`, 20, 90);
    doc.text(`Notes: ${payment.notes || 'N/A'}`, 20, 100);

    // Open the PDF in a new tab
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Receipt No.
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Method
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Mode
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {payments.map((payment) => (
          <tr key={payment.payment_id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {payment.receipt_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(payment.payment_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${parseFloat(payment.amount).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span className="capitalize">{payment.payment_method}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span className="capitalize">{payment.payment_mode}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  payment.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : payment.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : payment.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {payment.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewReceipt(payment)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Receipt
                </button>
                <button
                  onClick={() => onEdit(payment)}
                  className="text-green-600 hover:text-green-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(payment)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaymentHistoryTable;