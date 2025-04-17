import React, { useState } from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (index) => {
    setActiveCard(activeCard === index ? null : index); // Toggle card
  };

  const steps = [
    {
      icon: '🎓',
      title: 'Practice & Learn',
      description: 'Access thousands of real interview questions',
      details: 'Practice with a vast library of questions curated from real interviews across various industries. Enhance your skills with interactive coding challenges and mock interviews.',
    },
    {
      icon: '📝',
      title: 'Get Feedback',
      description: 'Receive detailed feedback from industry experts',
      details: 'Get personalized feedback on your performance from experienced professionals. Understand your strengths and areas for improvement to ace your interviews.',
    },
    {
      icon: '👥',
      title: 'Land Your Dream Job',
      description: 'Connect with top companies hiring now',
      details: 'Leverage our network to connect with leading employers. Get job recommendations tailored to your skills and preferences, and take the next step in your career.',
    },
  ];

  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-card ${activeCard === index ? 'active' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            {activeCard === index && (
              <div className="card-details">
                <p>{step.details}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;