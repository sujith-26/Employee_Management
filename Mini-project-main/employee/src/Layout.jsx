
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css'; 

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); 
  const toggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
  };

  return (
    <div className={`layout-container ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/leave">Leave</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <div className={`toggle-btn ${isCollapsed ? 'collapsed' : ''}`} onClick={toggleSidebar}>
        {isCollapsed ? '>' : '<'}
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
