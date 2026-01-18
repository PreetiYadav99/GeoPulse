import React from 'react';
import { FaWhatsapp, FaGithub, FaTelegramPlane, FaLinkedin, FaPhone } from 'react-icons/fa';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-logo">SoilScope</div>
      <div className="footer-links">
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-link">
          <FaWhatsapp color="#25D366" size={20} /> WhatsApp
        </a>
        <a href="https://github.com/yourrepo" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer-link">
          <FaGithub color="#171515" size={20} /> GitHub
        </a>
        <a href="https://t.me/username" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="footer-link">
          <FaTelegramPlane color="#0088cc" size={20} /> Telegram
        </a>
        <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-link">
          <FaLinkedin color="#0A66C2" size={20} /> LinkedIn
        </a>
        <a href="tel:+1234567890" aria-label="Phone" className="footer-link">
          <FaPhone color="#4CAF50" size={20} /> +1 234 567 890
        </a>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} SoilScope. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
