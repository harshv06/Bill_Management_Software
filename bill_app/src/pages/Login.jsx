import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");

    try {
      // Call login method from AuthContext
      const response = await login(formData.email, formData.password);
      console.log(response);
      // Show success toast
      toast.success("Login successful");

      // Redirect based on role
      switch (response.user.user.role) {
        case "SUPER_ADMIN":
          navigate("/dashboard");
          break;
        case "ADMIN":
          navigate("/dashboard");
          break;
        case "MANAGER":
          navigate("/fleet");
          break;
        case "OPERATOR":
          navigate("/clients");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      // Handle login error
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="grid grid-cols-12 w-screen h-screen ">
      <div className="col-span-4  w-full h-full  p-20 text-gray-700">
        <div>
          <img
            className=""
            src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?t=st=1738695792~exp=1738699392~hmac=d7bbef2c9928c815262f4ad8b74ac6fda986c6ce186e923426ca95f2829acf8a&w=740"
            alt=""
          />
        </div>
        <div className="">
          <h1 className="font-bold ">
            Indias first car bill management solution
          </h1>
          <ul className=" p-5 leading-7 ">
            <li className="flex">
              <img
                src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
                alt=""
                className="w-5 h-5 mt-1 mr-2"
              />
              <p>Automatic Download Bill From Server</p>
            </li>
            <li className="flex">
              <img
                src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
                alt=""
                className="w-5 h-5 mt-1 mr-2"
              />
              <p>Access Anywhere, Anytime</p>
            </li>
            <li className="flex">
              <img
                src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
                alt=""
                className="w-5 h-5 mt-1 mr-2"
              />
              <p>100% Accurate, Cloud Based & Secure</p>
            </li>
            <li className="flex">
              <img
                src="https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
                alt=""
                className="w-5 h-5 mt-1 mr-2"
              />
              <p>Bill Management, Fleet & More</p>
            </li>
          </ul>
          <p className="text-sm mt-10">
            {" "}
            This management portal is a solution of{" "}
            <span className="text-blue-400">Celsystech Pvt. Ltd </span>
          </p>
        </div>
      </div>
      <div className="col-span-8 bg-gray-100 w-full h-full  p-20 container">
        <div className="justify-items-end ">
          <h1 className="text-blue-500 flex">
            Support{" "}
            <img
              className="w-3 h-3 m-2"
              src="https://cdn-icons-png.flaticon.com/128/7572/7572096.png"
              alt=""
            />
            +91 8080125309
          </h1>
          <h1 className="text-blue-500 flex">
            Sales{" "}
            <img
              className="w-3 h-3 m-2"
              src="https://cdn-icons-png.flaticon.com/128/7572/7572096.png"
              alt=""
            />
            +91 8080125309
          </h1>
        </div>

        <div className="bg-white p-14 w-120 ml-50 rounded-md drop-shadow-2xl mt-10 text-gray-600">
          <h1 className="text-2xl font-bold text-gray-600 text-center mb-5">
            Login to Celsystech
          </h1>

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleLogin} className="w-full">
            <label htmlFor="email" className="mt-5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border w-full mb-5 h-10 rounded-md p-2"
              required
            />

            <label htmlFor="password" className="mt-5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border w-full mb-5 h-10 rounded-md p-2"
              required
            />

            <button
              type="submit"
              className="w-full h-10 bg-sky-600 rounded-md text-white font-semibold"
            >
              Sign In
            </button>
          </form>

          <p className="mt-5 text-center">
            New on Our Platform?
            <Link to={"/signup"} className="text-blue-700 cursor-pointer">
              {" "}
              Create an Account
            </Link>
          </p>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Login;
