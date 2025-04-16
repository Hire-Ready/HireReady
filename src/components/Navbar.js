import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import './Navbar.css';

const Navbar = ({ onHRClick, onCandidateClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">HireReady</div>
      <ul className="navbar-menu">
        <li>
          <ScrollLink
            to="hero"
            smooth={true}
            duration={500}
            activeClass="active"
            spy={true}
            offset={-70} // Adjust based on navbar height
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
          >
            Contact
          </ScrollLink>
        </li>
        <li><button onClick={onHRClick}>HR</button></li>
        <li><button onClick={onCandidateClick}>Candidate</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;