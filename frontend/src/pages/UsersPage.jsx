import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    status: "Active",
    role: "User",
    joined: "",
    lastActive: "Just now",
  });

  const rowsPerPage = 10;

  // Sample Data
  useEffect(() => {
    setUsers([
      { name: "Sri Abhigna", email: "abhigna182@gmail.com", username: "abhigna182", status: "Active", role: "Admin", joined: "October 1, 2025", lastActive: "1 minute ago" },
      { name: "Mrittika Das", email: "mrittika2711@gmail.com", username: "mrittika2711", status: "Inactive", role: "User", joined: "October 5, 2025", lastActive: "1 day ago" },
      { name: "Pranay Jain", email: "p.jain@gmail.com", username: "pranay71", status: "Banned", role: "User", joined: "OCtober 8, 2025", lastActive: "4 days ago" },
      { name: "Chirag Dev", email: "chirav49@gmail.com", username: "chirag49", status: "Pending", role: "Volunteer", joined: "October 5, 2025", lastActive: "10 days ago" },
      { name: "Gayathri MH", email: "gayathri77@gmail.com", username: "gayathri77", status: "Suspended", role: "User", joined: "October 11, 2025", lastActive: "3 months ago" },
      { name: "Debosmita Samanta", email: "d.samanta@gmail.com", username: "debosmita22", status: "Active", role: "Volunteer", joined: "October 3, 2025", lastActive: "1 week ago" },
      { name: "Harsha P H", email: "harsha.p@gmail.com", username: "harsha0", status: "Active", role: "Volunteer", joined: "September 23, 2025", lastActive: "4 hours ago" },
      { name: "Dhivya Shreetha", email: "shreetha32@gmail.com", username: "shreetha32", status: "Banned", role: "User", joined: "October 14, 2025", lastActive: "2 months ago" },
      { name: "Feny Baria", email: "feny009@gmail.com", username: "feny009", status: "Suspended", role: "User", joined: "October 6, 2025", lastActive: "3 hours ago" },
      { name: "Dhyan J Prakash", email: "dhyan.p@gmail.com", username: "dhyan", status: "Active", role: "Admin", joined: "October 10, 2025", lastActive: "15 minutes ago" },
    ]);
  }, []);

  // Filters
  const filteredUsers = users.filter((u) => {
    return (
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter ? u.role === roleFilter : true) &&
      (statusFilter ? u.status === statusFilter : true)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // Delete
  const handleDelete = (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      setUsers(users.filter((u) => u.username !== username));
    }
  };

  // Add User Button Click
  const handleAddUser = () => {
    setEditMode(false);
    setFormData({
      name: "",
      email: "",
      username: "",
      status: "Active",
      role: "User",
      joined: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      lastActive: "Just now",
    });
    setShowModal(true);
  };

  // Edit User
  const handleEditUser = (user) => {
    setEditMode(true);
    setFormData(user);
    setShowModal(true);
  };

  // Save (Add or Edit)
  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.username) {
      alert("Please fill all fields");
      return;
    }

    if (editMode) {
      // Update existing user
      setUsers(users.map((u) => (u.username === formData.username ? formData : u)));
      alert("User updated successfully!");
    } else {
      // Add new user
      setUsers([...users, formData]);
      alert("User added successfully!");
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border rounded-lg px-3 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option>Admin</option>
          <option>Moderator</option>
          <option>User</option>
          <option>Guest</option>
          <option>Volunteer</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Pending</option>
          <option>Suspended</option>
          <option>Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Full Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Username</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Joined Date</th>
              <th className="py-3 px-4 text-left">Last Active</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{u.name}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : u.status === "Inactive"
                        ? "bg-gray-200 text-gray-700"
                        : u.status === "Banned"
                        ? "bg-red-100 text-red-700"
                        : u.status === "Pending"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-2 px-4">{u.role}</td>
                <td className="py-2 px-4">{u.joined}</td>
                <td className="py-2 px-4">{u.lastActive}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-2"
                    onClick={() => handleEditUser(u)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(u.username)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? "Edit User" : "Add User"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Full Name"
                className="border px-3 py-2 rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Username"
                className="border px-3 py-2 rounded"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={editMode} // username fixed on edit
              />
              <select
                className="border px-3 py-2 rounded"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option>Admin</option>
                <option>User</option>
                <option>Volunteer</option>
                <option>Moderator</option>
                <option>Guest</option>
              </select>
              <select
                className="border px-3 py-2 rounded"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
                <option>Suspended</option>
                <option>Banned</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
