import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    birthdate: "",
    phoneNumber: "", // تم التغيير هنا
    churchName: "",
    address: "",
  });

  const {
    name,
    email,
    password,
    birthdate,
    phoneNumber,
    churchName,
    address,
  } = // تم التغيير هنا
    formData;
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      MySwal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: res.data.msg,
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      console.error(err.response.data);
      MySwal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response.data.msg || "Something went wrong.",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="birthdate">Birthdate</label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={birthdate}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber" // تم التغيير هنا
            name="phoneNumber" // تم التغيير هنا
            value={phoneNumber} // تم التغيير هنا
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="churchName">Church Name</label>
          <input
            type="text"
            id="churchName"
            name="churchName"
            value={churchName}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
