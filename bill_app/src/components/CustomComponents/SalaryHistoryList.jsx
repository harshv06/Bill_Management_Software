import { useState,useEffect } from "react";
import config from '../../utils/GlobalConfig'
import { format } from "date-fns";

// components/SalaryHistoryList.js
const SalaryHistoryList = ({ isOpen, onClose }) => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching salary history...");
    fetchSalaryHistory();
  }, []);

  const fetchSalaryHistory = async () => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/salary/salary-calculations`
      );
      const data = await response.json();
      console.log(data)
      setSalaryHistory(data);
    } catch (error) {
      console.error("Error fetching salary history:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (id) => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/salary-calculations/${id}/toggle-status`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to update status");
      fetchSalaryHistory();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[80%] max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Salary Calculation History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
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
              {salaryHistory.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4">
                    {format(new Date(record.start_date), "dd/MM/yyyy")} -
                    {format(new Date(record.end_date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    ₹{record.total_amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        record.payment_status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePaymentStatus(record.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `${config.API_BASE_URL}/salary-calculations/${record.id}/download`
                        )
                      }
                      className="ml-2 text-green-500 hover:text-green-700"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalaryHistoryList;
