import React from 'react'
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <>
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="bg-gray-800 text-white transition-all duration-300 md:w-64 sidebar">
                <div className="flex flex-col items-center md:items-start p-4 space-y-4">
                    <h1 className="text-lg font-bold">Lander</h1>
                    <nav className="flex flex-col space-y-2">
                       
                        <Link to={'/'} className="p-2 rounded hover:bg-gray-700">Dashboard</Link>
                        <Link to={'/invoices'} className="p-2 rounded hover:bg-gray-700">Invoices</Link>
                        <Link to={'/clients'} className="p-2 rounded hover:bg-gray-700">Clients</Link>
                        <Link to={'/reports'} className="p-2 rounded hover:bg-gray-700">Reports</Link>
                        <Link to={'/fleet'} className="p-2 rounded hover:bg-gray-700">Fleet</Link>
                        
                       
                    </nav>
                </div>
            </div>
        </div>
        </>
    );
};

export default Sidebar;