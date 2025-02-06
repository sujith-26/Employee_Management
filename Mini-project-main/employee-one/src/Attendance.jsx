import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Attendance.css'; 

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceHistory(); 
  }, []);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [date]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const markEntryTime = async (employeeId) => {
    try {
      const response = await axios.post('http://localhost:5000/attendance/start', {
        employeeId,
      });
      console.log('Entry time marked:', response.data);
      fetchAttendanceHistory(); 
    } catch (error) {
      console.error('Error marking entry time:', error);
      alert('Error marking entry time: ' + (error.response?.data?.message || error.message));
    }
  };

  const markExitTime = async (employeeId) => {
    try {
      const response = await axios.put('http://localhost:5000/attendance/end', {
        employeeId,
      });
      console.log('Exit time marked:', response.data);
      fetchAttendanceHistory(); 
    } catch (error) {
      console.error('Error marking exit time:', error);
      alert('Error marking exit time: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAttendanceHistory = async () => {
    setAttendanceLoading(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await axios.get('http://localhost:5000/attendance', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
      });

      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      alert('Error fetching attendance history: ' + error.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  return (
    <div className="attendance-container">
  <h2>Mark Attendance</h2>
  {loading ? (
    <p className="loading">Loading employees...</p>
  ) : (
    <div>
      <ul>
        {employees.map((employee) => (
          <li key={employee._id}>
            <div>
              <strong>{employee.name}</strong> - {employee.position}
            </div>
            <div>
              <button onClick={() => markEntryTime(employee._id)}>Mark Entry</button>
              <button onClick={() => markExitTime(employee._id)}>Mark Exit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )}
  <div className="date-picker">
    <label>
      Date:
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </label>
  </div>
  <h3 className="attendance-history">Attendance History for {date}</h3>
  {attendanceLoading ? (
    <p className="loading">Loading attendance records...</p>
  ) : (
    <ul>
      {attendance.length === 0 ? (
        <p>No attendance records for this date.</p>
      ) : (
        attendance.map((record) => {
          const employeeName = record.employeeId ? record.employeeId.name : 'Unknown Employee';
          const lastEntryTime = record.entryTimes?.[record.entryTimes.length - 1];
          const lastExitTime = record.exitTimes?.[record.exitTimes.length - 1];
          
          return (
            <li key={record._id}>
              {employeeName} - Last Entry Time: {lastEntryTime ? new Date(lastEntryTime).toLocaleTimeString() : 'N/A'}
              , Last Exit Time: {lastExitTime ? new Date(lastExitTime).toLocaleTimeString() : 'N/A'}
              , Hours Worked: {record.hoursWorked ? record.hoursWorked.toFixed(2) : 'N/A'}
            </li>
          );
        })
      )}
    </ul>
  )}
</div>
  );
};

export default Attendance;
