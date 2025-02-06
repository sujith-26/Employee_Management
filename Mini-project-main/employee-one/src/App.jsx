import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Authen';
import HomeAfterLogin from './Home';
import Login from './Login'; 
import Welcome from './Welcome';
import Logout from './Logout';
import EmployeeList from './Employees';
import Attendance from './Attendance';
import Layout from './Layout';
import ProjectForm from './ProjectForm';
import LeaveForm from './Leave';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateHomeRoute />} />
          <Route path='/logout' element={<PrivateLogoutRoute/>}/>
          <Route path='/employees' element={<PrivateEmployee/>}/>
          <Route path='/attendance' element={<PrivateAttendance/>}/>
          <Route path='/projects' element={<Privateprojects/>}/>
          <Route path='/leave' element={<PrivateLeave/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function PrivateHomeRoute() {
  const { isAuthenticated } = useAuth(); 

  return isAuthenticated ?<Layout> <HomeAfterLogin /> </Layout> : <Navigate to="/login" />;
}
function PrivateLogoutRoute(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated?<Layout><Logout/></Layout> : <Navigate to="/login"/>
}
function PrivateEmployee(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated ? <Layout><EmployeeList/></Layout> :<Navigate to="/login"/>
}
function PrivateAttendance(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated?<Layout><Attendance/></Layout> :<Navigate to="/login"/>
}
function Privateprojects(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated ? <Layout><ProjectForm/></Layout>:<Navigate to="/login"/>
}
function PrivateLeave(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated ? <Layout><LeaveForm/></Layout>:<Navigate to="/login"/>
}
export default App;
