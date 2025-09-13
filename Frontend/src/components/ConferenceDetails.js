import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../App.css"; // تأكد من وجود هذا السطر

const MySwal = withReactContent(Swal);

const ConferenceDetails = () => {
  const { id } = useParams(); // تم تغيير conferenceId إلى id
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    const fetchAllDetails = async () => {
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

        // Fetch conference details first
        const conferenceRes = await axios.get(
          `http://localhost:5000/api/conferences/${id}`, // تم تغيير conferenceId إلى id
          config
        );
        setConference(conferenceRes.data);

        // Then, fetch the user's bookings and find the one for this conference
        const bookingsRes = await axios.get(
          "http://localhost:5000/api/conferences/mybookings",
          config
        );
        const booking = bookingsRes.data.find(
          (b) => b.conferenceId && b.conferenceId._id === id // تم تغيير conferenceId إلى id
        );

        if (booking) {
          setUserBooking(booking);
        }

        setLoading(false);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        setError("Failed to fetch conference details. Please try again.");
        setLoading(false);
      }
    };
    fetchAllDetails();
  }, [id, navigate]);

  const handleBook = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      };

      const res = await axios.post(
        `http://localhost:5000/api/conferences/register-conference/${id}`, // تم تغيير conferenceId إلى id
        {},
        config
      );

      MySwal.fire({
        icon: "success",
        title: "Booking successful!",
        text: res.data.msg,
      });

      const updatedBookingRes = await axios.get(
        "http://localhost:5000/api/conferences/mybookings",
        config
      );
      const updatedBooking = updatedBookingRes.data.find(
        (b) => b.conferenceId && b.conferenceId._id === id // تم تغيير conferenceId إلى id
      );
      if (updatedBooking) {
        setUserBooking(updatedBooking);
      }
    } catch (err) {
      console.error(err.response.data);
      MySwal.fire({
        icon: "error",
        title: "Booking Failed",
        text: err.response.data.msg || "Something went wrong.",
      });
    }
  };

  const handleCancel = async () => {
    if (!userBooking || !userBooking._id) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "You do not have an active booking to cancel.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "x-auth-token": token,
        },
      };

      const res = await axios.put(
        `http://localhost:5000/api/conferences/cancel-booking/${userBooking._id}`,
        {},
        config
      );

      MySwal.fire({
        icon: "success",
        title: "Cancellation successful!",
        text: res.data.msg,
      });

      setUserBooking(null); // Reset user's booking state
    } catch (err) {
      console.error(err.response.data);
      MySwal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: err.response.data.msg || "Something went wrong.",
      });
    }
  };

  if (loading) {
    return <h2>Loading conference details...</h2>;
  }

  if (error) {
    return <h2 style={{ color: "red" }}>{error}</h2>;
  }

  if (!conference) {
    return <h2>Conference not found.</h2>;
  }

  let actionButton;
  if (userBooking && userBooking.bookingStatus === "approved") {
    actionButton = (
      <button className="cancel-btn" onClick={handleCancel}>
        Cancel Booking
      </button>
    );
  } else if (userBooking && userBooking.bookingStatus === "pending") {
    actionButton = (
      <button className="pending-btn" disabled>
        Pending Approval
      </button>
    );
  } else {
    actionButton = (
      <button className="book-btn" onClick={handleBook}>
        Book a spot
      </button>
    );
  }

  return (
    <div className="conference-details-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        &larr; Back
      </button>
      <h2>{conference.name}</h2>
      <p>
        <strong>Description:</strong> {conference.description}
      </p>
      <p>
        <strong>Location:</strong> {conference.location}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(conference.startDate).toLocaleDateString()} -{" "}
        {new Date(conference.endDate).toLocaleDateString()}
      </p>
      <p>
        <strong>Available Slots:</strong> {conference.availableSlots}
      </p>

      {/* Display the approval message */}
      {userBooking && userBooking.bookingStatus === "approved" && (
        <div className="approved-message">
          <p>✅ **تمت الموافقة!**</p>
          <p>{userBooking.adminApprovalMessage}</p>
        </div>
      )}

      <div className="details-buttons">{actionButton}</div>
    </div>
  );
};

export default ConferenceDetails;
