import React from "react";
import "./ConfirmModal.css"; // ⬅️ Import the CSS file

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
    <div className="confirm-modal-container">
      <h2 className="confirm-modal-title">Confirm Order Submission</h2>
      <p className="confirm-modal-message">
        Have you confirmed the measurements are exact and you're ready to submit this order?
      </p>
      <div className="confirm-modal-buttons">
        <button className="confirm-btn cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="confirm-btn submit-btn" onClick={onConfirm}>
          Yes, Submit Order
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default ConfirmModal;
