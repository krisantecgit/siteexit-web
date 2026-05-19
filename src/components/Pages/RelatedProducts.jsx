import React, { useEffect, useRef, useState } from "react";
import axiosConfig from "../../Services/axiosConfig";
import "./relatedproduct.css";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

function RelatedProducts({ productId, varientId }) {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const listingType = location.pathname.startsWith("/rent")
    ? "rent"
    : "buy";
  const scroll = (dir) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.offsetWidth;
      current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
console.log(varientId,"ooooooooooo")
  const formatPrice = (price) =>
    price?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    }).replace("$", "$ ");

  const handleNavigate = (product) => {
    navigate(`/${listingType}/product/${product.slug}`, {
      state: { item: product, listingType: listingType }
    });
  };

  useEffect(() => {
    async function fetchRelated() {
      if (!productId || !varientId) return;

      try {
        const res = await axiosConfig.get(
          `/catlog/related-products/?listing_type=${listingType}&product=${productId}&varient=${varientId}`
        );
        setProducts(res?.data?.results || []);
      } catch (error) {
        console.log(error);
      }
    }

    fetchRelated();
  }, [productId, listingType, varientId]);

  if (!products.length) return null;

  return (
    <div className="rel-container">
      <div className="rel-section">
        <div className="rel-section-header">
          <div>
            <h2>Related Products</h2>
          </div>
        </div>

        <div className="rel-carousel-wrapper">
          <button className="rel-arrow rel-left" onClick={() => scroll("left")}>
            <IoChevronBack className="rel-arrow-icons" />
          </button>

          <div className="rel-carousel" ref={scrollRef}>
            {products.map((item) => {
              const offer = item.prices?.sale_offer_price;
              const price = item.prices?.sale_price;
              const discount = offer && price ? Math.round(((price-offer) / price) * 100) : null;
              const rentalprice = item.prices?.rental_price;

              return (
                <div
                  className="rel-card"
                  key={item.id}
                  onClick={() => {handleNavigate(item); window.scrollTo({top : 0, behavior:"smooth"})}}
                >
                  {/* Image Slider */}
                  <div
                    className="rel-image-slide"
                    onMouseOver={(e) => e.currentTarget.classList.add("hover")}
                    onMouseOut={(e) => e.currentTarget.classList.remove("hover")}
                  >
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0]?.image?.image}
                        alt={item.name}
                      />
                    )}
                  </div>

                  <div className="rel-card-body">
                    <p className="rel-tag">{listingType === "buy" ? "Sale" : "Rent"}</p>
                    <h4>{item.name}</h4>

                    <div className="rel-price-box">
                      {/* <span className="rel-tag">
                        {listingType === "buy" ? "Sale" : "Rent"}
                      </span> */}

                      <div className="rel-price-row">
                        {/* Offer Price - Show sale_offer_price for buy, rental_price for rent */}
                        {listingType === "buy" && item.prices?.sale_offer_price && (
                          <span className="rel-price">
                            {formatPrice(item.prices.sale_offer_price)}
                          </span>
                        )}

                        {listingType === "rent" && item.prices?.rental_price && (
                          <span className="rel-price">
                            {formatPrice(item.prices.rental_price)} / Day
                          </span>
                        )}

                        {listingType === "buy" && discount !== null && (
                          <span className="rel-discount">{discount}% OFF</span>
                        )}

                        {listingType === "buy" && item.prices?.sale_offer_price && (
                          <span className="rel-old-price">
                            {formatPrice(item.prices.sale_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="rel-arrow rel-right" onClick={() => scroll("right")}>
            <IoChevronForward className="rel-arrow-icons" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RelatedProducts;