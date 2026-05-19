import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
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
  const [listingType, setListingType] = useState("rent");
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
        params: { user: userId, type: listingType },
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
  }, [listingType, userId]);

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
          <section className="wishlist-empty">
            <h2>Please login to view your wishlist</h2>
            <p>Your saved products will appear here after login.</p>
            <button type="button" onClick={() => navigate("/")}>Go home</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-heading">
          <div>
            <span><FiHeart /> {wishlistItems.length} saved item{wishlistItems.length === 1 ? "" : "s"}</span>
            <h1>Wishlist</h1>
          </div>
          <div className="listing-type-container">
            <button className={`listing-type ${listingType === "buy" ? "active" : ""}`} type="button" onClick={() => setListingType("buy")}>Buy</button>
            <button className={`listing-type ${listingType === "rent" ? "active" : ""}`} type="button" onClick={() => setListingType("rent")}>Rent</button>
          </div>
        </div>

        {loading && <section className="wishlist-empty">Loading wishlist...</section>}
        {error && <section className="wishlist-empty">{error}</section>}

        {!loading && !error && wishlistItems.length > 0 ? (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <article className="wishlist-card" key={item.wishlistId || item.id}>
                <button className="wishlist-card-media" type="button" onClick={() => openProduct(item)}>
                  <img src={item.image} alt={item.name} />
                </button>
                <div className="wishlist-card-body">
                  <button className="wishlist-title" type="button" onClick={() => openProduct(item)}>
                    {item.name}
                  </button>
                  <div className="wishlist-meta">
                    <strong>{formatMoney(item.offerPrice)}</strong>
                    <span>{item.type === "rent" ? "Rental" : "Sale"}</span>
                  </div>
                  <div className="wishlist-actions">
                    <button className="wishlist-cart-btn" type="button" onClick={() => addToCart(item)}>
                      <FiShoppingCart /> Add to cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      type="button"
                      onClick={() => removeFromServerWishlist(item)}
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && !error && wishlistItems.length === 0 && (
          <section className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
            <p>Save products while browsing, then come back here when you are ready.</p>
            <button type="button" onClick={() => navigate("/buy")}>Browse products</button>
          </section>
        )}
      </div>
    </main>
  );
}

export default WishListPage;
