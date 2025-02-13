import React from 'react'
import { Link } from 'react-router-dom';
import '../style/Sidebar.css'



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
            <div className="w-70 h-screen sticky top-0  text-white p-6 sidebar-bg" >
                <div className='w-full h-full sidebar-glass'>

                    <h1 className="text-2xl font-bold">Matoshree Fleet</h1>
                    <nav className=" flex flex-col space-y-3 mt-8 font-semibold ">

                        <Link to={'/dashboard'} className=" rounded-4xl flex p-2 link-hover">
                            <img src="https://cdn-icons-png.flaticon.com/128/5187/5187508.png" className='  mt-1.5 ml-2 mr-3' alt="" />
                            Dashboard
                        </Link>
                        <Link to={'/invoices'} className=" rounded-4xl flex p-2 link-hover">
                            <img src="https://cdn-icons-png.flaticon.com/128/726/726182.png" className='  mt-1.5 ml-2 mr-3' alt="" />
                            Invoices
                        </Link>
                        <Link to={'/clients'} className=" rounded-4xl flex p-2 link-hover">
                            <img src="https://cdn-icons-png.flaticon.com/128/10426/10426399.png" className='  mt-1.5 ml-2 mr-3' alt="" />
                            Clients
                        </Link>

                        <Link to={'/reports'} className=" rounded-4xl flex p-2 link-hover">
                            <img src="https://cdn-icons-png.flaticon.com/128/3192/3192618.png   " className='  mt-1.5 ml-2 mr-3' alt="" />
                            Reports
                        </Link>
                        <Link to={'/fleet'} className=" rounded-4xl flex p-2 link-hover">
                            <img src="https://cdn-icons-png.flaticon.com/128/1023/1023757.png" className='  mt-1.5 ml-2 mr-3' alt="" />
                            Fleet
                        </Link>


                    </nav>
                    <div className='flex space-x-1 mt-90'>
                        <div className=' w-15 mr-3 '>
                            <img className='rounded-4xl shadow-2xl' src="https://imgs.search.brave.com/mu8DKvyus3h3nlEhzP-S8asSO4phnFo58dO221g-PHI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzEwLzA2/L2NhLzEwMDZjYTYx/Y2U4MmE4ODA1MGMz/YzczNGJmYzllNDU2/LmpwZw" alt="" />
                        </div>
                        <div className='mt-1'>
                            <h1 className='font-semibold'>Harsh Chamar</h1>
                            <p className='text-sm'>Bhima, Koregaon</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default Sidebar;