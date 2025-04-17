import React from "react";
import { motion } from "framer-motion";
import "./End.css";

// Static data for footer links with real URLs
const footerData = {
  company: [
    { label: "Careers", href: "https://www.indeed.com/q-Remote-Software-Engineer-jobs.html" },
    { label: "Blog", href: "https://www.forbes.com/careers/" },
    { label: "Press", href: "https://techcrunch.com/category/startups/" },
  ],
  resources: [
    { label: "Documentation", href: "https://developer.mozilla.org/en-US/" },
    { label: "Help Center", href: "https://support.zendesk.com/hc/en-us" },
    { label: "Guides", href: "https://www.smashingmagazine.com/guides/" },
    { label: "API", href: "https://x.ai/api" }, // xAI API as per guidelines
  ],
  legal: [
    { label: "Privacy", href: "https://www.termsfeed.com/blog/sample-privacy-policy-template/" },
    { label: "Terms", href: "https://www.termsfeed.com/blog/sample-terms-of-service-template/" },
    { label: "Security", href: "https://www.cloudflare.com/learning/security/what-is-cybersecurity/" },
    { label: "Cookies", href: "https://www.gdpr.eu/cookies/" },
  ],
  socials: [
    {
      icon: "https://img.icons8.com/ios-filled/50/ffffff/x.png",
      href: "https://x.com",
      alt: "X Platform",
    },
    {
      icon: "https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png",
      href: "https://www.facebook.com",
      alt: "Facebook",
    },
    {
      icon: "https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png",
      href: "https://www.instagram.com",
      alt: "Instagram",
    },
    {
      icon: "https://img.icons8.com/ios-filled/50/ffffff/linkedin.png",
      href: "https://www.linkedin.com",
      alt: "LinkedIn",
    },
  ],
};

const End = () => {
  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <footer className="end-section" aria-labelledby="footer-heading">
      <motion.div
        className="footer-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <div className="footer-content">
        <div className="footer-column">
          <h3 className="footer-logo" id="footer-heading">
            HireReady
          </h3>
          <p className="footer-tagline">
            Connecting talent with opportunities in the digital age.
          </p>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            {footerData.company.map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <ul>
            {footerData.resources.map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            {footerData.legal.map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="copyright">© 2025 HireReady. All rights reserved.</p>
        <div className="social-icons">
          {footerData.socials.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              className="social-icon"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              aria-label={social.alt}
            >
              <img
                src={social.icon}
                alt=""
                className="social-icon-img"
                aria-hidden="true"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default End;