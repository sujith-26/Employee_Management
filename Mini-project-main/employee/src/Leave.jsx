import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css';

const LeaveForm = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

  // Fetch the list of employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Update selected employee name when selectedEmployeeId changes
  useEffect(() => {
    const selectedEmployee = employees.find(
      (employee) => employee._id === selectedEmployeeId
    );
    if (selectedEmployee) {
      setSelectedEmployeeName(selectedEmployee.name);
    }
  }, [selectedEmployeeId, employees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/leaves', {
        employeeId: selectedEmployeeId,
        employeeName: selectedEmployeeName, // Send employee name
        leaveType,
        startDate,
        endDate,
        reason,
      });
      alert('Leave application submitted');
    } catch (error) {
      console.error('Error submitting leave application:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='leave-form-container'>
      <label>Employee:</label>
      <select
        value={selectedEmployeeId}
        onChange={(e) => setSelectedEmployeeId(e.target.value)}
        required
      >
        <option value="">Select an employee</option>
        {employees.map((employee) => (
          <option key={employee._id} value={employee._id}>
            {employee.name}
          </option>
        ))}
      </select>

      {/* Display selected employee name */}
      {selectedEmployeeName && (
        <p className="employee-name">Selected Employee: {selectedEmployeeName}</p>
      )}

      <label>Leave Type:</label>
      <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
        <option value="">Select</option>
        <option value="Sick">Sick</option>
        <option value="Casual">Casual</option>
        <option value="Vacation">Vacation</option>
      </select>

      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

      <label>End Date:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

      <label>Reason:</label>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />

      <button type="submit">Send Leave Application</button>
    </form>
  );
};

export default LeaveForm;
