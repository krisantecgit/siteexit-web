import React, { useState } from "react";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import pm from "./images/products.webp";
import "./ProductCard.css";
import LoginModal from "./Login/Login";
import axiosInstance from "../utils/axiosInstance";
import { removeWishlistItem, toggleWishlistItem } from "../redux/wishlistSlice";

const formatProductPrice = (value) => `Rs. ${Number(value).toLocaleString("en-IN")}`;

export const getProductImage = (product) =>
  product.images?.[0]?.image?.image || product.product?.image?.image || pm;

const getDiscountPercent = (product) => {
  const discount = Number(product.discount_percentage || product.product?.discount_percentage);
  const offerPrice = Number(product.prices?.sale_offer_price);
  const salePrice = Number(product.prices?.sale_price);

  if (Number.isFinite(discount) && discount > 0) {
    return Math.round(discount);
  }

  if (offerPrice > 0 && salePrice > offerPrice) {
    return Math.round(((salePrice - offerPrice) / salePrice) * 100);
  }

  return null;
};

export function getVariantStockStatus(product, mode = "buy") {
  const raw = mode === "rent" ? product.rental_stock : product.sale_stock;
  const effectiveStock = Number(raw);
  const stockKnown = Number.isFinite(effectiveStock);

  const isOutOfStock =
    (stockKnown && effectiveStock <= 0) ||
    (!stockKnown && product.availability === false);

  const isLimitedStock =
    stockKnown && effectiveStock >= 1 && effectiveStock <= 10 && !isOutOfStock;

  return { effectiveStock, isOutOfStock, isLimitedStock };
}

const getWishlistPostType = (mode) => (mode === "rent" ? "rental" : "sale");
const getWishlistCheckType = (mode) => (mode === "rent" ? "rent" : "buy");

function ProductCard({ product, mode = "buy", onOpen, onAdd, onEnquire }) {
  const dispatch = useDispatch();
  const [loginShow, setLoginShow] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const wishlistItems = useSelector((store) => store.wishlist?.items || []);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const getWishlistProduct = () => ({
    id: product.id,
    name: product.name,
    image: getProductImage(product),
    slug: product.slug || product.product?.slug,
    friendlyurl: product.slug || product.product?.slug,
    type: mode === "rent" ? "rent" : "buy",
    offerPrice:
      mode === "rent"
        ? Number(product.prices?.rental_price || 0)
        : Number(product.prices?.sale_offer_price || product.prices?.sale_price || 0),
    sale_offer_price: product.prices?.sale_offer_price,
    sale_price: product.prices?.sale_price,
    rental_price: product.prices?.rental_price,
  });

  const handleWishlist = async (event) => {
    event.stopPropagation();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userid");

    if (!token || !userId) {
      setLoginShow(true);
      return;
    }

    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        const checkRes = await axiosInstance.get("catlog/wishlist-check/", {
          params: { variant_id: product.id, type: getWishlistCheckType(mode) },
        });
        const wishlistId = checkRes.data?.id;

        if (wishlistId) {
          await axiosInstance.delete(`catlog/wishlists/${wishlistId}/`);
        }

        dispatch(removeWishlistItem(product.id));
        toast.success("Removed from wishlist");
      } else {
        await axiosInstance.post("catlog/wishlists/", {
          user: userId,
          varient: product.id,
          type: getWishlistPostType(mode),
        });
        dispatch(toggleWishlistItem(getWishlistProduct()));
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Could not update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderPrice = () => {
    const offerPrice = product.prices?.sale_offer_price;
    const salePrice = product.prices?.sale_price;
    const rentalPrice = product.prices?.rental_price;

    if (mode === "rent" && rentalPrice) {
      return (
        <div className="pc-price-wrap">
          <span className="pc-price">{formatProductPrice(rentalPrice)}</span>
          <span className="pc-per-day">/ day</span>
        </div>
      );
    }

    if (offerPrice && salePrice) {
      return (
        <div className="pc-price-wrap">
          <span className="pc-price">{formatProductPrice(offerPrice)}</span>
          <del className="pc-original">{formatProductPrice(salePrice)}</del>
        </div>
      );
    }

    if (salePrice) {
      return (
        <div className="pc-price-wrap">
          <span className="pc-price">{formatProductPrice(salePrice)}</span>
        </div>
      );
    }

    return (
      <div className="pc-price-wrap">
        <span className="pc-price pc-price-quote">Quote on request</span>
      </div>
    );
  };

  const discountPercent = getDiscountPercent(product);
  const { isOutOfStock, isLimitedStock } = getVariantStockStatus(product, mode);

  return (
    <article
      className={`pc-card${isOutOfStock ? " pc-card--oos" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={isOutOfStock ? `${product.name}, out of stock` : undefined}
      onClick={() => onOpen(product)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(product); }}
    >
      {/* ── image ── */}
      <div className="pc-img-wrap">
        {discountPercent && (
          <span className="pc-badge pc-badge-discount">{discountPercent}% OFF</span>
        )}
        {/* {isOutOfStock && (
          <span className="pc-badge pc-badge-oos">Out of stock</span>
        )} */}
       
        <img
          src={getProductImage(product)}
          alt=""
          className="pc-img"
          onError={(e) => { e.target.src = pm; }}
        />
      </div>

      {/* ── body ── */}
      <div className="pc-body">
        {/* listing type pill */}
        {product.listing_type && (
          <span className="pc-listing-type">
            {product.listing_type === "both" ? "Buy / Rent" : product.listing_type}
          </span>
        )}

        <h3 className="pc-name">{product.name}</h3>

        {product.sku_code && (
          <p className="pc-sku">SKU: {product.sku_code}</p>
        )}

        {/* price row */}
        {renderPrice()}

        {isLimitedStock && (
  <p className="pc-limited-text">Only a few left!</p>
)}

        {/* out of stock text */}
        {isOutOfStock && (
          <p className="pc-oos-text">Out of stock</p>
        )}

        {/* actions */}
       
          <div className="pc-actions">
  <button
    type="button"
    className="pc-btn-add"
    disabled={isOutOfStock}
    onClick={(e) => {
      e.stopPropagation();
      if (isOutOfStock) return;
      onAdd(e, product);
    }}
  >
    <FiShoppingCart />
    Add to Cart
  </button>
  <button
    type="button"
    className={`pc-btn-wish${isWishlisted ? " active" : ""}`}
    disabled={wishlistLoading}
    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    onClick={handleWishlist}
  >
    <FiHeart />
  </button>
</div>
      </div>
      <LoginModal show={loginShow} onHide={() => setLoginShow(false)} />
    </article>
  );
}

export default ProductCard;