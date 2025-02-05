import { BrowserRouter as Router, Routes, Route, Link,useNavigate } from "react-router-dom";
import React, { useState, useEffect,  } from 'react';


const Login = () => {


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hardcoded credentials for demo
  const validUsername = 'user123@gmail.com';
  const validPassword = 'password123';

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple validation
    if (username === validUsername && password === validPassword) {
      navigate('/dashboard'); // Redirect to dashboard
    } else {
      setError('Invalid username or password');
    }
  }


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

        <div className='bg-white p-14 w-120 ml-50 rounded-md drop-shadow-2xl mt-10 text-gray-600'>
          <h1 className=' text-2xl font-bold text-gray-600 text-center mb-5'>Celsystech</h1>

          <form action="" onSubmit={handleLogin} className='w-full'>
            <label htmlFor="email" className='mt-5'>Email</label>
            <br />
            <input
              type="email"
              id="username"
              value={username}
              className='border w-full mb-5 h-10 rounded-md p-2'
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <label htmlFor="password" className='mt-5'>Password</label>
            <br />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='border w-full mb-5 h-10 rounded-md p-2'
              required
            />
            <br />
            <button type="submit" className='w-full h-10 bg-sky-600 rounded-md text-white font-semibold'>Sign in</button>

          </form>
          <p className='mt-5 text-center'>New on Our Platform?

            <Link to={'/signup'} className="text-blue-700 cursor-pointer"> Create an Account</Link>

          </p>
        </div>
        <div>

        </div>
      </div>
    </div>
  );
};

export default Login