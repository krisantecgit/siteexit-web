import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productpage.css";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";
import CatalogBreadcrumb from "./CatalogBreadcrumb";

function CategoryListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("catlog/with-buy-or-both/", {
        params: {
          is_suspended: false,
          store_id: STORE_ID,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Failed to load categories. Please try again.");
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openSubcategories = (category) => {
    navigate(`/categories/${category.id}/${category.slug}`, {
      state: { category },
    });
  };

  return (
    <main className="catalog-page catalog-pro">
      <div className="container">
        <header className="catalog-pro-header">
          <CatalogBreadcrumb items={[{ label: "Categories" }]} />
          <h1>Equipment categories</h1>
          <p className="catalog-subtitle">
            Select a category to view product ranges and submit a quote request
            for your job site.
          </p>
        </header>

        <div className="catalog-toolbar">
          <p className="catalog-results-meta">
            {!loading && !error
              ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"} available`
              : "\u00a0"}
          </p>
          <button
            type="button"
            className="btn-catalog-back"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </div>

        {loading && (
          <div className="catalog-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger catalog-alert" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="category-pro-grid">
            {categories.map((category) => {
              const imageUrl = category.image?.image || pm;

              return (
                <button
                  key={category.id}
                  type="button"
                  className="category-pro-item"
                  onClick={() => openSubcategories(category)}
                >
                  <div className="category-pro-media">
                    <img
                      src={imageUrl}
                      alt=""
                      onError={(e) => {
                        e.target.src = pm;
                      }}
                    />
                  </div>
                  <span className="category-pro-name">{category.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="catalog-empty-state">
            <p>No categories are available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CategoryListing;
