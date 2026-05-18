import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./homeProductSections.css";
import pm from "./images/products.webp";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";

const sections = [
  {
    key: "buy",
    title: "Buy Equipment",
    eyebrow: "For purchase",
    cta: "/buy",
    listingType: "buy",
  },
  {
    key: "rent",
    title: "Rent Equipment",
    eyebrow: "For rental",
    cta: "/rent",
    listingType: "rent",
  },
];

const getProductImage = (product) =>
  product.images?.[0]?.image?.image || product.product?.image?.image || pm;

const getPrice = (product, listingType) => {
  const rentalPrice = product.prices?.rental_price;
  const offerPrice = product.prices?.sale_offer_price;
  const salePrice = product.prices?.sale_price;

  if (listingType === "rent" && rentalPrice) {
    return `Rs. ${rentalPrice.toLocaleString("en-IN")} / day`;
  }

  if (offerPrice) {
    return `Rs. ${offerPrice.toLocaleString("en-IN")}`;
  }

  if (salePrice) {
    return `Rs. ${salePrice.toLocaleString("en-IN")}`;
  }

  return "Quote on request";
};

function HomeProductSections() {
  const navigate = useNavigate();
  const [productsBySection, setProductsBySection] = useState({
    buy: [],
    rent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    Promise.all(
      sections.map((section) =>
        axiosInstance
          .get("catlog/category-variants/", {
            params: {
              search: "",
              category: "",
              subcategory: "",
              price_min: "",
              price_max: "",
              options: "",
              store_id: STORE_ID,
              listing_type: section.listingType,
              is_suspended: false,
            },
          })
          .then((res) => {
            const data = res.data?.results ?? res.data;
            return [section.key, Array.isArray(data) ? data.slice(0, 8) : []];
          })
          .catch(() => [section.key, []])
      )
    )
      .then((entries) => {
        if (isMounted) {
          setProductsBySection(Object.fromEntries(entries));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openProduct = (product) => {
    const slug = product.slug || product.product?.slug;
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  return (
    <section className="home-products">
      <div className="home-products-container">
        {sections.map((section) => {
          const products = productsBySection[section.key] || [];

          return (
            <div className="home-product-block" key={section.key}>
              <div className="home-product-heading">
                <div>
                  <span>{section.eyebrow}</span>
                  <h2>{section.title}</h2>
                </div>
                <Link to={section.cta}>View all</Link>
              </div>

              {loading ? (
                <div className="home-product-loading">Loading products...</div>
              ) : (
                <div className="home-product-grid">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <article
                        className="home-product-card"
                        key={`${section.key}-${product.id}`}
                        onClick={() => openProduct(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            openProduct(product);
                          }
                        }}
                      >
                        <div className="home-product-image">
                          <img
                            src={getProductImage(product)}
                            alt=""
                            onError={(event) => {
                              event.target.src = pm;
                            }}
                          />
                        </div>
                        <div className="home-product-body">
                          <h3>{product.name}</h3>
                          <p>{getPrice(product, section.listingType)}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="home-product-empty">No products available.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HomeProductSections;
