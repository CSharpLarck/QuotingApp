import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [userName, setUserName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // ✅ New state for Phone Number
  const [role, setRole] = useState("standard");
  const [address, setAddress] = useState("");
  const [costFactor, setCostFactor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // ✅ Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Step 2: Save user details in Firestore (including phone number)
      await setDoc(doc(db, "users", user.uid), {
        User: userName,
        Email: email.toLowerCase(),
        PhoneNumber: phoneNumber, // ✅ Store phone number
        Role: role,
        Address: address,
        CostFactor: costFactor,
        CreatedAt: new Date(),
      });

      console.log("✅ User Created:", { userName, email, phoneNumber, role, address, costFactor });
      setSuccess(true);

      setTimeout(() => navigate("/settings"), 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Create a New User</h2>

      {error && <p className="error-message">❌ {error}</p>}
      {success && <p className="success-message">✔ Account created successfully!</p>}

      <form className="user-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label>User:</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter user password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>  {/* ✅ New Phone Number Input */}
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="standard">Standard User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            placeholder="Enter user address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Cost Factor:</label>
          <input
            type="text"
            placeholder="Enter cost factor"
            value={costFactor}
            onChange={(e) => setCostFactor(e.target.value)}
          />
        </div>

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterUser;
