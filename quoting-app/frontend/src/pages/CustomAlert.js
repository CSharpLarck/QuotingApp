import React from "react";
import "./CustomAlert.css"; // Ensure styling is properly set

const CustomAlert = ({ message, onAddMore, onGoToQuote }) => {
  return (
    <div className="modal-overlay"> {/* Darkens background */}
      <div className="modal-content">
        <h2>Success!</h2>
        <p>{message}</p>
        <div className="alert-actions">
          <button className="ok-btn" onClick={onAddMore}>
OK          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
