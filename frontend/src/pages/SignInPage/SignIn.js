import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext"; // ✅ Use AuthContext
import "./SignIn.css"; 

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { currentUser } = useAuth(); // ✅ Get user from AuthContext
  const navigate = useNavigate();

  // ✅ Redirect if already signed in
  useEffect(() => {
    if (currentUser) {
      console.log("🚀 Already signed in, navigating to home...");
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      console.log("📌 Attempting sign-in with:", email, password);

      // ✅ Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      console.log("✅ Authenticated User:", userCredential.user);

      // ✅ Wait for Firebase Auth state to sync
      await userCredential.user.reload();
      console.log("🔥 Reloaded Auth User:", auth.currentUser);

      // ✅ Fetch user data from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("Email", "==", email.trim().toLowerCase())); // ✅ Lowercase email before querying
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("✅ User data fetched:", userData);

        // ✅ Force a UI reload after sign-in for immediate UI updates
        setTimeout(() => {
          console.log("🚀 Navigating...");
          window.location.replace("/");
        }, 100);
      } else {
        console.warn("⚠️ No matching user found in Firestore.");
        setError("User not found in database. Contact admin.");
      }
    } catch (error) {
      console.error("❌ Sign-in error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="sign-in-container">
      <form className="sign-in-form" onSubmit={handleSignIn}>
        <h2>Sign In</h2>
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
