import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./components/Register";
import Login from "./components/Login";
import ConferenceList from "./components/ConferenceList";
import ConferenceDetails from "./components/ConferenceDetails";
import ManageConferences from "./pages/ManageConferences";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUserStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        if (decoded.user && decoded.user.isAdmin) {
          setIsUserAdmin(true);
        } else {
          setIsUserAdmin(false);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        setIsLoggedIn(false);
        setIsUserAdmin(false);
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedIn(false);
      setIsUserAdmin(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsUserAdmin(false);
    navigate("/login");
  };

  const handleLoginSuccess = () => {
    checkUserStatus();
    navigate("/conferences");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Conference Booking System</h1>
        <nav>
          {isLoggedIn ? (
            <>
              {isUserAdmin && (
                <>
                  <Link to="/admin">Admin Dashboard</Link>
                  <Link to="/manage-conferences">Manage Conferences</Link>
                </>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link> |{" "}
              <Link to="/login">Login</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={<Login onLogin={handleLoginSuccess} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/conferences" element={<ConferenceList />} />
          <Route path="/conferences/:id" element={<ConferenceDetails />} />
          <Route path="/manage-conferences" element={<ManageConferences />} />
          <Route path="/" element={<ConferenceList />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
