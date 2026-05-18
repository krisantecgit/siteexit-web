import React from "react";
import { Link } from "react-router-dom";

function CatalogBreadcrumb({ items = [] }) {
  return (
    <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          <span className="catalog-breadcrumb-sep">/</span>
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span className="catalog-breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default CatalogBreadcrumb;
