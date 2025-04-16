import React, { useState } from "react";
import { motion } from "framer-motion";
import { Typewriter } from 'react-simple-typewriter';
import "./HeroSection.css";
import rocketIcon from "../assets/rocket-icon.png"; // Verify this file exists
import searchIcon from "../assets/search-icon.png"; // Verify this file exists
import studentIcon from "../assets/student.png"; // Verify this file exists
import hrIcon from "../assets/hr.png"; // Verify this file exists
import HRDashboard from "../components/HRDashboard/HRDashboard"; // Verify path and export
import StudentDashboard from "../components/StudentDashboard/StudentDashboard"; // Verify path and export

const HeroSection = () => {
  const [showHRDashboard, setShowHRDashboard] = useState(false);
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);

  const bounceAnimation = {
    y: [0, 19, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "mirror",
    },
  };

  const cardData = [
    {
      title: "For Students",
      description: "Practice with real interview questions, receive expert feedback, and enhance your confidence. Get AI-powered insights to improve your responses and ace your dream job interviews!",
      buttonText: "Start Practicing",
      buttonIcon: rocketIcon,
      buttonClass: "practice-btn",
      animatedIcon: studentIcon,
      iconClass: "student-icon",
      onClick: () => setShowStudentDashboard(true),
    },
    {
      title: "For HR Professionals",
      description: "Find the best talent effortlessly with our AI-powered matching system. Streamline your hiring process, assess candidates efficiently, and connect with top professionals in your industry!",
      buttonText: "HR MODE",
      buttonIcon: searchIcon,
      buttonClass: "talent-btn",
      animatedIcon: hrIcon,
      iconClass: "hr-icon",
      onClick: () => setShowHRDashboard(true),
    },
  ];

  if (showHRDashboard) {
    return <HRDashboard onBack={() => setShowHRDashboard(false)} />;
  }

  if (showStudentDashboard) {
    return <StudentDashboard onBack={() => setShowStudentDashboard(false)} />;
  }

  return (
    <div className="hero-section">
      {cardData.map((card, index) => (
        <motion.div
          className="card"
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          whileHover={{ y: -5 }}
        >
          <div className="card-content">
            <h1>
              <Typewriter
                words={[card.title]}
                cursor
                cursorStyle="|"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={2000}
                loop={1}
              />
            </h1>
            <p>{card.description}</p>
            <button className={card.buttonClass} onClick={card.onClick}>
              <img src={card.buttonIcon} alt={`${card.buttonText} Icon`} className="btn-icon" />
              {card.buttonText}
            </button>

            <motion.img
              src={card.animatedIcon}
              alt={`${card.title} Icon`}
              className={card.iconClass}
              animate={bounceAnimation}
              style={{ width: "300px", height: "300px", marginTop: "20px" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroSection; // Ensure this is present