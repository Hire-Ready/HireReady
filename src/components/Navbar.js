import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar expand="lg" className={`bg-body-tertiary ${scrolled ? 'scrolled' : ''}`}>
      <Container>
        <Navbar.Brand href="#home">
          <img src="" alt="Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" className={activeLink === 'home' ? 'active' : ''} onClick={() => setActiveLink('home')}>Home</Nav.Link>
            <Nav.Link href="#about" className={activeLink === 'about' ? 'active' : ''} onClick={() => setActiveLink('about')}>About</Nav.Link>
            <Nav.Link href="#pricing" className={activeLink === 'pricing' ? 'active' : ''} onClick={() => setActiveLink('pricing')}>Pricing</Nav.Link>
            <Nav.Link href="#contact" className={activeLink === 'contact' ? 'active' : ''} onClick={() => setActiveLink('contact')}>Contact</Nav.Link>
            <Nav.Link href="#blog" className={activeLink === 'blog' ? 'active' : ''} onClick={() => setActiveLink('blog')}>Blog</Nav.Link>
            <Nav.Link href="#faq" className={activeLink === 'faq' ? 'active' : ''} onClick={() => setActiveLink('faq')}>FAQ</Nav.Link>
          </Nav>
          <span>
            <button className="vvd" onClick={() => console.log('Login')}>Login</button>
            <button className="vvd" onClick={() => console.log('Sign Up')}>Sign Up</button>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
