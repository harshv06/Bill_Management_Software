import React, { useEffect, useState } from "react";
import "../style/Lander.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyPaymentRecordData, fetchMainData } from "../../store/fetchdataslice";
import Modal from "../components/Modal"; // Import the Modal component

const Lander = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [PaymentHistory,setPaymentHistory]=useState([]);
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.fetchData);

  useEffect(() => {
    dispatch(fetchMainData());
  }, [dispatch]);

  const handleCompanyClick = async(company) => {
    const temp=await fetchCompanyPaymentRecordData(company.company_id);
    setPaymentHistory(temp);
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white transition-all duration-300 md:w-64 sidebar">
        <div className="flex flex-col items-center md:items-start p-4 space-y-4">
          <h1 className="text-lg font-bold">Lander</h1>
          <nav className="flex flex-col space-y-2">
            <a href="#" className="p-2 rounded hover:bg-gray-700">
              Dashboard
            </a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">
              Invoices
            </a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">
              Clients
            </a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">
              Reports
            </a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">
              Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <header className="flex justify-between items-center bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">Lander Dashboard</h1>
          <button className="p-2 bg-blue-500 text-white rounded md:hidden">
            ☰
          </button>
        </header>

        <main className="mt-4">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Welcome to the Lander App</h2>
            <p className="text-gray-600 mt-2">
              This is the main dashboard where you can manage your billing
              operations.
            </p>
          </div>
          <div>
            {data.map((item) => (
              <div
                key={item.company_id}
                className="p-4 bg-white shadow rounded mt-4 cursor-pointer"
                onClick={() => handleCompanyClick(item)}
              >
                <h3 className="text-lg font-semibold">{item.company_name}</h3>
                <p className="text-gray-600 mt-2">{item.city}</p>
                <p className="text-gray-600 mt-2">{item.country}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        company={selectedCompany}
        initialPaymentHistory={PaymentHistory}
      />
    </div>
  );
};

export default Lander;
