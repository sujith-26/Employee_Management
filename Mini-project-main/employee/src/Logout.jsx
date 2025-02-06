import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Authen';
import './Logout.css';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="logout-container">
      <h1>Are you sure you want to log out?</h1>
      <button onClick={handleOpenModal} className="btn-logout">Logout</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Logout</h2>
            <p>Do you really want to log out?</p>
            <button onClick={handleConfirmLogout} className="confirm-btn">Confirm Logout</button>
            <button onClick={handleCloseModal} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logout;
