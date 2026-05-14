import React from "react";
import "./testimonial.css";
import productsIcon from "./images/project.webp";
import clientsIcon from "./images/team.webp";
import projectsIcon from "./images/docs.webp";
import testimonialImg from "./images/engineer.webp";



function TestimonialsAndStats() {
  return (
    <div>

      {/* Testimonials Section */}
      <section className="testimonial-section">
        <h2 className="testimonial-title">TESTIMONIALS</h2>
        <div className="testimonial-content">
          <img src={testimonialImg} alt="Testimonial" className="testimonial-img" />
          <div className="testimonial-text">
            <p>
              So happy to write this testimonial to see that I'm very thankful to you guys. 
              You are so awesome and professional, providing great service while offering 
              employees the best training and a working environment in which they can excel.
            </p>
            <h4 className="testimonial-author">Dvithik - <span>Creative Heads Inc</span></h4>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TestimonialsAndStats;
