import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEmployeeForm from './AddEmployeeForm';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('name');
  const [showAddEmployeeIframe, setShowAddEmployeeIframe] = useState(false);
  const [showUpdateEmployeeIframe, setShowUpdateEmployeeIframe] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const addEmployee = async (newEmployee) => {
    try {
      await axios.post('http://localhost:5000/employees', newEmployee);
      fetchEmployees();
      closeIframe();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/employees/${id}`, updatedData);
      fetchEmployees();
      closeIframe();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const openUpdateIframe = (employee) => {
    setSelectedEmployee(employee);
    setShowUpdateEmployeeIframe(true);
  };

  const closeIframe = () => {
    setShowAddEmployeeIframe(false);
    setShowUpdateEmployeeIframe(false);
    setSelectedEmployee(null); // Reset selected employee
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setSearchTerm('');
  };

  const filteredEmployees = employees.filter((employee) => {
    const valueToFilter = employee[filterType]?.toString().toLowerCase();
    return valueToFilter && valueToFilter.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="employee-list">
      <h2>Employee Management</h2>

      <div className="filter-container">
        <select value={filterType} onChange={handleFilterChange} className="filter-select">
          <option value="name">Name</option>
          <option value="position">Position</option>
          <option value="employeeId">Employee ID</option>
        </select>
        <input
          type="text"
          placeholder={`Search by ${filterType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Basic Pay</th>
            <th>Allowances</th>
            <th>Hours Worked</th>
            <th>Total Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.position}</td>
                <td>${employee.basicPay}</td>
                <td>${employee.allowances}</td>
                <td>{employee.hoursWorked} hrs</td>
                <td>${employee.totalSalary}</td>
                <td>
                  <button onClick={() => openUpdateIframe(employee)}>Update</button>
                  <button onClick={() => deleteEmployee(employee._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="add-employee-button" onClick={() => setShowAddEmployeeIframe(true)}>
        Add Employee
      </button>

      {showAddEmployeeIframe && (
        <div className="iframe-overlay">
          <div className="iframe-container">
            <button className="close-button" onClick={closeIframe}>✖</button>
            <AddEmployeeForm onAddEmployee={addEmployee} onClose={closeIframe} />
          </div>
        </div>
      )}

      {showUpdateEmployeeIframe && selectedEmployee && (
        <div className="iframe-overlay">
          <div className="iframe-container">
            <button className="close-button" onClick={closeIframe}>✖</button>
            <AddEmployeeForm
              onAddEmployee={(updatedData) => updateEmployee(selectedEmployee._id, updatedData)}
              initialEmployeeData={selectedEmployee}
              isUpdate={true}
              onClose={closeIframe}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

