import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetData } from "../../store/FleetDataSlice";
import CarAllocationModal from "./Modals/ReportModals/PaymentInformationModal";
import Config from "../utils/GlobalConfig";
import ReportsSubmenu from "./CustomComponents/ReportSubMenu";
import { debounce } from "lodash";

const Reports = () => {
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Refs
  const searchInputRef = useRef(null);
  const debouncedFetchRef = useRef(
    debounce((dispatch, params) => {
      dispatch(fetchFleetData(params));
    }, 300)
  ).current;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cars, pagination, loading, error } = useSelector(
    (state) => state.FleetData
  );

  // Fetch fleet data with pagination and filters
  useEffect(() => {
    const fetchParams = {
      page: currentPage,
      limit: 9,
      search: searchTerm,
      status: statusFilter === "ALL" ? "" : statusFilter,
    };

    debouncedFetchRef(dispatch, fetchParams);
  }, [currentPage, searchTerm, statusFilter, dispatch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    // Maintain focus
    requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        const length = value.length;
        searchInputRef.current.setSelectionRange(length, length);
      }
    });
  };

  const handleCarSelect = (car) => {
    setSelectedCar(car);
    setIsAllocationModalOpen(true);
  };

  // Status filter options
  const statusOptions = [
    { value: "ALL", label: "All Cars" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "IN_PROCESS", label: "In Process" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error}
        <button
          onClick={() => dispatch(fetchFleetData())}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Fleet Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReportsSubmenu(true)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Reports
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border rounded pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cars Grid */}
        <div className="flex-1 overflow-y-auto">
          {cars.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No cars found
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.car_id}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleCarSelect(car)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{car.car_name}</h2>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
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
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Car ID:</span>
                      <span className="font-medium">{car.car_id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{car.car_model}</span>
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
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 p-4">
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
        {isAllocationModalOpen && (
          <CarAllocationModal
            isOpen={isAllocationModalOpen}
            onClose={() => setIsAllocationModalOpen(false)}
            car={selectedCar}
          />
        )}

        {showReportsSubmenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ReportsSubmenu onClose={() => setShowReportsSubmenu(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;