import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productpage.css";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";
import CatalogBreadcrumb from "./CatalogBreadcrumb";

const slugToTitle = (slug = "") =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function SubcategoryListing() {
  const { categoryId, categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategory = location.state?.category;
  const [subcategories, setSubcategories] = useState([]);
  const [categoryName, setCategoryName] = useState(
    selectedCategory?.name || slugToTitle(categorySlug)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("catlog/sub-categories/", {
        params: {
          category: categoryId,
          is_suspended: false,
          store_id: STORE_ID,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        const nextSubcategories = Array.isArray(data) ? data : [];
        setSubcategories(nextSubcategories);

        const apiCategoryName = nextSubcategories[0]?.category_name;
        if (apiCategoryName) {
          setCategoryName(apiCategoryName);
        }
      })
      .catch(() => {
        setError("Failed to load subcategories. Please try again.");
        setSubcategories([]);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const categorySlugForRoute = selectedCategory?.slug || categorySlug || categoryId;

  const openProducts = (subcategory) => {
    navigate(`/products/${categorySlugForRoute}/${subcategory.slug || subcategory.id}`, {
      state: {
        category: selectedCategory,
        categoryName: categoryName || selectedCategory?.name,
        subcategory,
      },
    });
  };

  const openAllProducts = () => {
    navigate(`/products/${categorySlugForRoute}/all`, {
      state: {
        category: selectedCategory,
        categoryName: categoryName || selectedCategory?.name,
      },
    });
  };

  return (
    <main className="catalog-page catalog-pro">
      <div className="container">
        <header className="catalog-pro-header">
          <CatalogBreadcrumb
            items={[
              { label: "Categories", to: "/categories" },
              { label: categoryName },
            ]}
          />
          <h1>{categoryName}</h1>
          <p className="catalog-subtitle">
            {selectedCategory?.description ||
              "Choose a product line to view available equipment and request a quote."}
          </p>
        </header>

        <div className="catalog-toolbar">
          <p className="catalog-results-meta">
            {!loading && !error
              ? `${subcategories.length} product line${subcategories.length === 1 ? "" : "s"}`
              : "\u00a0"}
          </p>
          <button
            type="button"
            className="btn-catalog-back"
            onClick={() => navigate("/categories")}
          >
            All categories
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

        {!loading && !error && subcategories.length > 0 && (
          <div className="subcategory-pro-grid">
            {subcategories.map((subcategory) => {
              const imageUrl = subcategory.image?.image || pm;

              return (
                <button
                  key={subcategory.id}
                  type="button"
                  className="subcategory-pro-card"
                  onClick={() => openProducts(subcategory)}
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
                  <div className="subcategory-pro-body">
                    <h3>{subcategory.name}</h3>
                    {subcategory.description && <p>{subcategory.description}</p>}
                    <span className="subcategory-pro-link">View products</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && !error && subcategories.length === 0 && (
          <div className="catalog-empty-state">
            <p>No subcategories listed for this category.</p>
            <button
              type="button"
              className="btn-catalog-primary"
              onClick={openAllProducts}
            >
              View all products
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default SubcategoryListing;
