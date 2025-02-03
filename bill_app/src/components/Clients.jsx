import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyData } from "../../store/CompanyDataSlice";
import { useNavigate } from "react-router-dom";
import AddCompanyModal from "./Modals/AddCompanyModal";
import EditCompanyModal from "./Modals/EditCompanyModal";
// import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/outline';

const cl = [
  {
    client_id: "1",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "2",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "3",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "4",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "5",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "6",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "7",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "8",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
  {
    client_id: "9",
    client_name: "Amazon Pvt Limited",
    client_address: "Silicon valley, South africa, 0689",
  },
];

const Clients = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.CompanyData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    company: null,
  });

  const API_BASE_URL = "http://172.20.10.3:5000/api/getAllCompanies";

  useEffect(() => {
    loadCompanies(currentPage);
  }, [currentPage, dispatch]);

  const loadCompanies = (page) => {
    dispatch(
      fetchCompanyData({
        page,
        limit: itemsPerPage,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCompanyData());
  }, [dispatch]);

  // Add the handleEdit function
  const handleEdit = async (updatedData) => {
    try {
      const response = await fetch(
        `http://192.168.0.106:5000/api/updateCompany/${editModalData.company.company_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      dispatch(fetchCompanyData());
      setEditModalData({ isOpen: false, company: null });
    } catch (error) {
      console.error("Error updating company:", error);
      alert("Failed to update company");
    }
  };

  const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `http://192.168.0.106:5000/api/deleteCompany/${companyId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete company");
        }

        dispatch(fetchCompanyData());
      } catch (error) {
        console.error("Error deleting company:", error);
        alert("Failed to delete company");
      }
    }
  };

  const navigateToCompanyDetails = (company) => {
    navigate("/clients/details", { state: { company } });
  };
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manage Clients</h1>
            <p className="text-gray-600 mt-1">
              You can add, remove or edit your clients here.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Client
          </button>
        </div>

        {/* List container */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          ) : data?.companies?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No companies available
            </div>
          ) : (
            <div>
              {/* Headers */}
              <div className="grid grid-cols-6 gap-8 p-4 font-bold bg-gray-50 border-b">
                <div>Company ID</div>
                <div>Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Phone</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* List items */}
              <ul className="divide-y divide-gray-200">
                {data?.companies?.map((company) => (
                  <li
                    key={company.company_id}
                    className="grid grid-cols-6 gap-8 p-6 hover:bg-gray-50 items-center cursor-pointer"
                    onClick={() => navigateToCompanyDetails(company)}
                  >
                    <div className="truncate">
                      {company.registration_number}
                    </div>
                    <div className="truncate">{company.company_name}</div>
                    <div className="truncate col-span-1">{company.email}</div>
                    <div className="truncate col-span-1">{company.phone}</div>
                    <div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          company.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status}
                      </span>
                    </div>
                    <div
                      className="flex gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDelete(company.company_id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          /* Handle edit */
                          setEditModalData({ isOpen: true, company });
                        }}
                        className="text-blue-500 hover:text-blue-700 font-medium"
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

        {data?.total > itemsPerPage && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, data.total)} of {data.total}{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: data.pages }, (_, i) => {
                // Show limited page numbers with ellipsis
                if (
                  i === 0 || // First page
                  i === data.pages - 1 || // Last page
                  (i >= currentPage - 2 && i <= currentPage) || // 2 pages before current
                  (i >= currentPage && i <= currentPage + 1) // 1 page after current
                ) {
                  return (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  i === 1 || // Show ellipsis after first page
                  i === data.pages - 2 // Show ellipsis before last page
                ) {
                  return (
                    <span key={i} className="px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, data.pages))
                }
                disabled={currentPage === data.pages}
                className={`px-3 py-1 rounded ${
                  currentPage === data.pages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Add Modal Component */}
        {isAddModalOpen && (
          <AddCompanyModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={async (companyData) => {
              try {
                const response = await fetch(
                  `http://192.168.0.106:5000/api/addCompany`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(companyData),
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to add company");
                }

                dispatch(fetchCompanyData());
                setIsAddModalOpen(false);
              } catch (error) {
                console.error("Error adding company:", error);
                alert("Failed to add company");
              }
            }}
          />
        )}

        {editModalData.isOpen && (
          <EditCompanyModal
            isOpen={editModalData.isOpen}
            onClose={() => setEditModalData({ isOpen: false, company: null })}
            onEdit={handleEdit}
            companyData={editModalData.company}
          />
        )}
      </div>
    </div>
  );
};

export default Clients;
