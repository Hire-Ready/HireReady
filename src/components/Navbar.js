import { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.css"; // Import custom styles

const NavbarComponent = () => {
  const [activeLink, setActiveLink] = useState("home");

  return (
    <Navbar expand="md" className="crazy-navbar">
      <Container>
        <Navbar.Brand href="/" className="logo">🚀 CrazyNav</Navbar.Brand>
        <Navbar.Brand href="/" className="logo">🚀 CrazyNav</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {["home", "skills", "projects", "contact"].map((item) => (
              <Nav.Link
                key={item}
                href={`#${item}`}
                className={`crazy-link ${activeLink === item ? "active" : ""}`}
                onClick={() => setActiveLink(item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
