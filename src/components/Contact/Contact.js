import React from "react";
import "./Contact.css"; // Make sure to create a CSS file for styling

const Contact = () => {
  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Us</h2>
      <div className="contact-content">
        {/* Form Section */}
        <div className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send</button>
        </div>

        {/* Map Section */}
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps/embed?..."
            title="Google Map"
            width="100%"
            height="100%"
            style={{ border: "0" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
