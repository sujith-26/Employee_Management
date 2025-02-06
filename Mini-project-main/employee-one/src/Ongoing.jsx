import React from 'react';
import './OngoingProjectsList.css';
const OngoingProjectsList = ({ ongoingProjects, doneProjects, onMarkAsDone }) => (
  <div className="projects-container">
    <section className="ongoing-projects">
      <h3>Ongoing Projects</h3>
      <ul className="project-list">
        {ongoingProjects.length > 0 ? (
          ongoingProjects.map((project) => (
            <li key={project._id} className="project-item">
              <div>
                <strong>{project.name}</strong>
                <p>Start: {project.startTime}</p>
                <p>End: {project.endTime}</p>
                <p>
                  Employees:{' '}
                  {Array.isArray(project.employeeIds) && project.employeeIds.length > 0
                    ? project.employeeIds.map((employee) => employee.name).join(', ')
                    : 'No employees assigned'}
                </p>
              </div>
              <button onClick={() => onMarkAsDone(project._id)} className="mark-done-button">
                Mark as Done
              </button>
            </li>
          ))
        ) : (
          <p>No ongoing projects.</p>
        )}
      </ul>
    </section>

    <section className="done-projects">
      <h3>Completed Projects</h3>
      <ul className="project-list">
        {doneProjects.length > 0 ? (
          doneProjects.map((project) => (
            <li key={project._id} className="project-item">
              <div>
                <strong>{project.name}</strong>
                <p>Start: {project.startTime}</p>
                <p>End: {project.endTime}</p>
                <p>
                  Employees:{' '}
                  {Array.isArray(project.employeeIds) && project.employeeIds.length > 0
                    ? project.employeeIds.map((employee) => employee.name).join(', ')
                    : 'No employees assigned'}
                </p>
              </div>
            </li>
          ))
        ) : (
          <p>No completed projects.</p>
        )}
      </ul>
    </section>
  </div>
);

export default OngoingProjectsList;
