import React from 'react';
import './HeroSection.css';
import rocketIcon from '../assets/rocket-icon.png'; // Ensure you have this icon
import searchIcon from '../assets/search-icon.png'; // Ensure you have this icon

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="card">
        <h1>For Students</h1>
        <p>Practice with real interview questions and get feedback from industry experts.</p>
        <button className="practice-btn">
          <img src={rocketIcon} alt="Rocket Icon" className="btn-icon" />
          Start Practicing
        </button>
      </div>
      <div className="card">
        <h1>For HR Professionals</h1>
        <p>Find the best talent with our AI-powered matching system.</p>
        <button className="talent-btn">
          <img src={searchIcon} alt="Search Icon" className="btn-icon" />
          Find Talent
        </button>
      </div>
    </div>
  );
};

export default HeroSection;