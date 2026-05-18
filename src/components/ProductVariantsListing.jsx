import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productpage.css";
import FormModal from "../PopupModal/FormModal";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { LISTING_TYPE, STORE_ID } from "../constants/catalog";
import CatalogBreadcrumb from "./CatalogBreadcrumb";

const slugToTitle = (slug = "") =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function ProductVariantsListing() {
  const { categorySlug, subcategorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const categoryFromState = location.state?.category;
  const categoryName =
    location.state?.categoryName ||
    categoryFromState?.name ||
    slugToTitle(categorySlug);
  const subcategory = location.state?.subcategory;
  const subcategoryName =
    subcategorySlug === "all" ? "" : subcategory?.name || slugToTitle(subcategorySlug);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageTitle = useMemo(() => {
    if (subcategoryName) {
      return subcategoryName;
    }
    return categoryName || "Products";
  }, [categoryName, subcategoryName]);

  const categoryId = categoryFromState?.id;

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("catlog/category-variants/", {
        params: {
          search: "",
          category: categoryName,
          subcategory: subcategoryName || "",
          price_min: "",
          price_max: "",
          options: "",
          store_id: STORE_ID,
          listing_type: LISTING_TYPE,
          is_suspended: false,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Failed to load products. Please try again.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [categoryName, subcategoryName]);

  const getProductImage = (product) =>
    product.images?.[0]?.image?.image || product.product?.image?.image || pm;

  const getPrice = (product) => {
    const offerPrice = product.prices?.sale_offer_price;
    const salePrice = product.prices?.sale_price;

    if (offerPrice) {
      return `Rs. ${offerPrice.toLocaleString("en-IN")}`;
    }

    if (salePrice) {
      return `Rs. ${salePrice.toLocaleString("en-IN")}`;
    }

    return "Quote on request";
  };

  const handleEnquire = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
    });
    setShow(true);
  };

  const subcategoryBreadcrumb =
    subcategorySlug === "all"
      ? null
      : { label: subcategoryName || slugToTitle(subcategorySlug) };

  return (
    <main className="catalog-page catalog-pro">
      <div className="container">
        <header className="catalog-pro-header">
          <CatalogBreadcrumb
            items={[
              { label: "Categories", to: "/categories" },
              categoryId
                ? {
                    label: categoryName,
                    to: `/categories/${categoryId}/${categorySlug}`,
                  }
                : { label: categoryName },
              ...(subcategoryBreadcrumb ? [subcategoryBreadcrumb] : []),
            ]}
          />
          <h1>{pageTitle}</h1>
          <p className="catalog-subtitle">
            Industrial equipment available for purchase. Request a quote for
            delivery to your site.
          </p>
        </header>

        <div className="catalog-context-bar">
          <p>
            Showing results for <strong>{categoryName}</strong>
            {subcategoryName ? (
              <>
                {" "}
                &rarr; <strong>{subcategoryName}</strong>
              </>
            ) : null}
          </p>
        </div>

        <div className="catalog-toolbar">
          <p className="catalog-results-meta">
            {!loading && !error
              ? `${products.length} product${products.length === 1 ? "" : "s"}`
              : "\u00a0"}
          </p>
          <button
            type="button"
            className="btn-catalog-back"
            onClick={() => navigate(-1)}
          >
            Back
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

        {!loading && !error && products.length > 0 && (
          <div className="product-pro-grid">
            {products.map((product) => (
              <article key={product.id} className="product-pro-card">
                <div className="product-pro-image">
                  <img
                    src={getProductImage(product)}
                    alt=""
                    onError={(e) => {
                      e.target.src = pm;
                    }}
                  />
                </div>
                <div className="product-pro-body">
                  <h3>{product.name}</h3>
                  {product.sku_code && (
                    <p className="product-pro-sku">SKU: {product.sku_code}</p>
                  )}
                  <div className="product-pro-footer">
                    <span className="product-pro-price">{getPrice(product)}</span>
                    <button
                      type="button"
                      className="btn-catalog-primary"
                      onClick={() => handleEnquire(product)}
                    >
                      Request quote
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="catalog-empty-state">
            <p>No products match this selection.</p>
            <button
              type="button"
              className="btn-catalog-outline"
              onClick={() => navigate("/categories")}
            >
              Browse categories
            </button>
          </div>
        )}

        <FormModal
          selectedProduct={selectedProduct}
          show={show}
          setShow={setShow}
        />
      </div>
    </main>
  );
}

export default ProductVariantsListing;
