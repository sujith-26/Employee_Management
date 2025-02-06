const express=require( 'express');
const mongoose=require('mongoose');
const cors=require('cors');
const bcrypt=require('bcryptjs');
const bodyParser=require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection for login system
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Create the User model
const User = mongoose.model('User', userSchema);

// MongoDB connection for employee, attendance, and project management
mongoose.connect('mongodb://localhost:27017/employeeDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Employee Schema and Model
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: String,
  position: String,
  basicPay: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  totalSalary: { type: Number, default: 0 },  // Store the calculated total salary
  hoursWorked: { type: Number, default: 0 },  // Field to store total hours worked
});

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: String,
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
});

const calculateTotalSalary = ({ basicPay, allowances, hoursWorked }) => {
  const basic = parseFloat(basicPay || 0);
  const allowance = parseFloat(allowances || 0);
  const hours = parseFloat(hoursWorked || 0);
  return (basic * hours) + allowance;
};
const Employee = mongoose.model('Employee', employeeSchema);

// Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  entryTimes: [{ type: Date }], // Array to hold multiple entry times
  exitTimes: [{ type: Date }],  // Array to hold multiple exit times
  hoursWorked: { type: Number, default: 0 },
  activeEntry: { type: Boolean, default: false } // Track if an active entry exists
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

const updateEmployeeHoursWorked = async (employeeId) => {
  try {
    const totalHoursWorked = await Attendance.aggregate([
      { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },
      { $group: { _id: null, totalHours: { $sum: "$hoursWorked" } } },
    ]);

    const hoursWorked = totalHoursWorked[0] ? totalHoursWorked[0].totalHours : 0;
    await Employee.findByIdAndUpdate(employeeId, { hoursWorked }, { new: true });
  } catch (error) {
    console.error("Failed to update hours worked for employee:", error);
  }
};
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If passwords match
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Error fetching employees' });
  }
});

app.post('/employees', async (req, res) => {
  try {
    const { employeeId, name, position, basicPay, allowances, hoursWorked } = req.body;

    if (!employeeId || !name || !position) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const totalSalary = calculateTotalSalary({ basicPay, allowances, hoursWorked });
    const newEmployee = new Employee({ employeeId, name, position, basicPay, allowances, hoursWorked, totalSalary });
    await newEmployee.save();
    
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Error adding employee' });
  }
});
app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Employee ID' });
  }

  const updatedData = req.body;

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const totalSalary = calculateTotalSalary({ ...employee.toObject(), ...updatedData });
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { ...updatedData, totalSalary },
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Error updating employee' });
  }
});

app.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting employee' });
  }
});

app.post('/attendance/start', async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ message: 'employeeId is required.' });
  }

  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const employeeExists = await Employee.exists({ _id: employeeId });
    if (!employeeExists) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (attendance && attendance.activeEntry) {
      return res.status(400).json({ message: 'Entry already marked for today. Please mark exit first.' });
    }

    if (!attendance) {
      attendance = new Attendance({ employeeId, date: currentDate });
    }

    attendance.entryTimes.push(currentDate);
    attendance.activeEntry = true;
    await attendance.save();

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error starting attendance:', error);
    res.status(500).json({ message: 'Failed to start attendance.' });
  }
});

// End attendance - records exit time and calculates hours worked
app.put('/attendance/end', async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ message: 'employeeId is required.' });
  }

  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!attendance || !attendance.activeEntry) {
      return res.status(400).json({ message: 'No active entry found for today. Please mark entry first.' });
    }

    attendance.exitTimes.push(currentDate);

    // Calculate hours worked if both entry and exit times exist
    const entryTime = attendance.entryTimes[attendance.entryTimes.length - 1];
    const exitTime = currentDate;
    const hoursWorked = (exitTime - entryTime) / (1000 * 60 * 60); // Convert milliseconds to hours

    attendance.hoursWorked += hoursWorked;
    attendance.activeEntry = false;
    await attendance.save();

    // Update employee's total hours worked
    await updateEmployeeHoursWorked(employeeId);

    // Recalculate total salary
    const employee = await Employee.findById(employeeId);
    const totalSalary = calculateTotalSalary(employee);

    // Update employee's total salary
    await Employee.findByIdAndUpdate(employeeId, { totalSalary }, { new: true });

    res.json(attendance);
  } catch (error) {
    console.error('Error marking exit time:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get attendance records for a date range or specific employee
app.get('/attendance', async (req, res) => {
  const { startDate, endDate, employeeId } = req.query;

  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  try {
    const attendanceRecords = await Attendance.find(filter).populate('employeeId', 'name position');
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve attendance records.' });
  }
});

// API for project management
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: [{ type: Date }], // Array to hold multiple entry times
  endTime: [{ type: Date }],
  status: { type: String, enum: ['Ongoing', 'completed', 'paused'], default: 'ongoing' },
  employeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
});

const Project = mongoose.model('Project', projectSchema);

// Add a project
app.post('/projects', async (req, res) => {
  const { name, startTime,endTime, status, employeeIds } = req.body;

  try {
    console.log(employeeIds);
    const newProject = new Project({ name, startTime,endTime , status, employeeIds });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Error adding project' });
    console.log(error);
  }
});

// Fetch all projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('employeeIds', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Update a project
app.put('/projects/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Error adding project', details: error.message });
  }  
});
const Leave = mongoose.model('Leave', leaveSchema);

// Add a leave application
// Assuming the backend is using Express.js
app.post('/leaves', async (req, res) => {
  const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body;

  try {
    const newLeaveRequest = new Leave({
      employeeId,
      employeeName,  // Store the employee's name
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',  // Default status
    });

    await newLeaveRequest.save();

    res.status(201).json(newLeaveRequest);
  } catch (error) {
    console.error('Error submitting leave application:', error);
    res.status(500).json({ message: 'Error submitting leave application' });
  }
});


// Get all leave applications (for admins or HR)
app.get('/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employeeId', 'name position');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({ message: 'Error fetching leave applications' });
  }
});

// Get leave applications for a specific employee
app.get('/leaves/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const leaves = await Leave.find({ employeeId }).populate('employeeId', 'name position');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({ message: 'Error fetching leave applications' });
  }
});

// Approve or reject leave application
app.put('/leaves/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Accepts 'Approved' or 'Rejected'

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(updatedLeave);
  } catch (error) {
    console.error('Error updating leave application status:', error);
    res.status(500).json({ message: 'Error updating leave application status' });
  }
});

app.put('/leaves/employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params; // Get employeeId from the route parameter
  const { status } = req.body; // Get the new status from the request body

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updatedLeave = await Leave.findOneAndUpdate(
      { _id: employeeId },  
      { status },                  
      { new: true }              
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(updatedLeave);  // Send back the updated leave request
    console.log(updatedLeave); // Optional: log the updated leave request for debugging
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Error updating leave status' });
  }
});


app.get('/leave-requests/pending', async (req, res) => {
  try {
    const pendingRequests = await Leave.find({ status: 'Pending' });
    res.send(pendingRequests);
  } catch (error) {
    res.status(500).send('Error retrieving pending leave requests');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
