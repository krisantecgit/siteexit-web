import React, { useEffect, useMemo, useState } from "react";
import "./productpage.css";
import pm from "./images/products.webp";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import FormModal from "../PopupModal/FormModal";
import axiosInstance from "../utils/axiosInstance";

const STORE_ID = 5;

const priceRanges = [
  { label: "Price Range", min: "", max: "" },
  { label: "Under Rs. 5,000", min: "", max: "5000" },
  { label: "Rs. 5,000 - Rs. 10,000", min: "5000", max: "10000" },
  { label: "Above Rs. 10,000", min: "10000", max: "" },
];

function ProductGrid() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingCategories(true);
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
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);
        setActiveCategory(nextCategories.find((category) => category.name === "Living Room") || nextCategories[0] || null);
      })
      .catch(() => {
        setError("Failed to load categories. Please try again.");
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!activeCategory?.id) {
      return;
    }

    setActiveSubcategory("");

    axiosInstance
      .get("catlog/sub-categories/", {
        params: {
          category: activeCategory.id,
          is_suspended: false,
          store_id: STORE_ID,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setSubcategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setSubcategories([]);
      });
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory?.name) {
      return;
    }

    setLoadingProducts(true);
    setError(null);

    axiosInstance
      .get("catlog/category-variants/", {
        params: {
          search,
          category: activeCategory.name,
          subcategory: activeSubcategory,
          price_min: priceRange.min,
          price_max: priceRange.max,
          options: "",
          store_id: STORE_ID,
          listing_type: "buy",
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
      .finally(() => setLoadingProducts(false));
  }, [activeCategory, activeSubcategory, priceRange, search]);

  const selectedSubcategoryLabel = useMemo(
    () => activeSubcategory || "Sub-Category",
    [activeSubcategory]
  );

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

    return "Contact for price";
  };

  const handleEnquire = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
    });
    setShow(true);
  };

  return (
    <section className="shop-catalog">
      <div className="container">
        <div className="shop-toolbar">
          <div>
            <span className="catalog-eyebrow">Browse equipment</span>
            <h3 className="fw-bold text-dark about-title catalog-page-title">Products</h3>
          </div>
          <label className="catalog-search">
            <input
              type="search"
              value={search}
              placeholder="What are you searching for?"
              onChange={(e) => setSearch(e.target.value)}
            />
            <span>Search</span>
          </label>
        </div>

        {loadingCategories && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loadingCategories && (
          <>
            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={activeCategory?.id === category.id ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {activeCategory?.id === category.id && <span>ON</span>}
                  {category.name}
                </button>
              ))}
            </div>

            <div className="filter-row">
              <span className="filter-label">FILTER</span>
              <select
                value={activeSubcategory}
                onChange={(e) => setActiveSubcategory(e.target.value)}
                aria-label={selectedSubcategoryLabel}
              >
                <option value="">Sub-Category</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              <select
                value={priceRange.label}
                onChange={(e) => setPriceRange(priceRanges.find((range) => range.label === e.target.value) || priceRanges[0])}
                aria-label="Price Range"
              >
                {priceRanges.map((range) => (
                  <option key={range.label} value={range.label}>
                    {range.label}
                  </option>
                ))}
              </select>
              <select aria-label="More Options" defaultValue="">
                <option value="">More Options</option>
              </select>
              <div className="sort-control">
                <span>SORT BY</span>
                <select aria-label="Sort products" defaultValue="featured">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {loadingProducts && (
              <div className="text-center py-5">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!loadingProducts && !error && (
              <div className="product-grid">
                {products.length > 0 ? (
                  products.map((product) => (
                    <article key={product.id} className="shop-product-card">
                      <div className="shop-product-image">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => { e.target.src = pm; }}
                        />
                      </div>
                      <div className="shop-product-body">
                        <h5>{product.name}</h5>
                        <div className="shop-product-meta">
                          <strong>{getPrice(product)}</strong>
                          {!product.availability && <span>Out of stock</span>}
                        </div>
                        <button className="btn btn-dark" onClick={() => handleEnquire(product)}>
                          Enquire
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-catalog product-empty">
                    <p>No products found.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      </div>
    </section>
  );
}

export default ProductGrid;
