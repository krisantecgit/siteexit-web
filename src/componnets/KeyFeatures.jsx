import React from "react";
import "./keyfeature.css"; // Import the CSS file
import i1 from  "./images/i1.webp";
import i2 from  "./images/i2.webp";
import i3 from  "./images/i3.webp";

const KeyFeatures = () => {
  const features = [
    {
      image: i1,
      title: "Durable:",
      description: "Built with high-quality materials for long-lasting performance, even in rugged conditions.",
    },
    {
      image: i2,
      title: "Reusable:",
      description: "Cost-effective and sustainable, designed for multiple uses without compromising efficiency.",
    },
    {
      image: i3,
      title: "Eco-Friendly:",
      description: "Reduces carbon footprint, prevents sediment runoff, and promotes environmentally responsible construction practices.",
    },
  ];

  return (
    <div className="key-features2">
      <h2 className="features-title2">KEY FEATURES</h2>
      <div className="features-grid2">
        {features.map((feature, index) => (
          <div className="feature-card2" key={index}>
            <img src={feature.image} alt={feature.title} className="feature-image2" />
            <h3 className="feature-title2">{feature.title}</h3>
            <p className="feature-description2">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeatures;
