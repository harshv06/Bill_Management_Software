import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import config from "../../../utils/GlobalConfig";

const SalaryCalculationModal = ({
  isOpen,
  onClose,
  cars,
  onGenerateReport,
}) => {
  const [salaryData, setSalaryData] = useState([]);
  const [isEditing, setIsEditing] = useState(true);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cars) {
      setSalaryData(
        cars.map((car) => ({
          ...car,
          tds_percentage: 0,
          holiday_penalty_percentage: 0,
          other_penalty_percentage: 0,
          total_trips: 0,
          working_days: 30,
          advance_amount: 0,
          remarks: "",
        }))
      );
    }
  }, [cars]);

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.API_BASE_URL}/salary-data`);
        const data = await response.json();
        console.log(data);

        // Fetch advance payments for each car
        const carsWithAdvances = await Promise.all(
          data.map(async (car) => {
            const advanceResponse = await fetch(
              `${config.API_BASE_URL}/${car.car_id}/advance-payments`
            );
            const { total_advance } = await advanceResponse.json();

            return {
              ...car,
              tds_percentage: 0,
              holiday_penalty_percentage: 0,
              other_penalty_percentage: 0,
              total_trips: 0,
              working_days: 30,
              advance_amount: total_advance || 0,
              remarks: "",
              // Auto-populate rate based on payment type
              rate:
                car.payment_type === "TRIP_BASED"
                  ? car.per_trip_amount
                  : car.monthly_package_rate,
            };
          })
        );

        setSalaryData(carsWithAdvances);
      } catch (error) {
        console.error("Error fetching salary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSalaryData();
    }
  }, [isOpen]);

  const saveSalaryCalculation = async () => {
    if (!calculatedData) return;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const calculationData = {
      start_date: startDate,
      end_date: new Date(),
      total_amount: calculatedData.reduce(
        (sum, car) => sum + car.net_amount,
        0
      ),
      calculation_data: calculatedData,
    };
    console.log(calculationData);
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/salary/salary-calculations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(calculationData),
        }
      );

      if (!response.ok) throw new Error("Failed to save calculation");

      // After successful save, export to Excel
      exportToExcel();
      onClose();
    } catch (error) {
      console.error("Error saving calculation:", error);
      alert("Failed to save calculation");
    }
  };

  const handleDataChange = (carId, field, value) => {
    setSalaryData((prev) =>
      prev.map((car) => {
        if (car.car_id === carId) {
          return { ...car, [field]: value };
        }
        return car;
      })
    );
  };

  const calculateSalary = () => {
    const calculated = salaryData.map((car) => {
      let grossAmount = 0;

      if (car.payment_type === "TRIP_BASED") {
        grossAmount = car.rate * car.total_trips;
      } else {
        grossAmount = (car.rate / 30) * car.working_days;
      }

      const tdsAmount = (grossAmount * car.tds_percentage) / 100;
      const holidayPenalty =
        (grossAmount * car.holiday_penalty_percentage) / 100;
      const otherPenalty = (grossAmount * car.other_penalty_percentage) / 100;
      const totalDeductions =
        tdsAmount +
        holidayPenalty +
        otherPenalty +
        parseFloat(car.advance_amount || 0);

      return {
        ...car,
        gross_amount: grossAmount,
        tds_amount: tdsAmount,
        holiday_penalty_amount: holidayPenalty,
        other_penalty_amount: otherPenalty,
        total_deductions: totalDeductions,
        net_amount: grossAmount - totalDeductions,
      };
    });

    setCalculatedData(calculated);
    setIsEditing(false);
  };

  const exportToExcel = () => {
    if (!calculatedData) return;

    const workbook = XLSX.utils.book_new();

    // Detailed worksheet
    const detailsData = calculatedData.map((car) => ({
      "Car ID": car.car_id,
      "Car Name": car.car_name,
      "Driver Name": car.driver_name,
      "Driver Number": car.driver_name,
      "Owner Name": car.owner_name,
      "Owner Number": car.owner_number,
      "Account Number": car.owner_account_number,
      "IFSC Code": car.ifsc_code,
      "Payment Type": car.payment_type,
      Rate:
        car.payment_type === "TRIP_BASED"
          ? car.per_trip_amount
          : car.monthly_package_rate,
      "Trips/Days":
        car.payment_type === "TRIP_BASED" ? car.total_trips : car.working_days,
      "Gross Amount": car.gross_amount.toFixed(2),
      "TDS (%)": car.tds_percentage,
      "TDS Amount": car.tds_amount.toFixed(2),
      "Holiday Penalty (%)": car.holiday_penalty_percentage,
      "Holiday Penalty": car.holiday_penalty_amount.toFixed(2),
      "Other Penalty (%)": car.other_penalty_percentage,
      "Other Penalty": car.other_penalty_amount.toFixed(2),
      "Advance Amount": car.advance_amount,
      "Total Deductions": car.total_deductions.toFixed(2),
      "Net Amount": car.net_amount.toFixed(2),
      Remarks: car.remarks,
    }));

    const ws = XLSX.utils.json_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(workbook, ws, "Salary Details");

    // Summary worksheet
    const summaryData = [
      {
        "Total Cars": calculatedData.length,
        "Total Gross Amount": calculatedData
          .reduce((sum, car) => sum + car.gross_amount, 0)
          .toFixed(2),
        "Total TDS": calculatedData
          .reduce((sum, car) => sum + car.tds_amount, 0)
          .toFixed(2),
        "Total Penalties": calculatedData
          .reduce(
            (sum, car) =>
              sum + car.holiday_penalty_amount + car.other_penalty_amount,
            0
          )
          .toFixed(2),
        "Total Advances": calculatedData
          .reduce((sum, car) => sum + parseFloat(car.advance_amount || 0), 0)
          .toFixed(2),
        "Total Net Amount": calculatedData
          .reduce((sum, car) => sum + car.net_amount, 0)
          .toFixed(2),
      },
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWs, "Summary");

    XLSX.writeFile(
      workbook,
      `salary_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Salary Calculation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {isEditing ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                      Car Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      Trips/Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      TDS %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      Holiday Penalty %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      Other Penalty %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Advance Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaryData.map((car) => (
                    <tr key={car.car_id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {car.car_name} ({car.car_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.driver_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.payment_type === "TRIP_BASED"
                            ? "Trip Based"
                            : "Package Based"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          ₹{car.rate}
                          <span className="text-xs text-gray-500 ml-1">
                            {car.payment_type === "TRIP_BASED"
                              ? "/trip"
                              : "/month"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-24 text-right"
                            value={
                              car.payment_type === "TRIP_BASED"
                                ? car.total_trips
                                : car.working_days
                            }
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                car.payment_type === "TRIP_BASED"
                                  ? "total_trips"
                                  : "working_days",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-24 text-right"
                            value={car.tds_percentage}
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                "tds_percentage",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-24 text-right"
                            value={car.holiday_penalty_percentage}
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                "holiday_penalty_percentage",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-24 text-right"
                            value={car.other_penalty_percentage}
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                "other_penalty_percentage",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-24 text-right"
                            value={car.advance_amount}
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                "advance_amount",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="text"
                            className="border rounded px-3 py-2 w-full"
                            value={car.remarks}
                            onChange={(e) =>
                              handleDataChange(
                                car.car_id,
                                "remarks",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={calculateSalary}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Calculate
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calculatedData.map((car) => (
                    <tr key={car.car_id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {car.car_name} ({car.car_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.driver_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        ₹{car.gross_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          TDS: ₹{car.tds_amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Holiday Penalty: ₹
                          {car.holiday_penalty_amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Other Penalty: ₹{car.other_penalty_amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Advance: ₹{car.advance_amount}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          Total: ₹{car.total_deductions.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ₹{car.net_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Edit
              </button>
              <button
                onClick={saveSalaryCalculation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save & Export
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculationModal;
