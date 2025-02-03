import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFleetData } from '../../store/FleetDataSlice';
import CarAllocationModal from './Modals/ReportModals/PaymentInformationModal';
// import CarAllocationModal from '../components/Modals/CarAllocationModal';

const Reports = () => {
  const [cars, setCars] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch=useDispatch();
  const { data, loading, error } = useSelector((state) => state.FleetData);

  const API_BASE_URL = "http://192.168.0.106:5000/api";

  useEffect(() => {
    dispatch(fetchFleetData());
  }, []);


  const handleCarSelect = (car) => {
    setSelectedCar(car);
    setIsAllocationModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error}
        <button 
          onClick={fetchCars} 
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Fleet Management</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.cars.map((car) => (
            <div 
              key={car.car_id} 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleCarSelect(car)}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{car.car_name}</h2>
                <span className="text-sm text-gray-500">{car.car_model}</span>
              </div>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Car ID:</span>
                  <span className="font-medium">{car.car_id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{car.type_of_car}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Induction Date:</span>
                  <span className="font-medium">
                    {new Date(car.induction_date).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Modal */}
        {isAllocationModalOpen && (
          <CarAllocationModal
            isOpen={isAllocationModalOpen}
            onClose={() => setIsAllocationModalOpen(false)}
            car={selectedCar}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;