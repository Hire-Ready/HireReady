import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">HireReady</div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
      <div className="navbar-buttons">
        <a href="#login" className="login-btn">Login</a>
        <a href="#signup" className="signup-btn">Sign Up</a>
      </div>
    </nav>
  );
};

export default Navbar;