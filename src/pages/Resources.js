import React from 'react';
import { useNavigate } from 'react-router-dom';  // Ensure this import is present
import './Resources.css';

const Resources = () => {
  const navigate = useNavigate();  // Use navigate here

  const handleViewBrochure = () => {
    navigate('/brochure');
  };

  const handleViewCuratedCollection = () => {
    navigate('/curatedcollection');
  };


  const handleViewInstallerMeasurements = () => {
    console.log("Navigating to Installer Measurement Page...");
    navigate('/installer-measurement'); // ✅ Matches App.js

  };

  const handleViewReleaseForm = () => {
    navigate('/release-liability'); // ✅ Route to the new form
  };
  

  return (
    <div className="resources-container">
      <section className="resources">
        <h1>Resources</h1>
      </section>
      <div className="resources-buttons">
    <button className="resources-button" onClick={handleViewBrochure}>Product Brochure</button>
    <button className="resources-button" onClick={handleViewCuratedCollection}>Fabric Collection</button>
    <button className="resources-button" onClick={handleViewInstallerMeasurements}>Measurement Form</button>
    <button className="resources-button" onClick={handleViewReleaseForm}>Release of Liability</button>

  </div>

      <div className="product-resources">
        {/* Quick Ship Panels & Hardware */}
        <div className="product-item">
          <h3><strong>Quick Ship Panels & Hardware</strong></h3>
          <ul>
            <li><a href="/Resources/quick-ship-panels/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/quick-ship-panels/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/quick-ship-panels/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
          </ul>
        </div>

        {/* Roman Shades */}
        <div className="product-item">
          <h3><strong>Roman Shades</strong></h3>
          <ul>
            <li><a href="/Resources/roman-shades/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/roman-shades/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/roman-shades/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
            <li><a href="/Resources/roman-shades/programming.pdf" target="_blank" rel="noopener noreferrer">Programming Instructions</a></li>
          </ul>
        </div>

        {/* Natural Shades */}
        <div className="product-item">
          <h3><strong>Natural Shades</strong></h3>
          <ul>
            <li><a href="/Resources/natural-shades/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/natural-shades/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/natural-shades/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
            <li><a href="/Resources/natural-shades/programming.pdf" target="_blank" rel="noopener noreferrer">Programming Instructions</a></li>
          </ul>
        </div>

        {/* Roller Shades */}
        <div className="product-item">
          <h3><strong>Roller Shades</strong></h3>
          <ul>
            <li><a href="/Resources/roller-shades/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/roller-shades/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/roller-shades/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
            <li><a href="/Resources/roller-shades/programming.pdf" target="_blank" rel="noopener noreferrer">Programming Instructions</a></li>
          </ul>
        </div>

        {/* Composite Shutters */}
        <div className="product-item">
          <h3><strong>Composite Shutters</strong></h3>
          <ul>
            <li><a href="/Resources/composite-shutters/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/composite-shutters/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/composite-shutters/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
          </ul>
        </div>

        {/* 2.5 Inch Blinds */}
        <div className="product-item">
          <h3><strong>2.5 Inch Blinds</strong></h3>
          <ul>
            <li><a href="/Resources/2.5-inch-blinds/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/2.5-inch-blinds/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/2.5-inch-blinds/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
          </ul>
        </div>

        {/* 2 Inch Blinds */}
        <div className="product-item">
          <h3><strong>2 Inch Blinds</strong></h3>
          <ul>
            <li><a href="/Resources/2-inch-blinds/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/2-inch-blinds/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/2-inch-blinds/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
          </ul>
        </div>

        {/* Patio Shades */}
        <div className="product-item">
          <h3><strong>Patio Shades</strong></h3>
          <ul>
            <li><a href="/Resources/patio-shades/installation.pdf" target="_blank" rel="noopener noreferrer">Installation Instructions</a></li>
            <li><a href="/Resources/patio-shades/measuring.pdf" target="_blank" rel="noopener noreferrer">Measuring Instructions</a></li>
            <li><a href="/Resources/patio-shades/warranty.pdf" target="_blank" rel="noopener noreferrer">Warranty Information</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Resources;
