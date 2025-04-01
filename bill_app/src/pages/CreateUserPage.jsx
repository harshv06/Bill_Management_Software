import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ROLE_PERMISSIONS, PERMISSIONS } from "../config/permissions";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import config from "../utils/GlobalConfig";

const CreateUserPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "VIEWER",
    is_active: true,
    permissions: [],
  });

  const [users, setUsers] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");
    setUserData((prev) => ({ ...prev, password }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${config.API_BASE_URL}/create`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User created successfully");
      fetchUsers();
      // Reset form
      setUserData({
        username: "",
        email: "",
        password: "",
        role: "VIEWER",
        is_active: true,
        permissions: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);

    // Parse permissions
    let userPermissions = [];
    try {
      // Check if permissions are a string (JSON)
      if (typeof user.permissions === "string") {
        userPermissions = JSON.parse(user.permissions);
      }
      // If it's already an array, use it directly
      else if (Array.isArray(user.permissions)) {
        userPermissions = user.permissions;
      }
      // Fallback to empty array
      else {
        userPermissions = [];
      }
    } catch (parseError) {
      console.error("Error parsing user permissions:", parseError);
      userPermissions = [];
    }

    // Set selected permissions
    setSelectedUserPermissions(userPermissions);
  };

  const handlePermissionChange = (permission) => {
    setSelectedUserPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const saveUserPermissions = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/${editingUser.user_id}/permissions`,
        { permissions: selectedUserPermissions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Permissions updated successfully");
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.API_BASE_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const formatPermissionName = (permission) => {
    return permission
      .split(":")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const PermissionCheckbox = ({ category, permission }) => {
    const isChecked = selectedUserPermissions.includes(permission);

    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          id={permission}
          checked={isChecked}
          onChange={() => handlePermissionChange(permission)}
          className={`mr-2 h-4 w-4 ${
            isChecked
              ? "text-blue-600 border-blue-300 focus:ring-blue-500"
              : "text-gray-300 border-gray-300"
          }`}
        />
        <label
          htmlFor={permission}
          className={`select-none ${
            isChecked ? "text-blue-700 font-semibold" : "text-gray-700"
          }`}
        >
          {formatPermissionName(permission)}
        </label>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Role Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Creation Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaPlus className="mr-2" /> Create New User
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">User Name</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Password</label>
                <div className="flex">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2 mr-2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="bg-gray-200 px-3 rounded"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-blue-500 text-white px-3 rounded ml-2"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2">Role</label>
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                >
                  {Object.keys(ROLE_PERMISSIONS).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={userData.is_active}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label>Active User</label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Create User
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-2 flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Permission Edit Modal */}

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-full h-full flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  Edit Permissions for {editingUser.username}
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(PERMISSIONS).map(
                    ([category, permissions]) => (
                      <div key={category} className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-3 text-lg capitalize border-b pb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(permissions).map((permission) => (
                            <PermissionCheckbox
                              key={permission}
                              category={category}
                              permission={permission}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUserPermissions}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaSave className="mr-2" /> Save Permissions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
