import React from 'react'
import Sidebar from './Sidebar'
import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/outline';

const cl = [
  {
    client_id: '1',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '2',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '3',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '4',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '5',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '6',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '7',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '8',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
  {
    client_id: '9',
    client_name: 'Amazon Pvt Limited',
    client_address: 'Silicon valley, South africa, 0689'
  },
];


const Clients = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="p-4 bg-white shadow rounded">
          <h1 className="font-bold text-4xl">
            Manage Clients
          </h1>
          <p className="text-gray-600 mt-2">
            You can add, remove or edit your clients here.
          </p>
        </div>

        <div>
              {cl.map((item) => (
                <div
                  key={item.client_id}
                  className="p-4 bg-white shadow rounded mt-4 cursor-pointer"
                  onClick={() => handleCompanyClick(item)}
                >

                  <h3 className="text-lg font-semibold">{item.client_id}. {item.client_name}</h3>
                  <p className="text-gray-600 mt-2">{item.client_address}</p>
                  <p className="text-gray-600 mt-2">{item.country}</p>
                  {/* <HomeIcon className="h-6 w-6 text-gray-400" /> */}
                </div>
                
              ))}
            </div>
      </div>
    </div>
  )
}

export default Clients