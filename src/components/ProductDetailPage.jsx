import React, { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productDetail.css";
import FormModal from "../PopupModal/FormModal";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { addToBuyCart, addToRentCart } from "../redux/cartSlice";
import { toggleWishlistItem } from "../redux/wishlistSlice";

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Quote on request";
  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "").trim();

const chunkOptions = (arr, size) => {
  if (!Array.isArray(arr)) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

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
  const dispatch = useDispatch();
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const wishlistItems = useSelector((store) => store.wishlist?.items || []);

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
  const hasMeaningfulDiscount =
    Number(product?.sale_price) >
    Number(product?.sale_offer_price) &&
    (
      (
        (
          Number(product?.sale_price) -
          Number(product?.sale_offer_price)
        ) /
        Number(product?.sale_price)
      ) *
      100
    ) > 5;

  const originalSalePrice =
    hasMeaningfulDiscount
      ? formatMoney(product?.sale_price)
      : null;
  const rentPrice = formatMoney(product?.rental_price);
  const description = stripHtml(product?.description || "");
  const shortDescription =
    description.length > 320
      ? `${description.slice(0, 320)}...`
      : description;

  const isWishlisted = Boolean(product?.id && wishlistItems.some((item) => item.id === product.id));

  const getCartProduct = () => ({
    id: product?.id,
    name: product?.name,
    image: imageUrl,
    slug: product?.slug || productSlug,
    friendlyurl: product?.slug || productSlug,
    type: orderMode,
    offerPrice: orderMode === "buy"
      ? Number(product?.sale_offer_price || product?.sale_price || 0)
      : Number(product?.rental_price || 0),
    sale_offer_price: product?.sale_offer_price,
    sale_price: product?.sale_price,
    rental_price: product?.rental_price,
  });

  const handleQuote = () => {
    setSelectedProduct({
      id: product?.id,
      name: product?.name,
      image: imageUrl,
    });
    setShow(true);
  };

  const handleAddToCart = () => {
    const cartProduct = getCartProduct();

    if (orderMode === "rent") {
      dispatch(addToRentCart({
        ...cartProduct,
        fromDate: rentStartDate,
        cartItemId: `${product?.id}-${rentStartDate || "rent"}`,
      }));
      toast.success("Added to rental cart");
      return;
    }

    dispatch(addToBuyCart(cartProduct));
    toast.success("Added to cart");
  };

  const handleToggleWishlist = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userid");

    if (!token || !userId) {
      toast.error("Please login to save to wishlist");
      return;
    }

    dispatch(toggleWishlistItem(getCartProduct()));

    toast.success(
      isWishlisted
        ? "Removed from wishlist"
        : "Saved to wishlist"
    );
  };
  useEffect(() => {
    setSelectedImage(productImages[0]?.src || "");
  }, [productImages]);

  const validImages = productImages.length > 0 ? productImages : [{ id: "fallback", name: product?.name, src: pm }];
  const currentImageIndex = validImages.findIndex((img) => img.src === imageUrl);

  const handlePrevImage = () => {
    if (validImages.length <= 1) return;
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : validImages.length - 1;
    setSelectedImage(validImages[newIndex].src);
  };

  const handleNextImage = () => {
    if (validImages.length <= 1) return;
    const newIndex = currentImageIndex < validImages.length - 1 ? currentImageIndex + 1 : 0;
    setSelectedImage(validImages[newIndex].src);
  };

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
                  {validImages.length > 1 && (
                    <button className="pd-img-nav prev" onClick={handlePrevImage} aria-label="Previous image">
                      <FiChevronLeft />
                    </button>
                  )}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    onError={(e) => { e.target.src = pm; }}
                  />
                  {validImages.length > 1 && (
                    <button className="pd-img-nav next" onClick={handleNextImage} aria-label="Next image">
                      <FiChevronRight />
                    </button>
                  )}
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

                <button
                  className={`pd-wish-btn${isWishlisted ? " active" : ""}`}
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                >
                  <FiHeart />
                  <span>{isWishlisted ? "Saved to wishlist" : "Save to wishlist"}</span>
                </button>

                {description && (
                  <div className="pd-desc-box">
                    <p className="pd-desc-heading">
                      About this product
                    </p>

                    <p className="pd-desc-text">
                      {showFullDescription
                        ? description
                        : shortDescription}
                    </p>

                    {description.length > 320 && (
                      <button
                        type="button"
                        className="pd-read-more"
                        onClick={() =>
                          setShowFullDescription((prev) => !prev)
                        }
                      >
                        {showFullDescription
                          ? "Read Less"
                          : "Read More"}
                      </button>
                    )}
                  </div>
                )}

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
                {Array.isArray(product?.options) && product.options.length > 0 ? (
                  product.options.map((option, index) => (
                    <div className="pd-spec-item" key={index}>
                      <span className="pd-spec-label">{option.variant_type}</span>
                      <button className="pd-variant-btn" type="button">
                        {option.variant_option}
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="pd-spec-item">
                      <span className="pd-spec-label">Code</span>
                      <span className="pd-spec-val">{product.code || "N/A"}</span>
                    </div>
                    <div className="pd-spec-item">
                      <span className="pd-spec-label">Category</span>
                      <span className="pd-spec-val">{product.subcategory_name?.[0] || "N/A"}</span>
                    </div>
                  </>
                )}
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
                      <small> Own this product</small>
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
                      <small> Use it by the day</small>
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
                      {Number(product.discount_percentage) > 5 && (
                        <span className="pd-save">
                          {product.discount_percentage}% off
                        </span>
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

              <div className="pd-actions">
                <button className="pd-cart-cta" type="button" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                {/* <button className="pd-cta" type="button" onClick={handleQuote}>
                  Request a Quote
                </button> */}

              </div>

              {/* {description && (
                <div className="pd-desc">
                  <p className="pd-desc-heading">About this product</p>
                  <p className="pd-desc-text">{description}</p>
                </div>
              )} */}
            </div>
          </div>
        )}

        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      </div>
    </main>
  );
}

export default ProductDetailPage;
