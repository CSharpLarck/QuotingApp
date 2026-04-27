import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleRegisterUser = () => {
    navigate("/register-user");
  };

  if (!userData) {
    return (
      <div className="settings-container">
        <p>No user information available.</p>
      </div>
    );
  }

  const isAdmin = userData?.Role?.toLowerCase() === "admin";

  return (
    <div className="settings-container">
      {isAdmin && (
        <button className="register-user-button" onClick={handleRegisterUser}>
          Register New User
        </button>
      )}

      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>User:</strong> {userData.User || "N/A"}</p>
        <p><strong>Email:</strong> {userData.Email || "N/A"}</p>
        <p><strong>Phone Number:</strong> {userData.PhoneNumber || "N/A"}</p>
        <p><strong>Role:</strong> {userData.Role || "N/A"}</p>
        <p><strong>Address:</strong> {userData.Address || "N/A"}</p>
        <p><strong>Cost Factor:</strong> {userData.CostFactor || "N/A"}</p>
      </div>
    </div>
  );
};

export default Settings;