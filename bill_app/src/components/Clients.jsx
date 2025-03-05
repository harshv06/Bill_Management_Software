import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyData } from "../../store/CompanyDataSlice";
import { useNavigate } from "react-router-dom";
import AddCompanyModal from "./Modals/AddCompanyModal";
import EditCompanyModal from "./Modals/EditCompanyModal";
import Config from "../utils/GlobalConfig.js";

const Clients = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.CompanyData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editModalData, setEditModalData] = useState({
    isOpen: false,
    company: null,
  });

  useEffect(() => {
    dispatch(
      fetchCompanyData({
        page: currentPage,
        limit: itemsPerPage,
      })
    );
  }, [currentPage, dispatch]);

  const handleAdd = async (companyData) => {
    console.log("Company Data:",companyData);
    try {
      const response = await fetch(`${Config.API_BASE_URL}/addCompany`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        throw new Error("Failed to add company");
      }

      dispatch(fetchCompanyData());
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding company:", error);
      alert("Failed to add company");
    }
  };

  const handleEdit = async (updatedData) => {
    try {
      const response = await fetch(
        `${Config.API_BASE_URL}/updateCompany/${editModalData.company.company_id}`,
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
          `${Config.API_BASE_URL}/deleteCompany/${companyId}`,
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
              View and manage your client companies
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
              <div className="grid grid-cols-4 gap-4 p-4 font-bold bg-gray-50 border-b">
                <div>Company Name</div>
                <div>Client Type</div>
                <div>Contact</div>
                <div>Actions</div>
              </div>

              {/* List items */}
              <ul className="divide-y divide-gray-200">
                {data?.companies?.map((company) => (
                  <li
                    key={company.company_id}
                    className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 items-center cursor-pointer"
                    onClick={() => navigateToCompanyDetails(company)}
                  >
                    <div className="flex items-center">
                      <div>
                        <p className="font-semibold">{company.company_name}</p>
                        <p className="text-sm text-gray-500">
                          {company.gst_number}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="capitalize">
                        {company.client_type.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <p>{company.email}</p>
                      <p className="text-sm text-gray-500">{company.phone}</p>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModalData({ isOpen: true, company });
                        }}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(company.company_id);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pagination */}
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

              {Array.from({ length: data.pages }, (_, i) => (
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
              ))}

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
            onAdd={handleAdd}
          />
        )}

        {/* Edit Modal Component */}
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
