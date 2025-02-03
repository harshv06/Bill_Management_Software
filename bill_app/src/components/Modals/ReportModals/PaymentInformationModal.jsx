import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CarAllocationModal = ({ isOpen, onClose, car }) => {
  // Initialize state with default values of 0
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",

    // Salary Calculation Inputs
    dailyRate: 0,
    workingDaysRate: 0,

    // Deduction Inputs
    taxDeductionRate: 0,
    holidayDeductionRate: 0,
    penaltyRate: 0,

    // Additional Inputs
    totalWorkingDays: 0,
    holidays: 0,
  });

  const [advancePaymentList, setAdvancePaymentList] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);

  // Fetch advance payments
  const fetchAdvancePayments = async () => {
    try {
      const { startDate, endDate } = formData;

      const response = await fetch(
        `http://192.168.0.106:5000/api/cars/${car.car_id}/advance-payments?startDate=${startDate}&endDate=${endDate}`
      );

      const data = await response.json();

      if (data.status === "success") {
        // Convert string amounts to numbers and parse dates
        const processedPayments = data.payments.map((payment) => ({
          ...payment,
          amount: parseFloat(payment.amount),
          payment_date: new Date(payment.payment_date),
        }));

        setAdvancePaymentList(processedPayments);
      } else {
        throw new Error("Failed to fetch advance payments");
      }
    } catch (error) {
      console.error("Error fetching advance payments:", error);
    }
  };

  // Handle input changes with forced 0 default
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value),
    }));
  };

  // Calculate total advance payments
  const calculateTotalAdvancePayments = () => {
    return advancePaymentList.reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Main calculation method
  const calculateAllocation = () => {
    const {
      dailyRate,
      workingDaysRate,
      taxDeductionRate,
      holidayDeductionRate,
      penaltyRate,
      totalWorkingDays,
      holidays,
    } = formData;

    // Calculate working days
    const effectiveWorkingDays = totalWorkingDays - holidays;

    // Calculate gross salary
    const grossSalary =
      dailyRate * effectiveWorkingDays + workingDaysRate * effectiveWorkingDays;

    // Calculate deductions
    const taxDeduction = grossSalary * (taxDeductionRate / 100);
    const holidayDeduction = grossSalary * (holidayDeductionRate / 100);
    const penaltyDeduction = grossSalary * (penaltyRate / 100);
    const advancePaymentTotal = calculateTotalAdvancePayments();

    // Calculate net salary
    const totalDeductions =
      taxDeduction + holidayDeduction + penaltyDeduction + advancePaymentTotal;
    const netSalary = grossSalary - totalDeductions;

    // Create calculation result
    const result = {
      carDetails: {
        carId: car.car_id,
        carName: car.car_name,
        carModel: car.car_model,
      },
      periodDetails: {
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      salaryDetails: {
        dailyRate,
        workingDaysRate,
        totalWorkingDays,
        effectiveWorkingDays,
        grossSalary,
      },
      deductionDetails: {
        taxDeduction,
        holidayDeduction,
        penaltyDeduction,
        advancePaymentTotal,
        totalDeductions,
      },
      finalDetails: {
        netSalary,
      },
    };

    setCalculationResult(result);
  };

  // PDF Generation
  const generatePDF = () => {
    if (!calculationResult) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Salary Allocation Report", 14, 22);

    // Period Details
    doc.setFontSize(12);
    doc.text(
      `Period: ${calculationResult.periodDetails.startDate} to ${calculationResult.periodDetails.endDate}`,
      14,
      32
    );

    // Car Details Table
    doc.autoTable({
      startY: 40,
      head: [["Detail", "Value"]],
      body: [
        ["Car ID", calculationResult.carDetails.carId],
        ["Car Name", calculationResult.carDetails.carName],
        ["Car Model", calculationResult.carDetails.carModel],
      ],
      theme: "plain",
    });

    // Advance Payments Table
    doc.autoTable({
      head: [["Payment Date", "Amount", "Notes"]],
      body: advancePaymentList.map((payment) => [
        payment.payment_date.toLocaleDateString(),
        `₹${payment.amount.toFixed(2)}`,
        payment.notes || "N/A",
      ]),
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Salary Details Table
    doc.autoTable({
      head: [["Salary Detail", "Value"]],
      body: [
        [
          "Daily Rate",
          `₹${calculationResult.salaryDetails.dailyRate.toFixed(2)}`,
        ],
        [
          "Working Days Rate",
          `₹${calculationResult.salaryDetails.workingDaysRate.toFixed(2)}`,
        ],
        [
          "Total Working Days",
          calculationResult.salaryDetails.totalWorkingDays,
        ],
        [
          "Effective Working Days",
          calculationResult.salaryDetails.effectiveWorkingDays,
        ],
        [
          "Gross Salary",
          `₹${calculationResult.salaryDetails.grossSalary.toFixed(2)}`,
        ],
      ],
      theme: "plain",
    });

    // Deduction Details Table
    doc.autoTable({
      head: [["Deduction Detail", "Value"]],
      body: [
        [
          "Tax Deduction",
          `₹${calculationResult.deductionDetails.taxDeduction.toFixed(2)}`,
        ],
        [
          "Holiday Deduction",
          `₹${calculationResult.deductionDetails.holidayDeduction.toFixed(2)}`,
        ],
        [
          "Penalty Deduction",
          `₹${calculationResult.deductionDetails.penaltyDeduction.toFixed(2)}`,
        ],
        [
          "Advance Payment Total",
          `₹${calculationResult.deductionDetails.advancePaymentTotal.toFixed(
            2
          )}`,
        ],
        [
          "Total Deductions",
          `₹${calculationResult.deductionDetails.totalDeductions.toFixed(2)}`,
        ],
      ],
      theme: "plain",
    });

    // Final Details Table
    doc.autoTable({
      head: [["Final Detail", "Value"]],
      body: [
        [
          "Net Salary",
          `₹${calculationResult.finalDetails.netSalary.toFixed(2)}`,
        ],
      ],
      theme: "plain",
    });

    // Save the PDF
    doc.save(`salary_allocation_${car.car_id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      <div className="relative w-full max-w-4xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Modal Header */}
          <div className="flex justify-between p-5 border-b">
            <h3 className="text-xl font-semibold">
              Salary Allocation - {car.car_name}
              {formData.startDate && formData.endDate && (
                <span className="text-sm text-gray-500 ml-4">
                  ({formData.startDate} to {formData.endDate})
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Date Range Selection */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Fetch Advance Payments Button */}
            <button
              onClick={fetchAdvancePayments}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
            >
              Fetch Advance Payments
            </button>

            {/* Salary Calculation Inputs */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Daily Rate</label>
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Working Days Rate</label>
                <input
                  type="number"
                  name="workingDaysRate"
                  value={formData.workingDaysRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Total Working Days</label>
                <input
                  type="number"
                  name="totalWorkingDays"
                  value={formData.totalWorkingDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Deduction Inputs */}
              <div>
                <label className="block mb-2">Tax Deduction Rate (%)</label>
                <input
                  type="number"
                  name="taxDeductionRate"
                  value={formData.taxDeductionRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Holiday Deduction Rate (%)</label>
                <input
                  type="number"
                  name="holidayDeductionRate"
                  value={formData.holidayDeductionRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Penalty Rate (%)</label>
                <input
                  type="number"
                  name="penaltyRate"
                  value={formData.penaltyRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Holidays Input */}
              <div>
                <label className="block mb-2">Holidays</label>
                <input
                  type="number"
                  name="holidays"
                  value={formData.holidays}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Advance Payments List */}
            {advancePaymentList.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Advance Payments</h4>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Amount</th>
                      <th className="border p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advancePaymentList.map((payment, index) => (
                      <tr key={index}>
                        <td className="border p-2">
                          {payment.payment_date.toLocaleDateString()}
                        </td>
                        <td className="border p-2">
                          ₹{payment.amount.toFixed(2)}
                        </td>
                        <td className="border p-2">{payment.notes || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-right">
                  <strong>
                    Total Advance Payments: ₹
                    {calculateTotalAdvancePayments().toFixed(2)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t">
            <button
              onClick={calculateAllocation}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
            >
              Calculate
            </button>
            {calculationResult && (
              <button
                onClick={generatePDF}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Generate PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded ml-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarAllocationModal;
