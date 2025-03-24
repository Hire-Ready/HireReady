import React from "react";
import { motion } from "framer-motion";
import { Typewriter } from 'react-simple-typewriter';
import "./HeroSection.css";
import rocketIcon from "../assets/rocket-icon.png";
import searchIcon from "../assets/search-icon.png";
import studentIcon from "../assets/student.png";
import hrIcon from "../assets/hr.png";

const HeroSection = () => {
  const bounceAnimation = {
    y: [0, 19, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "mirror"
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
    },
    {
      title: "For HR Professionals",
      description: "Find the best talent effortlessly with our AI-powered matching system. Streamline your hiring process, assess candidates efficiently, and connect with top professionals in your industry!",
      buttonText: "Find Talent",
      buttonIcon: searchIcon,
      buttonClass: "talent-btn",
      animatedIcon: hrIcon,
      iconClass: "hr-icon",
    },
  ];

  return (
    <div className="hero-section">
      {cardData.map((card, index) => (
        <motion.div
        className="card"
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}  // Change y: 1 to y: 0
        transition={{ duration: 0 }} // Added easing for smoothness
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
            <button className={card.buttonClass}>
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

export default HeroSection;
