// pages/CarDetails.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CarDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { car } = location.state || {};
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://192.168.0.106:5000/api/cars";

//   useEffect(() => {
//     // Redirect if no car data
//     if (!car) {
//       navigate('/fleet');
//       return;
//     }

//     const fetchPaymentHistory = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${API_BASE_URL}/${car.car_id}/payments`);
//         if (!response.ok) throw new Error('Failed to fetch payment history');
//         const data = await response.json();
//         setPaymentHistory(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPaymentHistory();
//   }, [car, navigate]);

  if (!car) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/fleet')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Fleet
          </button>
          <h1 className="text-2xl font-bold">Car Details</h1>
        </div>

        {/* Car Details Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-600">Car ID:</label>
                    <p className="font-medium">{car.car_id}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Name:</label>
                    <p className="font-medium">{car.car_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Model:</label>
                    <p className="font-medium">{car.car_model}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Last Service Date:</label>
                    <p className="font-medium">
                      {new Date(car.DateOfService).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
                {/* Add more car details here */}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <button
                onClick={() => {/* Handle add payment */}}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Payment
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading payment history...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : paymentHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payment history available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;