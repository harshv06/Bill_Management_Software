// Fleet.js
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import AddItemModal from "./Modals/AddCarToFleetModal";
import EditCarModal from "./Modals/EditCarModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetData } from "../../store/FleetDataSlice";
import { useNavigate } from "react-router-dom";

const Fleet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.FleetData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    carData: null,
  });

  const API_BASE_URL = "http://192.168.0.106:5000/api/cars";

  useEffect(() => {
    dispatch(fetchFleetData());
  }, [dispatch]);

  const navigateToCarDetails = (car) => {
    navigate('/fleet/details', { state: { car } });
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete/${carId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete car");
        }

        dispatch(fetchFleetData());
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Failed to delete car");
      }
    }
  };

  const handleEdit = async (carData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update/${carData.car_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        throw new Error("Failed to update car");
      }

      dispatch(fetchFleetData());
      setEditModalData({ isOpen: false, carData: null });
    } catch (error) {
      console.error("Error updating car:", error);
      alert("Failed to update car");
    }
  };

  const handleAdd = async (carData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/AddCar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        throw new Error("Failed to add car");
      }

      dispatch(fetchFleetData());
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Failed to add car");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Fleet Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Car
          </button>
        </div>

        {/* List container */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          ) : data?.cars?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No cars available
            </div>
          ) : (
            <div>
              {/* Headers */}
              <div className="grid grid-cols-5 gap-4 p-4 font-bold bg-gray-50 border-b">
                <div>Car ID</div>
                <div>Name</div>
                <div>Model</div>
                <div>Service Date</div>
                <div>Actions</div>
              </div>

              {/* List items */}
              <ul className="divide-y divide-gray-200">
          {data?.cars?.map((car) => (
            <li
              key={car.car_id}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 items-center cursor-pointer"
              onClick={() => navigateToCarDetails(car)}
            >
              <div>{car.car_id}</div>
              <div>{car.car_name}</div>
              <div>{car.car_model}</div>
              <div>
                {new Date(car.DateOfService).toLocaleDateString()}
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleDelete(car.car_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    setEditModalData({
                      isOpen: true,
                      carData: car,
                    })
                  }
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
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
                className={`px-3 py-1 rounded ${
                  data.currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
        />

        {/* Edit Modal */}
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
