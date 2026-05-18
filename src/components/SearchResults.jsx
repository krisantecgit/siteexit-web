import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productpage.css";
import "./catalogBrowse.css";
import FormModal from "../PopupModal/FormModal";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";

function SearchResults({ initialProducts = null, title = "" }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const storeId = searchParams.get("store_id") || STORE_ID;
  const [products, setProducts] = useState(initialProducts || []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    axiosInstance
      .get("catlog/category-variants/", {
        params: {
          search: query,
          category: "",
          subcategory: "",
          price_min: "",
          price_max: "",
          options: "",
          store_id: storeId,
          listing_type: "buy",
          is_suspended: false,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Failed to load search results. Please try again.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [initialProducts, query, storeId]);

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

  const openProduct = (product) => {
    const slug = product.slug || product.product?.slug;
    if (slug) {
      navigate(`/product/${slug}`, {
        search: `variant=${product.id}`,
        state: { variantId: product.id },
      });
    }
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
    <main className="catalog-browse search-results-page">
      <div className="container">
        <div className="search-results-header">
          <span className="catalog-eyebrow">Search results</span>
          <h1>{title || (query ? `Results for "${query}"` : "Search products")}</h1>
        </div>

        {loading && (
          <div className="catalog-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger catalog-alert">{error}</div>
        )}

        {!loading && !error && (
          <div className="product-pro-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <article
                  key={product.id}
                  className="product-pro-card"
                  onClick={() => openProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      openProduct(product);
                    }
                  }}
                >
                  <div className="product-pro-image">
                    <img
                      src={getProductImage(product)}
                      alt=""
                      onError={(event) => {
                        event.target.src = pm;
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
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEnquire(product);
                        }}
                      >
                        Request quote
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="catalog-empty-state catalog-grid-empty">
                <p>No products found for this search.</p>
              </div>
            )}
          </div>
        )}

        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      </div>
    </main>
  );
}

export default SearchResults;
