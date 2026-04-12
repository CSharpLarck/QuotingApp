import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // ✅ Load user data from localStorage
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      console.warn("⚠️ No user data found in localStorage.");
    }
  }, []);

  const handleRegisterUser = () => {
    console.log("🆕 Register User button clicked!");
    
    setTimeout(() => {
      console.log("🚀 Navigating to /register-user...");
      navigate("/register-user"); // ✅ Navigate after a short delay
    }, 100);
  };
  
  return (
    <div className="settings-container">
      {/* ✅ Admins See "Register User" Button */}
      {userData?.Role?.toLowerCase() === "admin" && (
        <button className="register-user-button" onClick={handleRegisterUser}>
          Register New User
        </button>
      )}

      {/* ✅ User Information */}
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>User:</strong> {userData?.User || "N/A"}</p>
        <p><strong>Email:</strong> {userData?.Email || "N/A"}</p>
        <p><strong>Phone Number:</strong> {userData?.["Phone Number"] || "N/A"}</p> {/* 🔥 Correct field name */}
        <p><strong>Password:</strong> ****** (Hidden)</p>
        <p><strong>Role:</strong> {userData?.Role || "N/A"}</p>
        <p><strong>Address:</strong> {userData?.Address || "N/A"}</p>
        <p><strong>Cost Factor:</strong> {userData?.CostFactor || "N/A"}</p>
      </div>
    </div>
  );
};

export default Settings;
