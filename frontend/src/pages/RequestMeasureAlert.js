import React from "react";
import "./RequestMeasureAlert.css"; // Ensure styling is properly set

const RequestMeasureAlert = ({ message, onClose }) => {
  return (
    <div className="modal-overlay"> {/* Darkens background */}
      <div className="modal-content">
        <h2>Success!</h2>
        <p>{message}</p>
        <div className="alert-actions">
          <button className="ok-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default RequestMeasureAlert;
