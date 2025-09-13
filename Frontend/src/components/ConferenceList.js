import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

const ConferenceList = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConferences = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: {
          "x-auth-token": token,
        },
      };

      const res = await axios.get(
        "http://localhost:5000/api/conferences",
        config
      );
      setConferences(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch conferences.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  if (loading) {
    return <div>Loading conferences...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="conferences-container">
      <div className="list-header">
        <h2>Available Conferences</h2>
        <button onClick={fetchConferences} className="refresh-btn">
          Refresh
        </button>
      </div>
      {conferences.length === 0 ? (
        <p>No conferences available at the moment.</p>
      ) : (
        <div className="conference-list">
          {conferences.map((conference) => (
            <Link
              key={conference._id}
              to={`/conferences/${conference._id}`}
              className="conference-card-link"
            >
              <div className="conference-card">
                <h3>{conference.name}</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(conference.startDate).toLocaleDateString()} -{" "}
                  {new Date(conference.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Location:</strong> {conference.location}
                </p>
                <p>{conference.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConferenceList;
