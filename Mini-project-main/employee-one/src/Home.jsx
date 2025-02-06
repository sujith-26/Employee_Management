import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';

const HomeAfterLogin = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0); // State for leave count
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total employees
        const employeesResponse = await axios.get('http://localhost:5000/employees');
        setEmployeeCount(employeesResponse.data.length);

        // Fetch employee leaves
        const leavesResponse = await axios.get('http://localhost:5000/leaves');  // Assuming leaves endpoint
        const leaveCount = leavesResponse.data.filter(leave => leave.status === 'Approved' || leave.status === 'Pending').length;
        setLeaveCount(leaveCount);

        // Fetch projects
        const projectsResponse = await axios.get('http://localhost:5000/projects');
        const ongoing = projectsResponse.data.filter(project => project.status === 'Ongoing');
        setOngoingProjects(ongoing);

        const completed = projectsResponse.data.filter(project => project.status === 'Done');
        setCompletedProjects(completed);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Employee Management Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Employees</h3>
          <p>{employeeCount}</p>
        </div>
        <div className="card">
          <h3>Employees on Leave</h3>
          <p>{leaveCount}</p> {/* Displaying the leave count */}
        </div>
        <div className="card">
          <h3>Ongoing Projects</h3>
          <p>{ongoingProjects.length}</p>
        </div>
        <div className="card">
          <h3>Completed Projects</h3>
          <p>{completedProjects.length}</p> {/* Displaying the number of completed projects */}
        </div>
      </div>

      <section className="ongoing-projects-section">
        <h3>Ongoing Projects</h3>
        <table className="project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {ongoingProjects.length > 0 ? (
              ongoingProjects.map((project, index) => (
                <React.Fragment key={project.id || `project-${index}`}>
                  <tr>
                    <td>{project.name}</td>
                    <td>{project.startTime}</td>
                    <td>{project.endTime}</td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3">No ongoing projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Done Projects Section */}
      <section className="completed-projects-section">
        <h3>Completed Projects</h3>
        <table className="project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {completedProjects.length > 0 ? (
              completedProjects.map((project, index) => (
                <React.Fragment key={project.id || `completed-project-${index}`}>
                  <tr>
                    <td>{project.name}</td>
                    <td>{project.startTime}</td>
                    <td>{project.endTime}</td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3">No completed projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HomeAfterLogin;
