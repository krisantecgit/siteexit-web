import React from "react";
import { Link } from "react-router-dom";
import "./productpage.css";

function ProductsTeaser() {
  return (
    <section className="products-teaser-pro">
      <div className="container">
        <header className="catalog-pro-header">
          <span className="catalog-eyebrow">Equipment catalog</span>
          <h1>Site-ready products</h1>
          <p className="catalog-subtitle">
            Browse categories for construction and site equipment. View
            specifications, compare options, and request a quote for your
            project.
          </p>
          <div className="products-teaser-actions">
            <Link to="/categories" className="btn-catalog-primary">
              Browse categories
            </Link>
            <Link to="/contact" className="btn-catalog-outline">
              Contact sales
            </Link>
          </div>
        </header>
      </div>
    </section>
  );
}

export default ProductsTeaser;
