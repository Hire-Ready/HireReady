import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="icon">🎓</div>
          <h3>Practice & Learn</h3>
          <p>Access thousands of real interview questions</p>
        </div>
        <div className="step-card">
          <div className="icon">📝</div>
          <h3>Get Feedback</h3>
          <p>Receive detailed feedback from industry experts</p>
        </div>
        <div className="step-card">
          <div className="icon">👥</div>
          <h3>Land Your Dream Job</h3>
          <p>Connect with top companies hiring now</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;