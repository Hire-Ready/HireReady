import React from 'react';
import './End.css';

// Static data for footer links (frontend-only)
const footerData = {
  company: [
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Guides', href: '#' },
    { label: 'API', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
  socials: [
    { icon: 'https://img.icons8.com/ios-filled/50/ffffff/x.png', href: '#', alt: 'X (Twitter)' }, // X (Twitter)
    { icon: 'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png', href: '#', alt: 'Facebook' }, // Facebook
    { icon: 'https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png', href: '#', alt: 'Instagram' }, // Instagram
    { icon: 'https://img.icons8.com/ios-filled/50/ffffff/linkedin.png', href: '#', alt: 'LinkedIn' }, // LinkedIn
  ],
};

const End = () => {
  return (
    <footer className="end-section">
      <div className="footer-content">
        <div className="footer-column">
          <h3 className="footer-logo">CosmicHire</h3>
          <p className="footer-tagline">
            Connecting talent with opportunities in the digital age.
          </p>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            {footerData.company.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <ul>
            {footerData.resources.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            {footerData.legal.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="copyright">
          © 2024 CosmicHire. All rights reserved.
        </p>
        <div className="social-icons">
          {footerData.socials.map((social, index) => (
            <a key={index} href={social.href} className="social-icon">
              <img src={social.icon} alt={social.alt} className="social-icon-img" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default End;