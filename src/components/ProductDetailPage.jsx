import React, { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiHeart, FiShoppingBag } from "react-icons/fi";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productDetail.css";
import FormModal from "../PopupModal/FormModal";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Quote on request";
  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "").trim();

const getImageSource = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.image?.image || image.image || image.url || image.src || "";
};

const getProductImages = (product) => {
  const candidates = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
    ...(Array.isArray(product?.product_images) ? product.product_images : []),
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
    ...(Array.isArray(product?.sub_images) ? product.sub_images : []),
  ];

  const seen = new Set();
  return candidates
    .map((image) => ({
      id: image?.id || getImageSource(image),
      name: image?.name || "Product image",
      src: getImageSource(image),
    }))
    .filter((image) => {
      if (!image.src || seen.has(image.src)) {
        return false;
      }
      seen.add(image.src);
      return true;
    });
};

const normalizeVariantDetail = (variant, seoProduct = {}) => {
  const baseProduct = variant?.product || {};
  const prices = variant?.prices || {};

  return {
    ...baseProduct,
    ...seoProduct,
    ...variant,
    brand: seoProduct.brand ?? baseProduct.brand,
    code: variant?.sku_code || baseProduct.code,
    description: seoProduct.description ?? baseProduct.description,
    discount_percentage: seoProduct.discount_percentage ?? baseProduct.discount_percentage,
    image: variant?.image || baseProduct.image,
    images: Array.isArray(variant?.images) ? variant.images : [],
    listing_type: variant?.varient_listing_type || baseProduct.listing_type,
    measurement_unit: seoProduct.measurement_unit ?? baseProduct.measurement_unit,
    product_id: baseProduct.id,
    rental_price: prices.rental_price ?? baseProduct.rental_price,
    sale_offer_price: prices.sale_offer_price ?? baseProduct.sale_offer_price,
    sale_price: prices.sale_price ?? baseProduct.sale_price,
  };
};

function ProductDetailPage({ productData = null }) {
  const { productSlug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const variantId =
    searchParams.get("variant") ||
    location.state?.variantId ||
    productData?.variantId ||
    productData?.variant_id;
  const [product, setProduct] = useState(productData);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [orderMode, setOrderMode] = useState("buy");
  const [rentStartDate, setRentStartDate] = useState("");

  useEffect(() => {
    if (variantId) {
      setLoading(true);
      setError(null);

      Promise.all([
        axiosInstance.get(`catlog/product-variant-detail/${variantId}/`),
        axiosInstance.get(`catlog/seo-url/${productSlug}/`),
      ])
        .then(([variantRes, seoRes]) => {
          if (seoRes.data?.product_type !== "product") {
            setError("Product not found.");
            setProduct(null);
            return;
          }

          setProduct(normalizeVariantDetail(variantRes.data, seoRes.data.product_data));
        })
        .catch(() => {
          setError("Failed to load product details. Please try again.");
          setProduct(null);
        })
        .finally(() => setLoading(false));
      return;
    }

    if (productData) {
      setProduct(productData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    axiosInstance
      .get(`catlog/seo-url/${productSlug}/`)
      .then((res) => {
        if (res.data?.product_type === "product") {
          setProduct(res.data.product_data);
        } else {
          setError("Product not found.");
          setProduct(null);
        }
      })
      .catch(() => {
        setError("Failed to load product details. Please try again.");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productData, productSlug, variantId]);

  const productImages = useMemo(() => getProductImages(product), [product]);
  const imageUrl = selectedImage || productImages[0]?.src || pm;
  const salePrice = formatMoney(product?.sale_offer_price || product?.sale_price);
  const originalSalePrice = product?.sale_offer_price ? formatMoney(product?.sale_price) : null;
  const rentPrice = formatMoney(product?.rental_price);
  const description = stripHtml(product?.description || "");

  const handleQuote = () => {
    setSelectedProduct({
      id: product?.id,
      name: product?.name,
      image: imageUrl,
    });
    setShow(true);
  };

  useEffect(() => {
    setSelectedImage(productImages[0]?.src || "");
  }, [productImages]);

  return (
    <main className="pd-page">
      <div className="pd-wrap">

        {loading && (
          <div className="pd-center">
            <div className="pd-spinner" role="status" />
          </div>
        )}

        {!loading && error && (
          <div className="pd-error">{error}</div>
        )}

        {!loading && !error && product && (
          <div className="pd-shell">

            {/* ── LEFT — dark image panel ── */}
            <div className="pd-left">
              <div className="pd-left-inner">
                <div className="pd-chips">
                  <span className="pd-chip">
                    {product.listing_type === "both" ? "Buy / Rent" : product.listing_type}
                  </span>
                  {product.discount_percentage && (
                    <span className="pd-chip pd-chip-deal">{product.discount_percentage}% OFF</span>
                  )}
                </div>

                <div className="pd-img-frame">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    onError={(e) => { e.target.src = pm; }}
                  />
                </div>

                <div className="pd-thumbs" aria-label="Product images">
                  {(productImages.length > 0 ? productImages : [{ id: "fallback", name: product.name, src: pm }]).map((image, index) => (
                    <button
                      key={`${image.id}-${index}`}
                      type="button"
                      className={`pd-thumb${imageUrl === image.src ? " active" : ""}`}
                      onClick={() => setSelectedImage(image.src)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={image.src}
                        alt=""
                        onError={(e) => { e.target.src = pm; }}
                      />
                    </button>
                  ))}
                </div>

                <button className="pd-wish-btn" type="button" aria-label="Wishlist">
                  <FiHeart />
                  <span>Save to wishlist</span>
                </button>
              </div>
            </div>

            {/* ── RIGHT — info panel ── */}
            <div className="pd-right">
              <div className="pd-title-block">
                {product.brand?.brand_name && (
                  <p className="pd-brand">{product.brand.brand_name}</p>
                )}
                <h1 className="pd-name">{product.name}</h1>
              </div>

              <div className="pd-spec-row">
                <div className="pd-spec-item">
                  <span className="pd-spec-label">Code</span>
                  <span className="pd-spec-val">{product.code || "N/A"}</span>
                </div>
                <div className="pd-spec-item">
                  <span className="pd-spec-label">Category</span>
                  <span className="pd-spec-val">{product.subcategory_name?.[0] || "N/A"}</span>
                </div>
                <div className="pd-spec-item">
                  <span className="pd-spec-label">Unit</span>
                  <span className="pd-spec-val">{product.measurement_unit || "N/A"}</span>
                </div>
              </div>

              {/* Mode selector */}
              <div className="pd-purchase-panel">
<div className="pd-mode-toggle" aria-label="Select purchase type">
  <label className={`pd-mode-option${orderMode === "buy" ? " active" : ""}`}>
    <input
      type="radio"
      name="orderMode"
      value="buy"
      checked={orderMode === "buy"}
      onChange={() => setOrderMode("buy")}
    />
    <span className="pd-mode-icon"><FiShoppingBag /></span>
    <span className="pd-mode-copy">
      <strong>Buy</strong>
      <small>Own this product</small>
    </span>
  </label>
  <label className={`pd-mode-option${orderMode === "rent" ? " active" : ""}`}>
    <input
      type="radio"
      name="orderMode"
      value="rent"
      checked={orderMode === "rent"}
      onChange={() => setOrderMode("rent")}
    />
    <span className="pd-mode-icon"><FiCalendar /></span>
    <span className="pd-mode-copy">
      <strong>Rent</strong>
      <small>Use it by the day</small>
    </span>
  </label>
</div>

{/* Price card — shows based on mode */}
<div className="pd-price-cards">
  {orderMode === "buy" ? (
    <div className="pd-price-card pd-buy-card">
      <span className="pd-price-tag">Sale Price</span>
      <strong className="pd-amount">{salePrice}</strong>
      {originalSalePrice && <del className="pd-original">{originalSalePrice}</del>}
      {product.discount_percentage && (
        <span className="pd-save">{product.discount_percentage}% off</span>
      )}
    </div>
  ) : (
    <div className="pd-price-card pd-rent-card">
      <span className="pd-price-tag">Rental Price</span>
      <strong className="pd-amount">{rentPrice}</strong>
      <span className="pd-per-day">per day</span>
      <div className="pd-date-wrap">
        <label className="pd-date-label">Start Date</label>
        <input
          type="date"
          className="pd-date-input"
          value={rentStartDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setRentStartDate(e.target.value)}
        />
      </div>
    </div>
  )}
</div>
              </div>

              <button className="pd-cta" type="button" onClick={handleQuote}>
                Request a Quote
              </button>

              {description && (
                <div className="pd-desc">
                  <p className="pd-desc-heading">About this product</p>
                  <p className="pd-desc-text">{description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      </div>
    </main>
  );
}

export default ProductDetailPage;
