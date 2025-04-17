import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import './Navbar.css';

const Navbar = ({ onHRClick, onCandidateClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">HireReady</div>
      <div className="menu-toggle" onClick={toggleMobileMenu}>
        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </div>
      <ul className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <li>
          <ScrollLink
            to="hero"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
          >
            Home
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="how-it-works"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="team"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Team
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="pricing"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="articles"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Articles
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="faqs"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQs
          </ScrollLink>
        </li>
        <li>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </ScrollLink>
        </li>
        <li><button onClick={() => { onHRClick(); setIsMobileMenuOpen(false); }}>HR</button></li>
        <li><button onClick={() => { onCandidateClick(); setIsMobileMenuOpen(false); }}>Candidate</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;