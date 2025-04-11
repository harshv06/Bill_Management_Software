import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import AddItemModal from "./Modals/AddCarToFleetModal";
import EditCarModal from "./Modals/EditCarModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetData } from "../../store/FleetDataSlice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext.jsx";
import { PERMISSIONS } from "../config/permissions";
import config from "../utils/GlobalConfig";
import SalaryCalculationModal from "./Modals/SalaryModal/SalaryCalculationModal";
import SalaryHistoryList from "./CustomComponents/SalaryHistoryList";

const Fleet = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cars, pagination, loading, error } = useSelector(
    (state) => state.FleetData
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("car_id");
  const [sortOrder, setSortOrder] = useState("ASC");
  const itemsPerPage = 10; // Number of items per page

  // Constants
  const filterOptions = [
    { value: "ALL", label: "All Cars" },
    { value: "ACTIVE", label: "Active Cars" },
    { value: "INACTIVE", label: "Inactive Cars" },
    { value: "IN_PROCESS", label: "In Process Cars" },
  ];

  // Fetch fleet data on component mount
  useEffect(() => {
    dispatch(
      fetchFleetData({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // const filteredAndPaginatedCars = useMemo(() => {
  //   if (!data?.cars) return [];

  //   const filtered = data.cars.filter((car) => {
  //     const searchString = searchTerm.toLowerCase();
  //     const matchesSearch =
  //       car.car_id.toLowerCase().includes(searchString) ||
  //       car.car_name.toLowerCase().includes(searchString) ||
  //       car.car_model.toLowerCase().includes(searchString);

  //     const matchesStatus =
  //       statusFilter === "ALL" || car.status === statusFilter;

  //     return matchesSearch && matchesStatus;
  //   });

  //   // Pagination logic
  //   const startIndex = (currentPage - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;
  //   return filtered.slice(startIndex, endIndex);
  // }, [data, searchTerm, statusFilter, currentPage]);

  // const totalPages = useMemo(() => {
  //   if (!data?.cars) return 0;
  //   const filteredCars = data.cars.filter((car) => {
  //     const searchString = searchTerm.toLowerCase();
  //     const matchesSearch =
  //       car.car_id.toLowerCase().includes(searchString) ||
  //       car.car_name.toLowerCase().includes(searchString) ||
  //       car.car_model.toLowerCase().includes(searchString);

  //     const matchesStatus =
  //       statusFilter === "ALL" || car.status === statusFilter;

  //     return matchesSearch && matchesStatus;
  //   });
  //   return Math.ceil(filteredCars.length / itemsPerPage);
  // }, [data, searchTerm, statusFilter]);

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 overflow-y-auto flex-shrink-0" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header and Filters (Fixed) */}
        <div className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Fleet Management
            </h1>
            <div className="flex gap-2">
              {renderAddButton()}
              {renderSalaryButton()}
              <button
                onClick={() => setShowSalaryHistory(true)}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
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
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
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
              className="w-full p-3 border rounded-md"
            />
          </div>
        </div>

        {/* Cars List */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg m-4">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full"></div>
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">Error: {error}</div>
            ) : cars.length === 0 ? (
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
                  {cars.map((car) => (
                    <li
                      key={car.car_id}
                      className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 items-center border-b cursor-pointer"
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
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  pagination.currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.totalPages)
                )
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
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
          cars={cars || []}
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
