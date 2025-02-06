import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Authen';
import HomeAfterLogin from './Home';
import Login from './Login'; 
import Logout from './Logout';
import Layout from './Layout';
import LeaveForm from './Leave';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateHomeRoute />} />
          <Route path='/logout' element={<PrivateLogoutRoute/>}/>
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

function PrivateLeave(){
  const {isAuthenticated}=useAuth();
  return isAuthenticated ? <Layout><LeaveForm/></Layout>:<Navigate to="/login"/>
}
export default App;
