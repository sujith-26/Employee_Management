import React from 'react';
import './AddProjectModal.css';
import AddProjectForm from './AddProjectForm';

const AddProjectModal = ({ isOpen, onClose, onAddProject, employees }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>Add New Project</h2>
        <AddProjectForm onAddProject={onAddProject} employees={employees} />
      </div>
    </div>
  );
};

export default AddProjectModal;
