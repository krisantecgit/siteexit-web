import React from "react";
import "./feature.css";
import featureImage from "./images/key.webp"; // Update with the correct image path
import precision from "./images/precision.webp";
import study from "./images/study.webp";
import nodelay from "./images/nodelay.webp";

const featuresData = [
  {
    id: 1,
    icon: precision, // Replace with actual SVG or image
    title: "Precision",
    description:
      "Accurately understand the needs of customers, provide efficient and cost-effective construction equipment for various customers in different operations.",
  },
  {
    id: 2,
    icon: study,
    title: "Study",
    description:
      "Constantly study industry trends, commit to new technologies and methods, and launch the latest technical construction engineering equipment.",
  },
  {
    id: 3,
    icon: nodelay,
    title: "No Delay",
    description:
      "Respond quickly to any questions and needs of customers, and collect the latest and best quality equipment for customers in the first time.",
  },
  {
    id: 4,
    icon: study,
    title: "Study",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    id: 5,
    image: featureImage, // The center image
  },
  {
    id: 6,
    icon: precision,
    title: "Precision",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  },
];

function Features() {
  return (
    <section className="features-section2">
      <h3 className="about-title">FEATURES</h3>
      <div className="features-grid2">
        {featuresData.map((feature) => (
          <div key={feature.id} className="feature-card2">
            {feature.image ? (
              <img src={feature.image} alt="Feature" className="feature-image2" />
            ) : (
              <>
                <div className="feature-icon2"><img src={feature.icon} width={40} height={45} alt="alt" /></div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description2">{feature.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
