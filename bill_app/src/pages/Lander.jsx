import React, { useState } from 'react';
import "../style/Lander.css"

const Lander = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={" bg-gray-800 text-white transition-all duration-300 md:w-64 sidebar"}
      >
        {/* <button
          className="p-4 text-white focus:outline-none md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button> */}
        <div className="flex flex-col items-center md:items-start p-4 space-y-4">
          <h1 className="text-lg font-bold">Lander</h1>
          <nav className="flex flex-col space-y-2">
            <a href="#" className="p-2 rounded hover:bg-gray-700">Dashboard</a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">Invoices</a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">Clients</a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">Reports</a>
            <a href="#" className="p-2 rounded hover:bg-gray-700">Settings</a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <header className="flex justify-between items-center bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">Lander Dashboard</h1>
          <button
            className="p-2 bg-blue-500 text-white rounded md:hidden"
            // onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </header>

        <main className="mt-4">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Welcome to the Lander App</h2>
            <p className="text-gray-600 mt-2">
              This is the main dashboard where you can manage your billing operations.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Lander;
