import React, { useEffect, useState } from "react";
import "../style/Lander.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanyPaymentRecordData,
  fetchMainData,
} from "../../store/fetchdataslice";
import Modal from "../components/Modal"; // Import the Modal component
import Sidebar from "../components/Sidebar";

const Lander = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [PaymentHistory, setPaymentHistory] = useState([]);
  const dispatch = useDispatch();
  // const data = 'xyxz';
  const { loading, data, error } = useSelector((state) => state.fetchData);

  useEffect(() => {
    dispatch(fetchMainData());
  }, [dispatch]);

  const handleCompanyClick = async (company) => {
    const temp = await fetchCompanyPaymentRecordData(company.company_id);
    setPaymentHistory(temp);
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const newdata = [
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
    {
      company_id: "001",
      company_name: "Aditya",
      city: "Pune",
      country: "India",
    },
  ];

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <h1 className="text-2xl font-bold">Main Content</h1>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <h1 className="text-2xl font-bold">Main Content</h1>

      <div id="section1" className="mt-8">
        <h2 className="text-xl font-semibold">Section 1</h2>
        <p>Content for Section 1...</p>
      </div>

      <div id="section2" className="mt-8">
        <h2 className="text-xl font-semibold">Section 2</h2>
        <p>Content for Section 2...</p>
      </div>

      <div id="section3" className="mt-8">
        <h2 className="text-xl font-semibold">Section 3</h2>
        <p>Content for Section 3...</p>
      </div>

      <div id="section4" className="mt-8">
        <h2 className="text-xl font-semibold">Section 4</h2>
        <p>Content for Section 4...</p>
      </div>
      <div id="section1" className="mt-8">
        <h2 className="text-xl font-semibold">Section 1</h2>
        <p>Content for Section 1...</p>
      </div>

      <div id="section2" className="mt-8">
        <h2 className="text-xl font-semibold">Section 2</h2>
        <p>Content for Section 2...</p>
      </div>

      <div id="section3" className="mt-8">
        <h2 className="text-xl font-semibold">Section 3</h2>
        <p>Content for Section 3...</p>
      </div>

      <div id="section4" className="mt-8">
        <h2 className="text-xl font-semibold">Section 4</h2>
        <p>Content for Section 4...</p>
      </div>
      <div id="section1" className="mt-8">
        <h2 className="text-xl font-semibold">Section 1</h2>
        <p>Content for Section 1...</p>
      </div>

      <div id="section2" className="mt-8">
        <h2 className="text-xl font-semibold">Section 2</h2>
        <p>Content for Section 2...</p>
      </div>

      <div id="section3" className="mt-8">
        <h2 className="text-xl font-semibold">Section 3</h2>
        <p>Content for Section 3...</p>
      </div>

      <div id="section4" className="mt-8">
        <h2 className="text-xl font-semibold">Section 4</h2>
        <p>Content for Section 4...</p>
      </div>
      <div id="section1" className="mt-8">
        <h2 className="text-xl font-semibold">Section 1</h2>
        <p>Content for Section 1...</p>
      </div>

      <div id="section2" className="mt-8">
        <h2 className="text-xl font-semibold">Section 2</h2>
        <p>Content for Section 2...</p>
      </div>

      <div id="section3" className="mt-8">
        <h2 className="text-xl font-semibold">Section 3</h2>
        <p>Content for Section 3...</p>
      </div>

      <div id="section4" className="mt-8">
        <h2 className="text-xl font-semibold">Section 4</h2>
        <p>Content for Section 4...</p>
      </div>
    </div>
    </div>
        {/* </div> */}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        company={selectedCompany}
        initialPaymentHistory={PaymentHistory}
      />
    </>
  );
};

export default Lander;
