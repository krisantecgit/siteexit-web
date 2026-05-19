import React from 'react';
import { FiShoppingCart } from "react-icons/fi";
import pm from "./images/products.webp";

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

function ProductCard({ product, mode = "buy", onOpen, onAdd, onEnquire }) {
  const renderPrice = () => {
    const offerPrice = product.prices?.sale_offer_price;
    const salePrice = product.prices?.sale_price;
    const rentalPrice = product.prices?.rental_price;

    if (mode === "rent" && rentalPrice) {
      return <span className="cb-card-price">{formatProductPrice(rentalPrice)} / day</span>;
    }

    if (offerPrice && salePrice) {
      return (
        <span className="cb-price-stack">
          <span className="cb-card-price">{formatProductPrice(offerPrice)}</span>
          <del className="cb-card-original-price">{formatProductPrice(salePrice)}</del>
        </span>
      );
    }

    if (salePrice) {
      return <span className="cb-card-price">{formatProductPrice(salePrice)}</span>;
    }

    return <span className="cb-card-price">Quote on request</span>;
  };

  const discountPercent = getDiscountPercent(product);

  return (
    <article
      className="cb-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onOpen(product);
        }
      }}
    >
      <div className="cb-card-img">
        {discountPercent && (
          <span className="cb-discount-badge">{discountPercent}% OFF</span>
        )}
        <img
          src={getProductImage(product)}
          alt=""
          onError={(event) => {
            event.target.src = pm;
          }}
        />
      </div>

      <div className="cb-card-body">
        <h3 className="cb-card-name">{product.name}</h3>
        {product.sku_code && (
          <p className="cb-card-sku">SKU: {product.sku_code}</p>
        )}
        <div className="cb-card-footer">
          {renderPrice()}
          <div className="cb-card-actions">
            <button
              type="button"
              className="cb-btn-secondary"
              onClick={(event) => {
                event.stopPropagation();
                onAdd(event, product);
              }}
            >
              <FiShoppingCart />
              Add
            </button>
            <button
              type="button"
              className="cb-btn-primary"
              onClick={(event) => {
                event.stopPropagation();
                onEnquire(product);
              }}
            >
              Quote
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
