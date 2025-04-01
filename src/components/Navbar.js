// src/components/Navbar.js
import React from 'react';
import './Navbar.css';

function Navbar({ onHRClick, onCandidateClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">HR Mock Interview</div>
      <div className="navbar-links">
        <button onClick={onHRClick}>HR Mode</button>
        <button onClick={onCandidateClick}>Candidate Mode</button>
      </div>
    </nav>
  );
}

export default Navbar;