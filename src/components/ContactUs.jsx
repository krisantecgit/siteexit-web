import React from "react";
import "./contact.css";
import git from "./images/touch.webp"

const ContactForm = () => {
    return (
        <div className="contact-container">
            <div className="contact-banner">
                <h3>Contact Us</h3>
            </div>
            <div className="container">
                <div className="left-section">
                    <img src={git} alt="Get in Touch" className="contact-image" />
                </div>
                <div className="right-section">
                    <h2>GET IN TOUCH</h2>
                    <form>
                        <input type="text" placeholder="Full Name" required />
                        <input type="text" placeholder="Mobile No" required />
                        <input type="email" placeholder="Email" required />
                        <input type="text" placeholder="Location" required />
                        <textarea placeholder="Message" required></textarea>
                        <button type="submit">Submit</button>
                    </form>
                </div>
                <div className="map-section">
                    <iframe
                        title="map"
                        src="https://www.google.com/maps/embed?@30.4380174,-84.3038144,17z?entry=ttu&g_ep=EgoyMDI1MDMxNy4wIKXMDSoASAFQAw%3D%3D"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
