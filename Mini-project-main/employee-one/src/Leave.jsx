import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css';

const Leave = ({ onUpdate }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [approvalStatuses, setApprovalStatuses] = useState(''); // Store approval status by employeeId

  // Fetch all pending leave requests on component mount
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/leave-requests/pending');
        setLeaveRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending leave requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprovalChange = (event, employeeId) => {
    setApprovalStatuses({
      ...approvalStatuses,
      [employeeId]: event.target.value, // Update the status for specific employeeId
    });
  };

  const handleSubmit = async (event, employeeId) => {
    event.preventDefault();

    const approvalStatus = approvalStatuses[employeeId];
    if (!approvalStatus) {
      console.error('No status selected for this request');
      alert('Please select an approval status.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/leaves/employee/${employeeId}`, {
        status: approvalStatus,
      });
      alert(`Leave request has been ${approvalStatus}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert('Leave request not found.');
      } else {
        console.error('Error updating leave status:', error);
        alert('Error updating leave status.');
      }
    }
  };

  return (
    <div className="leave-approval">
      <h3>Pending Leave Requests</h3>
      {leaveRequests.length === 0 ? (
        <p>No pending leave requests available.</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request._id} className="leave-request">
            <p>Employee: {request.employeeName}</p>
            <p>Leave Type: {request.leaveType}</p>
            <p>Start Date: {new Date(request.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(request.endDate).toLocaleDateString()}</p>
            <form onSubmit={(e) => handleSubmit(e, request._id)}>
              <label>
                Approval Status:
                <select
                  value={approvalStatuses[request._id] || ''}
                  onChange={(e) => handleApprovalChange(e, request._id)}
                >
                  <option value="" disabled>Select status</option>
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Deny</option>
                </select>
              </label>
              <button type="submit">Submit</button>
            </form>
          </div>
        ))
      )}
    </div>
  );
};

export default Leave;
