import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import AddItemModal from "./Modals/AddCarToFleetModal";
import EditCarModal from "./Modals/EditCarModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetData } from "../../store/FleetDataSlice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { PERMISSIONS } from "../config/permissions";

const Fleet = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.FleetData);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    carData: null,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE_URL = "http://192.168.0.106:5000/api/cars";

  // Fetch fleet data on component mount
  useEffect(() => {
    dispatch(fetchFleetData());
  }, [dispatch]);

  // Memoized filtered cars to improve performance
  const filteredCars = useMemo(() => {
    if (!data?.cars) return [];

    return data.cars.filter((car) => {
      const searchString = searchTerm.toLowerCase();
      return (
        car.car_id.toLowerCase().includes(searchString) ||
        car.car_name.toLowerCase().includes(searchString) ||
        car.car_model.toLowerCase().includes(searchString)
      );
    });
  }, [data, searchTerm]);

  // Navigation and Action Handlers
  const navigateToCarDetails = (car) => {
    navigate("/fleet/details", { state: { car } });
  };

  const handleDelete = async (carId) => {
    // Check delete permission
    if (!user?.permissions?.includes(PERMISSIONS.CARS.DELETE)) {
      alert("You do not have permission to delete cars.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete/${carId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

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
    // Check edit permission
    if (!user?.permissions?.includes(PERMISSIONS.CARS.UPDATE)) {
      alert("You do not have permission to edit cars.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update/${carData.car_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(carData),
      });

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
    // Check create permission
    if (!user?.permissions?.includes(PERMISSIONS.CARS.CREATE)) {
      alert("You do not have permission to add cars.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/AddCar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const renderActionButtons = (carex) => {
    return (
      <div className="flex gap-2">
        {user?.permissions?.includes(PERMISSIONS.CARS.DELETE) && (
          <button
            onClick={() => handleDelete(carex.car_id)}
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
                carData: carex,
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
          {renderAddButton()}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Car ID, Name, or Model"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* List Container */}
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
            <div>
              {/* Table Headers */}
              <div className="grid grid-cols-5 gap-4 p-4 font-bold bg-gray-50 border-b">
                <div>Car ID</div>
                <div>Name</div>
                <div>Model</div>
                <div>Service Date</div>
                <div>Actions</div>
              </div>

              {/* Car List */}
              <ul>
                {filteredCars.map((carex) => (
                  <li
                    key={carex.car_id}
                    className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 items-center border-b last:border-b-0 transition-colors"
                    onClick={() => navigateToCarDetails(carex)}
                  >
                    <div>{carex.car_id}</div>
                    <div>{carex.car_name}</div>
                    <div>{carex.car_model}</div>
                    <div>
                      {new Date(carex.induction_date).toLocaleDateString()}
                    </div>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActionButtons(carex)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
      </div>
    </div>
  );
};

export default Fleet;