import React, { useState } from 'react';
import './BrochurePage.css';

const BrochurePage = () => {
  const images = [];
  for (let i = 1; i <= 28; i++) {
    images.push(`image${i}.png`);
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length); // Loop back to the first image
  };

  const showPreviousImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length // Loop back to the last image
    );
  };

  return (
    <div className="brochure-container">
      <h1>Designer Blinds | Product Brochure</h1>
      <div className="brochure-images">
        {images.map((image, index) => (
          <div key={index} className="brochure-image">
            <img
              src={`/images/${image}`}  // Using the correct path to images in the public folder
              alt={`Brochure ${index + 1}`}
              className="brochure-image-item"
              onClick={() => openModal(index)} // Open the modal with the clicked image
            />
          </div>
        ))}
      </div>

      {/* Modal for displaying enlarged images */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-container">
              <img
                src={`/images/${images[currentImageIndex]}`}
                alt={`Enlarged Brochure ${currentImageIndex + 1}`}
                className="modal-image"
              />
            </div>
            {/* Arrow buttons wrapped in a container for side-by-side alignment */}
            <div className="arrow-container">
              <button className="arrow-button prev" onClick={showPreviousImage}>
                <b>←</b> {/* Left Arrow */}
              </button>
              <button className="arrow-button next" onClick={showNextImage}>
                <b>→</b> {/* Right Arrow */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrochurePage;
