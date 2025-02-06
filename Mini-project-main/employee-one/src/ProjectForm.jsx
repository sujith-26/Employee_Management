import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProjectModal from './AddProjectModel';
import OngoingProjectsList from './Ongoing';
import './ProjectForm.css';

const ProjectForm = () => {
  const [employees, setEmployees] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [doneProjects, setDoneProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/projects');
      const ongoing = response.data.filter((project) => project.status === 'Ongoing');
      const done = response.data.filter((project) => project.status === 'Done');
      setOngoingProjects(ongoing);
      setDoneProjects(done);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAddProject = async (projectData) => {
    try {
      await axios.post('http://localhost:5000/projects', {
        ...projectData,
        employeeIds: projectData.employees,  
      });
      fetchProjects(); 
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };
  const handleMarkProjectAsDone = async (id) => {
    try {
      await axios.put(`http://localhost:5000/projects/${id}`, { status: 'Done' });
      fetchProjects();
    } catch (error) {
      console.error('Error marking project as done:', error);
    }
  };

  return (
    <div className="project-form-container">
      <h2>Projects</h2>
      <button onClick={() => setIsModalOpen(true)} className="add-project-button">
        Add Project
      </button>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProject={handleAddProject}
        employees={employees}  
      />
      <OngoingProjectsList
        ongoingProjects={ongoingProjects}
        doneProjects={doneProjects}
        onMarkAsDone={handleMarkProjectAsDone}
      />
    </div>
  );
};

export default ProjectForm;
