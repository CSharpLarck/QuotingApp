import React from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Designer Blinds Quoting & Ordering Software</div>
      <ul className="nav-links">
        <li><Link to="/products">Products</Link></li>  {/* Changed a to Link */}
        <li><Link to="/resources">Resources</Link></li>  {/* Changed a to Link */}
        <li><Link to="/contact">Contact</Link></li>  {/* Changed a to Link */}
      </ul>
      <button className="sign-in">Sign In</button>
    </nav>
  );
}

export default Navbar;
