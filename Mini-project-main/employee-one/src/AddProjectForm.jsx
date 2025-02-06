import React, { useState } from 'react';

const AddProjectForm = ({ onAddProject, employees }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    status: 'Ongoing',
    employees: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (employeeId) => {
    setProjectData((prevData) => {
      const isSelected = prevData.employees.includes(employeeId);
      const updatedEmployees = isSelected
        ? prevData.employees.filter((id) => id !== employeeId)
        : [...prevData.employees, employeeId];
      return { ...prevData, employees: updatedEmployees };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProject(projectData);
    setProjectData({ name: '', startTime: '', endTime: '', status: 'Ongoing', employees: [] });
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <input
        type="text"
        name="name"
        placeholder="Project Name"
        value={projectData.name}
        onChange={handleChange}
        required
      />
      <input
        type="datetime-local"
        name="startTime"
        value={projectData.startTime}
        onChange={handleChange}
        required
      />
      <input
        type="datetime-local"
        name="endTime"
        value={projectData.endTime}
        onChange={handleChange}
        required
      />
      <div className="employee-selection">
        <strong>Select Employees:</strong>
        {employees.map((employee) => (
          <label key={employee._id} className="employee-checkbox">
            <input
              type="checkbox"
              value={employee._id}
              checked={projectData.employees.includes(employee._id)}
              onChange={() => handleCheckboxChange(employee._id)}
            />
            {employee.name}
          </label>
        ))}
      </div>
      <button type="submit">Add Project</button>
    </form>
  );
};

export default AddProjectForm;
