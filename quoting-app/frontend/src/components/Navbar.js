import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth(); // ✅ Get authenticated user
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ First, load user data from localStorage (faster UI updates)
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      setLoading(false);
    }

    // ✅ Fetch user data from Firestore (ensures up-to-date info)
    const fetchUserData = async () => {
      if (currentUser?.email) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("Email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const user = querySnapshot.docs[0].data();
            setUserData(user);
            localStorage.setItem("userData", JSON.stringify(user)); // ✅ Update localStorage
          } else {
            console.warn("⚠️ No matching Firestore user found.");
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userData"); // ✅ Clear stored user data
    window.location.reload();
  };

  return (
    <div className="navbar">
      {/* ✅ Left Branding */}
      <div className="nav-left">
        <h2 className="brand-title">Designer Blinds</h2>
        <h3 className="brand-subtitle">Quoting Software</h3>
      </div>

      {/* ✅ Center Navigation (Only Show If Logged In) */}
      <div className="nav-center">
        {userData && (
          <>
            <Link to="/" className="nav-button">Manage Quotes & Orders</Link>
            <Link to="/settings" className="nav-button">Settings</Link>
          </>
        )}
        <Link to="/resources" className="nav-button">Resources</Link>
      </div>

      {/* ✅ Right: User Info & Logout */}
      <div className="nav-right">
        {userData ? (
          <div className="user-info">
            <span className="user-name">{loading ? "Loading..." : userData?.User || "Unknown User"}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/signin" className="signin-button">Sign In</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
