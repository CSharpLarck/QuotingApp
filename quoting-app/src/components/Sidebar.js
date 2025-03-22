import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-item">
        <Link to="/">
          <button>Manage Quotes/Orders</button>
        </Link>
        <p>View, edit, and track all your quotes and orders in one place.</p>
      </div>
      <div className="sidebar-item">
        <button><Link to="/quote">Start a New Quote</Link></button>
        <p>Create a new custom quote for your clients with just a few clicks.</p>
      </div>
      <div className="sidebar-item">
        <button>User Settings</button>
        <p>Update your profile, preferences, and application settings.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
