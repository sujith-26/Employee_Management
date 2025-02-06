import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeList.css';

const AddEmployeeForm = ({ onAddEmployee, initialEmployeeData = null, isUpdate = false, onClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    position: '',
    basicPay: '',
    allowances: '',
    hoursWorked: 0,
  });

  useEffect(() => {
    if (initialEmployeeData) {
      setFormData({
        employeeId: initialEmployeeData.employeeId || '',
        name: initialEmployeeData.name || '',
        position: initialEmployeeData.position || '',
        basicPay: initialEmployeeData.basicPay || '',
        allowances: initialEmployeeData.allowances || '',
        hoursWorked: initialEmployeeData.hoursWorked || 0,
      });
    } else if (formData.employeeId) {
      fetchHoursWorked(formData.employeeId);
    }
  }, [initialEmployeeData, formData.employeeId]);

  const fetchHoursWorked = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/attendance/${employeeId}`);
      const hours = response.data.hoursWorked;
      setFormData((prevData) => ({ ...prevData, hoursWorked: hours }));
    } catch (error) {
      console.error('Error fetching hours worked:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalSalary =
      (parseFloat(formData.basicPay || 0) * parseFloat(formData.hoursWorked || 0)) +
      parseFloat(formData.allowances || 0);
    onAddEmployee({ ...formData, totalSalary });
    onClose();
  };

  return (
    <form className="add-employee-form" onSubmit={handleSubmit}>
      <h3>{isUpdate ? 'Update Employee' : 'Add Employee'}</h3>
      <input
        type="text"
        name="employeeId"
        placeholder="Employee ID"
        value={formData.employeeId}
        onChange={handleChange}
        required
        disabled={isUpdate} 
      />
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="position"
        placeholder="Position"
        value={formData.position}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="basicPay"
        placeholder="Basic Pay"
        value={formData.basicPay}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="allowances"
        placeholder="Allowances"
        value={formData.allowances}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="hoursWorked"
        placeholder="Hours Worked"
        value={formData.hoursWorked}
        readOnly
      />
      <button type="submit">{isUpdate ? 'Update Employee' : 'Add Employee'}</button>
    </form>
  );
};

export default AddEmployeeForm;
