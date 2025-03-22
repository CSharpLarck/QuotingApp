import React, { useState } from 'react';
import './CuratedCollection.css';

const images = [
  { src: "/CuratedCollection/Aurora Basil.png", alt: "Aurora Basil" },
  { src: "/CuratedCollection/Aurora Candied Walnut.png", alt: "Aurora Candied Walnut" },
  { src: "/CuratedCollection/Fresco Driftwood.png", alt: "Fresco Driftwood" },
  { src: "/CuratedCollection/Fresco Tawnywood.png", alt: "Fresco Tawnywood" },
  { src: "/CuratedCollection/Glowstone Alabaster.png", alt: "Glowstone Alabaster" },
  { src: "/CuratedCollection/Halo Sage.png", alt: "Halo Sage" },
  { src: "/CuratedCollection/Horizon Charm.png", alt: "Horizon Charm" },
  { src: "/CuratedCollection/Magnolia Pomegranate.png", alt: "Magnolia Pomegranate" },
  { src: "/CuratedCollection/Monarch Azure.png", alt: "Monarch Azure" },
  { src: "/CuratedCollection/Monarch Harmony.png", alt: "Monarch Harmony" },
  { src: "/CuratedCollection/Mosaic Deepwater.png", alt: "Mosaic Deepwater" },
  { src: "/CuratedCollection/Mosaic Ravenwood.png", alt: "Mosaic Ravenwood" },
  { src: "/CuratedCollection/Parchment Honey.png", alt: "Parchment Honey" },
  { src: "/CuratedCollection/Poppy Starlight.png", alt: "Poppy Starlight" },
  { src: "/CuratedCollection/Radiance Goldenrod.png", alt: "Radiance Goldenrod" },
  { src: "/CuratedCollection/Serenity Frostwood.png", alt: "Serenity Frostwood" },
  { src: "/CuratedCollection/Skystream Ashwood.png", alt: "Skystream Ashwood" },
  { src: "/CuratedCollection/Tranquility Shimmerdust.png", alt: "Tranquility Shimmerdust" },
  { src: "/CuratedCollection/Willow Eclipse.png", alt: "Willow Eclipse" },
];

const CuratedCollection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else {
      setSelectedImageIndex(0); // Loop back to the first image
    }
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(images.length - 1); // Loop back to the last image
    }
  };

  return (
    <div className="curated-collection-container">
      <h1>Curated Collection of Soft Fabrics</h1>
      <div className="fabric-gallery">
        {images.map((image, index) => (
          <figure key={index} onClick={() => handleImageClick(index)}>
            <img src={image.src} alt={image.alt} />
            <figcaption>{image.alt}</figcaption>
          </figure>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedImageIndex].src}
              alt={images[selectedImageIndex].alt}
              className="modal-image"
            />
            <div className="arrow-container">
              <button className="arrow-button prev" onClick={goToPreviousImage}>
                <b>{'<'}</b>
              </button>
              <button className="arrow-button next" onClick={goToNextImage}>
                <b>{'>'}</b>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratedCollection;
