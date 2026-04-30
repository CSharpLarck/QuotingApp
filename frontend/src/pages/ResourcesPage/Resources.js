import React from 'react';
import './Resources.css';

const Resources = () => {

  return (
    <div className="resources-container">
      

      <div className="product-resources">

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
      </div>
    </div>
  );
};

export default Resources;
