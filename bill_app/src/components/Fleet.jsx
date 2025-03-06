import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import AddItemModal from "./Modals/AddCarToFleetModal";
import EditCarModal from "./Modals/EditCarModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetData } from "../../store/FleetDataSlice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { PERMISSIONS } from "../config/permissions";
import config from "../utils/GlobalConfig";
import SalaryCalculationModal from "./Modals/SalaryModal/SalaryCalculationModal";
import SalaryHistoryList from "./CustomComponents/SalaryHistoryList";

const Fleet = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.FleetData);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showSalaryHistory, setShowSalaryHistory] = useState(false);
  // State declarations
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    carData: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Constants
  const filterOptions = [
    { value: "ALL", label: "All Cars" },
    { value: "ACTIVE", label: "Active Cars" },
    { value: "INACTIVE", label: "Inactive Cars" },
    { value: "IN_PROCESS", label: "In Process Cars" },
  ];

  // Fetch fleet data on component mount
  useEffect(() => {
    dispatch(fetchFleetData());
  }, [dispatch]);

  // Memoized filtered cars
  const filteredCars = useMemo(() => {
    if (!data?.cars) return [];

    return data.cars.filter((car) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch =
        car.car_id.toLowerCase().includes(searchString) ||
        car.car_name.toLowerCase().includes(searchString) ||
        car.car_model.toLowerCase().includes(searchString);

      const matchesStatus =
        statusFilter === "ALL" || car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // Handlers
  const navigateToCarDetails = (car) => {
    navigate("/fleet/details", { state: { car } });
  };

  const handleDelete = async (carId) => {
    if (!user?.permissions?.includes(PERMISSIONS.CARS.DELETE)) {
      alert("You do not have permission to delete cars.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const response = await fetch(
          `${config.API_BASE_URL}/cars/delete/${carId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete car");
        }

        dispatch(fetchFleetData());
        alert("Car deleted successfully");
      } catch (error) {
        console.error("Error deleting car:", error);
        alert(error.message || "Failed to delete car");
      }
    }
  };

  const handleEdit = async (carData) => {
    if (!user?.permissions?.includes(PERMISSIONS.CARS.UPDATE)) {
      alert("You do not have permission to edit cars.");
      return;
    }

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/cars/update/${carData.car_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(carData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update car");
      }

      dispatch(fetchFleetData());
      setEditModalData({ isOpen: false, carData: null });
      alert("Car updated successfully");
    } catch (error) {
      console.error("Error updating car:", error);
      alert(error.message || "Failed to update car");
    }
  };

  const handleAdd = async (carData) => {
    if (!user?.permissions?.includes(PERMISSIONS.CARS.CREATE)) {
      alert("You do not have permission to add cars.");
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/cars/AddCar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add car");
      }

      dispatch(fetchFleetData());
      setIsAddModalOpen(false);
      alert("Car added successfully");
    } catch (error) {
      console.error("Error adding car:", error);
      alert(error.message || "Failed to add car");
    }
  };

  // Render Helpers
  const renderAddButton = () => {
    if (user?.permissions?.includes(PERMISSIONS.CARS.CREATE)) {
      return (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Add New Car
        </button>
      );
    }
    return null;
  };

  const renderSalaryButton = () => (
    <button
      onClick={() => setShowSalaryModal(true)}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
    >
      Calculate Salary
    </button>
  );

  const renderActionButtons = (car) => {
    return (
      <div className="flex gap-2">
        {user?.permissions?.includes(PERMISSIONS.CARS.DELETE) && (
          <button
            onClick={() => handleDelete(car.car_id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            Delete
          </button>
        )}
        {user?.permissions?.includes(PERMISSIONS.CARS.UPDATE) && (
          <button
            onClick={() =>
              setEditModalData({
                isOpen: true,
                carData: car,
              })
            }
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
          <div className="flex gap-2">
            {renderAddButton()}
            {renderSalaryButton()}
            <button
              onClick={() => setShowSalaryHistory(true)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Salary History
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-4">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === option.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Car ID, Name, or Model"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Cars List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full"></div>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          ) : filteredCars.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No cars found</div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-4 font-bold bg-gray-50 border-b">
                <div>Car ID</div>
                <div>Name</div>
                <div>Model</div>
                <div>Status</div>
                <div>Payment Type</div>
                <div>Actions</div>
              </div>

              {/* Table Body */}
              <ul>
                {filteredCars.map((car) => (
                  <li
                    key={car.car_id}
                    className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 items-center border-b"
                    onClick={() => navigateToCarDetails(car)}
                  >
                    <div>{car.car_id}</div>
                    <div>{car.car_name}</div>
                    <div>{car.car_model}</div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          car.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : car.status === "INACTIVE"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {car.status}
                      </span>
                    </div>
                    <div>{car.payment_type}</div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex gap-2"
                    >
                      {renderActionButtons(car)}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            {Array.from({ length: data.pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => dispatch(fetchFleetData(i + 1))}
                className={`px-3 py-1 rounded transition-colors ${
                  data.currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Modals */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
        />

        <EditCarModal
          isOpen={editModalData.isOpen}
          onClose={() => setEditModalData({ isOpen: false, carData: null })}
          onEdit={handleEdit}
          carData={editModalData.carData}
        />

        <SalaryCalculationModal
          isOpen={showSalaryModal}
          onClose={() => setShowSalaryModal(false)}
          cars={data?.cars || []}
          onGenerateReport={(reportData) => {
            // Handle report generation
            console.log("Report Data:", reportData);
          }}
        />

        <SalaryHistoryList
          isOpen={showSalaryHistory}
          onClose={() => setShowSalaryHistory(false)}
        />
      </div>
    </div>
  );
};

export default Fleet;
