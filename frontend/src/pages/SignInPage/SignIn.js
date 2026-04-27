import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./SignIn.css";

const DEMO_EMAIL = process.env.REACT_APP_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleDemoFill = () => {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) {
      setError("Demo credentials are not configured.");
      return;
    }

    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("Email", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("User not found in database. Contact admin.");
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Sign-In Failed:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="sign-in-container">
      <form className="sign-in-form" onSubmit={handleSignIn}>
        <h2>Sign In</h2>

        <p className="demo-description">
          This is a portfolio demo environment built from a real B2B quoting
          application for remodelers and wholesalers.
        </p>

        <div className="demo-access-box">
          <h3>Demo Access</h3>
          <p>Click below to automatically fill the demo credentials.</p>

          <button
            type="button"
            className="demo-fill-button"
            onClick={handleDemoFill}
          >
            Try Demo Account
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;