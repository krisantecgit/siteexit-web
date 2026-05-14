import React from "react";
import "./howdoesitwork.css";
import step1Img from "./images/hdiw1.webp";
import step2Img from "./images/hdiw2.webp";
import step3Img from "./images/hdit3.webp";

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2 className="section-title">HOW DOES IT WORK</h2>

      <div className="step step-1">
        <div className="step-content">
          <h3><span>1</span> <div>Find Your Equipment</div></h3>
          <p>
            View our selection of construction equipment available for rent or sale.
            Browse through our catalog to find the equipment that meets your needs.
          </p>
          <p>
            If you can’t find what you’re looking for, simply raise a request and we’ll
            source it for you.
          </p>
        </div>
        <img src={step1Img} alt="Find Equipment" className="step-image" />
      </div>

      <div className="step step-2">
        <img src={step2Img} alt="Order Online" className="step-image" />
        <div className="step-content">
          <h3><span>2</span> <div>Find The Equipment And Order It Online</div></h3>
          <p>
            Our team would verify the equipment’s availability and ensure a seamless
            rental or purchase experience.
          </p>
        </div>
      </div>

      <div className="step step-3">
        <div className="step-content">
          <h3><span>3</span> <div>Get The Equipment Shipped to Your Location</div></h3>
          <p>
            We'll deliver the equipment to your desired location, ensuring it's in good working condition and ready for use.
          </p>
        </div>
        <img src={step3Img} alt="Get Equipment" className="step-image" />
      </div>
    </section>
  );
};

export default HowItWorks;
