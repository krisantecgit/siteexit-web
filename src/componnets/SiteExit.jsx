import React from "react";
import "./siteexit.css"
import f1 from "./images/f1.webp";
import f2 from "./images/f2.webp";
import f3 from "./images/f3.webp";
import f4 from "./images/f4.webp";

const SiteExit = () => {
  const features = [
    {
      icon: f1, // Replace with an actual image/icon
      title: "Save Time & Money",
      description: "Eliminates ineffective and costly traditional rock-based entrances.",
    },
    {
      icon: f2, // Replace with an actual image/icon
      title: "Efficient Mud & Sediment Removal",
      description: "Keeps vehicle tires clean while protecting the ground surface.",
    },
    {
      icon: f3, // Replace with an actual image/icon
      title: "Eco-Friendly & Reusable",
      description: "Designed for sustainability, reducing waste and environmental impact.",
    },
    {
      icon: f4, // Replace with an actual image/icon
      title: "100% Made In The USA",
      description: "Premium quality with extendable components for long-term use.",
    },
  ];

  return (
    <div className="why-choose">
      <h2 className="why-title">WHY CHOOSE SITE-EXIT?</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon"><img src={feature.icon} height={40} width={36} /></div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteExit;
