import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardTable from './components/DashboardTable'; // Example Component
import QuotePage from './components/QuotePage'; // Example Component
import ProductsPage from './pages/ProductsPage'; // Example Component
import ResourcesPage from './pages/ResourcesPage'; // Example Component
import ContactPage from './pages/ContactPage'; // Example Component

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<DashboardTable />} /> {/* Home page is Dashboard */}
              <Route path="/quote" element={<QuotePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
