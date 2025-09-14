import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          "x-auth-token": "YOUR_ADMIN_TOKEN_HERE",
        },
      };

      const res = await axios.get(
        "http://localhost:5000/api/users/all",
        config
      );
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users. Please check your admin token.");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const config = {
        headers: {
          "x-auth-token": "YOUR_ADMIN_TOKEN_HERE",
        },
      };

      await axios.put(
        `http://localhost:5000/api/users/approve/${userId}`,
        {},
        config
      );

      // بعد الموافقة، بنعيد جلب البيانات عشان نعرض الحالة الجديدة
      fetchUsers();
    } catch (err) {
      console.error("Failed to approve user:", err);
      alert("Failed to approve user.");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h4>All Registered Users</h4>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Church</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.churchName}</td>
                <td>{user.status}</td>
                <td>
                  {user.status === "pending" && (
                    <button onClick={() => handleApprove(user._id)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
