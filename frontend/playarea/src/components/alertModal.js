import React from "react";
import "../styles/alertModal.scss";

const AlertModal = ({ message, onClose }) => {
  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <p className="alert-message">{message}</p>
        <button className="alert-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
