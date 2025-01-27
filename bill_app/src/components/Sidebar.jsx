import React from 'react'
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <>
            {/* <div className="inline-block bg-gray-800 h-screen">
            
            <div className=" bg-gray-800 text-white transition-all duration-300 md:w-64 sidebar">
                <div className="fixed items-center md:items-start p-4 space-y-4">
                    <h1 className="text-lg font-bold">Lander</h1>
                    <nav className="  flex flex-col space-y-2">
                       
                        <Link to={'/'} className="p-2 rounded hover:bg-gray-700">Dashboard</Link>
                        <Link to={'/invoices'} className="p-2 rounded hover:bg-gray-700">Invoices</Link>
                        <Link to={'/clients'} className="p-2 rounded hover:bg-gray-700">Clients</Link>
                        <Link to={'/reports'} className="p-2 rounded hover:bg-gray-700">Reports</Link>
                        <Link to={'/fleet'} className="p-2 rounded hover:bg-gray-700">Fleet</Link>
                        
                       
                    </nav>
                </div>
            </div>
        </div> */}
            <div className="w-64 h-screen sticky top-0 bg-gray-800 text-white p-4">
                
                <h1 className="text-lg font-bold">Lander</h1>
                    <nav className="  flex flex-col space-y-2">
                       
                        <Link to={'/'} className="p-2 rounded hover:bg-gray-700">Dashboard</Link>
                        <Link to={'/invoices'} className="p-2 rounded hover:bg-gray-700">Invoices</Link>
                        <Link to={'/clients'} className="p-2 rounded hover:bg-gray-700">Clients</Link>
                        <Link to={'/reports'} className="p-2 rounded hover:bg-gray-700">Reports</Link>
                        <Link to={'/fleet'} className="p-2 rounded hover:bg-gray-700">Fleet</Link>
                        
                       
                    </nav>
            </div>
        </>
    );
};

export default Sidebar;