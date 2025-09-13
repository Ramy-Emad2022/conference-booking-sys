import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import BackButton from "../components/BackButton";
import "../App.css";

const MySwal = withReactContent(Swal);

const ManageConferences = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConference, setCurrentConference] = useState({
    id: null,
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    totalSlots: "",
  });
  const navigate = useNavigate();

  const fetchConferences = async () => {
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

      // CHANGE THIS LINE
      const res = await axios.get(
        "http://localhost:5000/api/conferences", // Correct URL
        config
      );

      setConferences(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch conferences. Please log in again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentConference({
      ...currentConference,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/conferences/${currentConference.id}`,
          currentConference,
          config
        );
        MySwal.fire("Updated!", "Conference has been updated.", "success");
      } else {
        await axios.post(
          "http://localhost:5000/api/conferences",
          currentConference,
          config
        );
        MySwal.fire("Created!", "Conference has been created.", "success");
      }

      resetForm();
      fetchConferences();
    } catch (err) {
      console.error(err.response.data);
      MySwal.fire(
        "Error!",
        err.response.data.msg || "Failed to save conference.",
        "error"
      );
    }
  };

  const handleEdit = (conference) => {
    setIsEditing(true);
    setCurrentConference({
      id: conference._id,
      name: conference.name,
      description: conference.description,
      location: conference.location,
      startDate: conference.startDate.split("T")[0],
      endDate: conference.endDate.split("T")[0],
      totalSlots: conference.availableSlots,
    });
  };

  const handleDelete = async (conferenceId) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            "x-auth-token": token,
          },
        };
        await axios.delete(
          `http://localhost:5000/api/conferences/${conferenceId}`,
          config
        );
        MySwal.fire("Deleted!", "Conference has been deleted.", "success");
        fetchConferences();
      } catch (err) {
        console.error(err);
        MySwal.fire("Error!", "Failed to delete conference.", "error");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentConference({
      id: null,
      name: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      totalSlots: "",
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="manage-conferences-container">
      <BackButton />
      <div className="list-header">
        <h2>Manage Conferences</h2>
        <button onClick={fetchConferences} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="content-wrapper">
        <div className="card conference-form-section">
          <h3>{isEditing ? "Edit Conference" : "Add New Conference"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={currentConference.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={currentConference.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={currentConference.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={currentConference.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={currentConference.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Slots:</label>
              <input
                type="number"
                name="totalSlots"
                value={currentConference.totalSlots}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditing ? "Update Conference" : "Add Conference"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="conference-list-section card">
          <h3>Current Conferences</h3>
          {conferences.length === 0 ? (
            <p>No active conferences found.</p>
          ) : (
            <ul className="conference-list">
              {conferences.map((conference) => (
                <li key={conference._id} className="conference-item">
                  <div className="conference-info">
                    <h4>{conference.name}</h4>
                    <p>
                      <strong>Location:</strong> {conference.location}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(conference.startDate).toLocaleDateString()} -{" "}
                      {new Date(conference.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Slots:</strong> {conference.availableSlots} /{" "}
                      {conference.totalSlots}
                    </p>
                  </div>
                  <div className="conference-actions">
                    <button
                      onClick={() => handleEdit(conference)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(conference._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageConferences;
