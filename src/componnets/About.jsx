import React from "react";
import "./about.css";
import craneImage from "./images/kstians.webp";

function About() {
  return (
    <section className="benefits-container">
      <div className="benefits-content">
        {/* <h4 className="highlight-text">SOME FEATURES AND</h4> */}
        <h3 className="about-title">About</h3>

        <div >
          <b>Site Exit</b> Revolutionizes Construction Site Management with Its Rockless Stabilized Construction Device, Replacing Costly and Ineffective Traditional Rock Entrances.
        </div>
        <div className="mt-2">
          <b>SITE-EXIT</b> revolutionizes construction site management with its <b>rockless stabilized construction device,</b> replacing costly and ineffective traditional rock entrances. Our <b>patented</b> design ensures optimal performance, helping contractors save <b>time, money, and resources</b> while supporting <b>sustainability</b>.
        </div>
        <div className="mt-2">
        With its eco-friendly design, Site Exit reduces the environmental impact of construction sites, making it an attractive solution for contractors committed to sustainable practices. Plus, its easy installation and reusable design make it a valuable asset for contractors working on multiple projects.
        </div>
      </div>
      <div className="benefits-image">
        <img src={craneImage} alt="Crane" className="benefit-img" />
        {/* <div className="yellow-accent"></div> */}
      </div>
    </section>
  );
};

export default About;
