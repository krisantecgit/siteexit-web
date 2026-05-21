import React, { useEffect, useState } from "react";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToBuyCart, addToRentCart } from "../../redux/cartSlice";
import axiosInstance from "../../utils/axiosInstance";
import "./wishlist.css";

const getProductImage = (product) =>
  product.images?.[0]?.image?.image || product.product?.image?.image || "";

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Quote on request";
  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeWishlistItem = (item) => {
  const variant = item.varient || {};
  return {
    id: variant.id,
    wishlistId: item.id,
    name: variant.name,
    slug: item.slug || variant.slug,
    image: getProductImage(variant),
    type: item.type === "rental" || item.type === "rent" ? "rent" : "buy",
    sale_price: variant.prices?.sale_price,
    sale_offer_price: variant.prices?.sale_offer_price,
    rental_price: variant.prices?.rental_price,
    offerPrice:
      item.type === "rental" || item.type === "rent"
        ? variant.prices?.rental_price
        : variant.prices?.sale_offer_price || variant.prices?.sale_price,
  };
};

function WishListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userid");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWishlist = () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    setError("");

    axiosInstance
      .get("catlog/wishlists/", {
        params: { user: userId },
      })
      .then((res) => {
        const results = Array.isArray(res.data?.results) ? res.data.results : [];
        setWishlistItems(results.map(normalizeWishlistItem).filter((item) => item.id));
      })
      .catch(() => {
        setError("Failed to load wishlist. Please try again.");
        setWishlistItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, [ userId]);

  const addToCart = (item) => {
    if (item.type === "rent") {
      dispatch(addToRentCart({
        ...item,
        cartItemId: `${item.id}-rent`,
      }));
      toast.success("Added to rental cart");
    } else {
      dispatch(addToBuyCart(item));
      toast.success("Added to cart");
    }
  };

  const removeFromServerWishlist = (item) => {
    if (!item.wishlistId) return;

    axiosInstance
      .delete(`catlog/wishlists/${item.wishlistId}/`)
      .then(() => {
        toast.success("Removed from wishlist");
        fetchWishlist();
      })
      .catch(() => {
        toast.error("Failed to remove wishlist item");
        setError("Failed to remove wishlist item.");
      });
  };

  const openProduct = (item) => {
    if (item.slug) {
      navigate(`/product/${item.slug}`, {
        search: item.id ? `variant=${item.id}` : "",
        state: { variantId: item.id },
      });
    }
  };

  if (!userId) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-container">

          {/* ───────── HEADER ───────── */}
          <div className="wishlist-heading">
            <div>
              <span>
                <FiHeart />
                Saved Products
              </span>

              <h1>My Wishlist</h1>

              <p className="wishlist-subtitle">
                Review and manage your shortlisted industrial safety products.
              </p>
            </div>
 
          </div>

          {/* ───────── STATES ───────── */}

          {loading && (
            <section className="wishlist-empty">
              <h2>Loading Wishlist</h2>
              <p>Please wait while we fetch your saved products.</p>
            </section>
          )}

          {error && (
            <section className="wishlist-empty">
              <h2>Something went wrong</h2>
              <p>{error}</p>
            </section>
          )}

          {/* ───────── PRODUCTS ───────── */}

          {!loading && !error && wishlistItems.length > 0 ? (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <article
                  className="wishlist-card"
                  key={item.wishlistId || item.id}
                >
                  <button
                    className="wishlist-card-media"
                    type="button"
                    onClick={() => openProduct(item)}
                  >
                    <img src={item.image} alt={item.name} />
                  </button>

                  <div className="wishlist-card-body">

                    <span className="wishlist-product-type">
                      {item.type === "rent"
                        ? "Rental Product"
                        : "Purchase Product"}
                    </span>

                    <button
                      className="wishlist-title"
                      type="button"
                      onClick={() => openProduct(item)}
                    >
                      {item.name}
                    </button>

                    <div className="wishlist-meta">
                      <div>
                        <span className="wishlist-price-label">
                          {item.type === "rent"
                            ? "Rental Price"
                            : "Sale Price"}
                        </span>

                        <strong>
                          {formatMoney(item.offerPrice)}
                        </strong>
                      </div>

                      <button
                        className="wishlist-remove-btn"
                        type="button"
                        onClick={() => removeFromServerWishlist(item)}
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="wishlist-actions">
                      <button
                        className="wishlist-cart-btn"
                        type="button"
                        onClick={() => addToCart(item)}
                      >
                        <FiShoppingCart />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {/* ───────── EMPTY ───────── */}

          {!loading && !error && wishlistItems.length === 0 && (
            <section className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <FiHeart />
              </div>

              <h2>Your wishlist is empty</h2>

              <p>
                Save products while browsing industrial and safety equipment,
                then access them here anytime.
              </p>

              <button
                type="button"
                onClick={() => navigate("/buy")}
              >
                Browse Products
              </button>
            </section>
          )}
        </div>
      </main>
    );
  }
}

export default WishListPage;
