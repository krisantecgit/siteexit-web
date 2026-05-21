import React from "react";
import "./footer.css";
import { FaCamera, FaFacebook, FaGoogle, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaLocationDot, FaMobileScreen } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import img2 from "./images/foot-logo.webp"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Information Section */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li>&gt; Main Home</li>
            <li>&gt; About Us</li>
            <li>&gt; Contact Us</li>
            <li>&gt; Products</li>
          </ul>
        </div>

       {/* Contact Info Section */}
<div className="footer-section">
  <h3>Contact Us</h3>

  <p>
    <FaLocationDot className="react-icon" />
    Address: Ben
  </p>

  <p>
    <FaMobileScreen className="react-icon" />
    408-216-7968
  </p>

  <p>
    <IoIosMail className="react-icon" />
    Email:
    <span className="email"> 4sridar@gmail.com</span>
  </p>
</div>

        {/* About Company Section */}
        <div className="footer-section">
          <h3>About Company</h3>
          <div><img  src={img2} height={60} width={100}/></div>
          <p>
            KSTians is a diversified construction company, made up of a team of people
            who are proven in their industries. All working to design, build,
            transport, operate, and maintain projects all over the USA.
          </p>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom d-flex justify-content-around">
        <div className="social-icons">
          <span><FaFacebook /></span> <span><FaCamera /></span> <span><FaGoogle /></span> <span><FaInstagram /></span> <span><FaLinkedin /></span>
        </div>
        <p>© 2025 Name here. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
