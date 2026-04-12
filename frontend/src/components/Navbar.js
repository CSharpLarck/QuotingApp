import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("userData");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      }

      if (currentUser?.email) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("Email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const user = querySnapshot.docs[0].data();
            setUserData(user);
            localStorage.setItem("userData", JSON.stringify(user));
          } else {
            console.warn("⚠️ No matching Firestore user found.");
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userData");
    window.location.reload();
  };

  // ✅ Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      {/* ✅ Left Branding */}
      <div className="nav-left">
        <a href="https://www.designerblindco.com" className="brand-link">
          <h2 className="brand-title">Designer Blinds</h2>
          <h3 className="brand-subtitle">Quoting Software</h3>
        </a>
      </div>

      {/* ✅ Right Section: User Info, Menu, and Logout */}
      <div className="nav-right">
        {/* ✅ Show User Name Above Menu */}
        {userData && (
          <span className="user-name">{loading ? "Loading..." : userData?.User || "Unknown User"}</span>
        )}

        {/* ✅ Dropdown Menu */}
        <div className="dropdown-container" ref={dropdownRef}>
          <button className="menu-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            Menu ▼
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* ✅ Show "Manage Quotes" & "Settings" only if user is signed in */}
              {userData && (
                <>
                  <Link to="/" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Manage Quotes</Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Settings</Link>
                </>
              )}

              {/* ✅ Resources always visible */}
              <a 
  href="/resources" 
  className="dropdown-item" 
  target="_blank" 
  rel="noopener noreferrer"
  onClick={() => setIsDropdownOpen(false)}
>
  Resources
</a>
            </div>
          )}
        </div>

        {/* ✅ Logout or Sign In Button BELOW the Menu Button */}
        {userData ? (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/signin" className="signin-button">Sign In</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
