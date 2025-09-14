import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import BackButton from "../components/BackButton";
import "../App.css";

const MySwal = withReactContent(Swal);

const AdminDashboard = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State to control content visibility
  const [showPendingUsers, setShowPendingUsers] = useState(false);
  const [showPendingBookings, setShowPendingBookings] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = {
        headers: {
          "x-auth-token": token,
        },
      };

      const [bookingsRes, usersRes] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/conferences/bookings/pending",
          config
        ),
        axios.get("http://localhost:5000/api/auth/admin/users", config),
      ]);

      setPendingBookings(bookingsRes.data);
      setPendingUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "x-auth-token": token,
        },
      };

      const res = await axios.put(
        `http://localhost:5000/api/auth/admin/approve/${userId}`,
        {},
        config
      );

      MySwal.fire({
        icon: "success",
        title: "Approved!",
        text: res.data.msg,
      });

      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
    } catch (err) {
      console.error(err.response.data);
      MySwal.fire({
        icon: "error",
        title: "Approval Failed",
        text: err.response.data.msg || "Something went wrong.",
      });
    }
  };

  const handleApproveBooking = async (bookingId) => {
    const { value: approvalMessage } = await MySwal.fire({
      title: "Approve Booking",
      input: "textarea",
      inputLabel: "Approval Message (optional)",
      inputPlaceholder: "Type your message here...",
      showCancelButton: true,
      confirmButtonText: "Approve",
      showLoaderOnConfirm: true,
      preConfirm: (message) => {
        return message;
      },
      allowOutsideClick: () => !MySwal.isLoading(),
    });

    if (approvalMessage !== undefined) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            "x-auth-token": token,
          },
        };

        const res = await axios.put(
          `http://localhost:5000/api/conferences/bookings/approve/${bookingId}`,
          { approvalMessage },
          config
        );

        MySwal.fire({
          icon: "success",
          title: "Approved!",
          text: res.data.msg,
        });

        fetchData();
      } catch (err) {
        console.error(err.response.data);
        MySwal.fire({
          icon: "error",
          title: "Approval Failed",
          text: err.response.data.msg || "Something went wrong.",
        });
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="list-header">
        <h2>Admin Dashboard</h2>
        <button onClick={fetchData} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="toggle-buttons">
        <button
          className={`toggle-btn ${showPendingUsers ? "active" : ""}`}
          onClick={() => setShowPendingUsers(!showPendingUsers)}
        >
          Pending Users
        </button>
        <button
          className={`toggle-btn ${showPendingBookings ? "active" : ""}`}
          onClick={() => setShowPendingBookings(!showPendingBookings)}
        >
          Pending Bookings
        </button>
      </div>

      {showPendingUsers && (
        <div className="dashboard-section">
          <h3>Pending Users</h3>
          {pendingUsers.length === 0 ? (
            <p>No new users to approve.</p>
          ) : (
            <ul className="user-list">
              {pendingUsers.map((user) => (
                <li key={user._id} className="user-item">
                  <p>
                    <strong>User:</strong> {user.name} ({user.email})
                  </p>
                  <button
                    className="approve-btn"
                    onClick={() => handleApproveUser(user._id)}
                  >
                    Approve User
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showPendingBookings && (
        <div className="dashboard-section">
          <h3>Pending Bookings</h3>
          {pendingBookings.length === 0 ? (
            <p>No pending bookings at the moment.</p>
          ) : (
            <ul className="booking-list">
              {pendingBookings.map((booking) => (
                <li key={booking._id} className="booking-item">
                  <p>
                    <strong>User:</strong> {booking.userId.name} (
                    {booking.userId.email})
                  </p>
                  <p>
                    <strong>Church:</strong> {booking.userId.churchName}
                  </p>
                  <p>
                    <strong>Conference:</strong> {booking.conferenceId.name}
                  </p>
                  <button
                    className="approve-btn"
                    onClick={() => handleApproveBooking(booking._id)}
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
