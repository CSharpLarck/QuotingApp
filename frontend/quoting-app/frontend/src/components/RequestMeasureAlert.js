import React from "react";
import "./CustomAlert.css";

const RequestMeasureAlert = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Measurement Requested</h2>
        <p>{message}</p>
        <div className="alert-actions">
          <button className="ok-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default RequestMeasureAlert;
