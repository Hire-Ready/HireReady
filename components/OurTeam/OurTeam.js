import React from 'react';
import './OurTeam.css';

const OurTeam = () => {
  const teamMembers = [
    { name: 'AADITYA PRAKASH', role: 'Backend Dev', image: './images/aaditya.jpg' },
    { name: 'Chinmay Patil', role: 'Backend Dev', image: './images/chinmay.jpg' },
    { name: 'RAJAS DEV', role: 'Frontend Dev', image: './images/rajas.jpg' },
    { name: 'Yash Patel', role: 'Product Designer', image: './images/yash.jpg' },
    { name: 'Dhyey Patel', role: 'Product Designer', image: './images/dhyey.jpg' },
  ];

  return (
    <section className="our-team">
      <h2>Our Team</h2>
      <div className="team-container">
        <div className="team-grid">
          {[...teamMembers, ...teamMembers].map((member, index) => (
            <div className="team-card" key={index}>
              <img src={member.image} alt={member.name} className="team-image" />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="our-journey">
        <a href="#journey">~ Our Journey</a>
      </div>
    </section>
  );
};

export default OurTeam;