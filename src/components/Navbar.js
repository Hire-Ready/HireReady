import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/PricePlanscopy/Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand">HR Mock Interview</div>
      <div className="navbar-links">
        <button onClick={() => navigate('/hr')}>HR Mode</button>
        <button onClick={() => navigate('/start-practicing')}>Candidate Mode</button>
      </div>
    </nav>
  );
}

export default Navbar;