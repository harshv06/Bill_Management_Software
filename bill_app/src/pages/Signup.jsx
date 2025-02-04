// import React, { useState } from 'react';

// const ComponentA = () => <div>Component A</div>;
// const ComponentB = () => <div>Component B</div>;

// const Login = () => {
//   const [showComponentA, setShowComponentA] = useState(true);

//   const toggleComponent = () => {
//     setShowComponentA((prev) => !prev);
//   };

//   return (
//     <div>
//       <button onClick={toggleComponent}>
//         Toggle Component
//       </button>
//       {showComponentA ? <ComponentA /> : <ComponentB />}
//     </div>
//   );
// };

// export default Login;



import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


const Signup = () => {
  return (
    <div className='grid grid-cols-12 w-screen h-screen '>
      <div className='col-span-4  w-full h-full  p-20 text-gray-700'>
        <div>
          <img className='' src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?t=st=1738695792~exp=1738699392~hmac=d7bbef2c9928c815262f4ad8b74ac6fda986c6ce186e923426ca95f2829acf8a&w=740" alt="" />
        </div>
        <div className=''>
          <h1 className='font-bold '>Indias first car bill management solution</h1>
          <ul className=' p-5 leading-7 '>
            <li className='flex'>
              <img src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png" alt="" className='w-5 h-5 mt-1 mr-2' />
              <p>Automatic Download Bill From Server</p>
            </li>
            <li className='flex'>
              <img src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png" alt="" className='w-5 h-5 mt-1 mr-2' />
              <p>Access Anywhere, Anytime</p>
            </li>
            <li className='flex'>
              <img src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png" alt="" className='w-5 h-5 mt-1 mr-2' />
              <p>100% Accurate, Cloud Based & Secure</p>
            </li>
            <li className='flex'>
              <img src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png" alt="" className='w-5 h-5 mt-1 mr-2' />
              <p>Bill Management, Fleet  & More</p>
            </li>

          </ul>
          <p className='text-sm mt-10'> This management portal is a solution of <span className='text-blue-400'>Celsystech Pvt. Ltd  </span></p>
        </div>
      </div>
      <div className='col-span-8 bg-gray-100 w-full h-full  p-20 container'>

        <div className='justify-items-end '>
          <h1 className='text-blue-500 flex'>Support <img className='w-3 h-3 m-2' src="https://cdn-icons-png.flaticon.com/128/7572/7572096.png" alt="" />+91 8080125309</h1>
          <h1 className='text-blue-500 flex'>Sales <img className='w-3 h-3 m-2' src="https://cdn-icons-png.flaticon.com/128/7572/7572096.png" alt="" />+91 8080125309</h1>
        </div>

        <div className='bg-white p-14 w-120 ml-50 rounded-md drop-shadow-2xl mt-5 text-gray-600'>
          <h1 className=' text-2xl font-bold text-gray-600 text-center mb-5'>Celsystech</h1>
          <form action="" className='w-full'>
            <label htmlFor="email" className='mt-5'>Name</label>
            <br />
            <input type="text" className='border w-full mb-4 h-10 rounded-md p-2' />
            <br />
            <label htmlFor="email" className='mt-5'>Email</label>
            <br />
            <input type="email" className='border w-full mb-4 h-10 rounded-md p-2' />
            <br />
            <label htmlFor="email" className='mt-5'>Password</label>
            <br />
            <input type="password" className='border w-full mb-4 h-10 rounded-md p-2' />
            <label htmlFor="email" className='mt-5'>Confirm Password</label>
            <br />
            <input type="password" className='border w-full mb-4 h-10 rounded-md p-2' />
            <br />
            <button className='w-full h-10 bg-sky-600 rounded-md text-white font-semibold'>Sign Up</button>

          </form>
          <p className='mt-5 text-center'>Already have an Account?

            <Link to={'/login'} className="text-blue-700 cursor-pointer"> Login</Link>

          </p>
        </div>
        <div>

        </div>
      </div>
    </div>
  )
}

export default Signup