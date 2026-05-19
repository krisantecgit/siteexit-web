import React, { useEffect } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addToBuyCart,
  addToRentCart,
  decreaseBuyQty,
  decreaseRentQty,
  removeFromBuyCart,
  removeFromRentCart,
} from "../../redux/cartSlice";
import axiosInstance from "../../utils/axiosInstance";
import "./cartpage.css";

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Quote on request";
  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getLinePrice = (item) =>
  Number(item.offerPrice ?? item.sale_offer_price ?? item.sale_price ?? item.oldPrice ?? item.rental_price ?? 0);

function Cartpage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { buyCart = [], rentCart = [] } = useSelector((store) => store.cart || {});
  const totalItems = buyCart.length + rentCart.length;
  const totalAmount = [...buyCart, ...rentCart].reduce(
    (sum, item) => sum + getLinePrice(item) * (item.qty || 1),
    0
  );

  useEffect(() => {
    if (rentCart.length > 0) {
      axiosInstance.get(`sitedata/site/`).catch(() => {});
      
      const uniqueRentIds = [...new Set(rentCart.map(item => item.id))];
      uniqueRentIds.forEach(id => {
        axiosInstance.get(`catlog/variant-price-packages/?product_variant=${id}&active=true`).catch(() => {});
      });
    }
  }, []);

  const openProduct = (item) => {
    if (item.slug || item.friendlyurl) {
      navigate(`/product/${item.slug || item.friendlyurl}`, {
        search: item.id ? `variant=${item.id}` : "",
        state: { variantId: item.id },
      });
    }
  };

  const renderCartItems = (items, type) =>
    items.map((item) => {
      const key = type === "rent" ? item.cartItemId || item.id : item.id;
      const remove = type === "rent" ? removeFromRentCart : removeFromBuyCart;
      const decrease = type === "rent" ? decreaseRentQty : decreaseBuyQty;
      const add = type === "rent" ? addToRentCart : addToBuyCart;
      const removeItem = () => {
        dispatch(remove(key));
        toast.success("Removed from cart");
      };
      const addItem = () => {
        dispatch(add(item));
        toast.success("Quantity updated");
      };

      return (
        <article className="cart-item" key={`${type}-${key}`}>
          <button className="cart-item-image" type="button" onClick={() => openProduct(item)}>
            <img src={item.image} alt={item.name} />
          </button>

          <button className="cart-item-info" type="button" onClick={() => openProduct(item)}>
            <p className="cart-item-title">{item.name}</p>
            <div className="cart-item-prices mt-2">
              <span className="new-price">{formatMoney(getLinePrice(item))}</span>
              {type === "rent" && <span className="cart-item-type">Rental</span>}
            </div>
          </button>

          <div className="cart-item-actions">
            <div className="qty-wrapper">
              <button className="qty-minus" type="button" onClick={() => dispatch(decrease(key))}>
                <FiMinus />
              </button>
              <span className="qty-value">{item.qty || 1}</span>
              <button className="qty-plus" type="button" onClick={addItem}>
                <FiPlus />
              </button>
            </div>
            <button className="delete-icon" type="button" onClick={removeItem}>
              <FiTrash2 />
            </button>
          </div>
        </article>
      );
    });

  return (
    <main className="cart-page">
      {totalItems > 0 ? (
        <div className="cart-container">
          <section className="cart-left">
            <div className="cart-page-title">
              <span>{totalItems} item{totalItems === 1 ? "" : "s"}</span>
              <h1>Your Cart</h1>
            </div>

            <div className="cart-sticky-sections">
              {buyCart.length > 0 && (
                <div className="cart-section-box">
                  <div className="cart-section-header">
                    Buy Cart <span>{buyCart.length} item{buyCart.length === 1 ? "" : "s"}</span>
                  </div>
                  {renderCartItems(buyCart, "buy")}
                </div>
              )}

              {rentCart.length > 0 && (
                <div className="cart-section-box">
                  <div className="cart-section-header">
                    Rent Cart <span>{rentCart.length} item{rentCart.length === 1 ? "" : "s"}</span>
                  </div>
                  {renderCartItems(rentCart, "rent")}
                </div>
              )}
            </div>
          </section>

          <aside className="cart-right">
            <div className="cart-right-fix-box">
              <div className="buy-rent-price-container">
                <div className="left-buy-rent-price"><span>Total</span></div>
                <div className="total-price">{formatMoney(totalAmount)}</div>
              </div>
              <button className="cart-btn mt-3" type="button" onClick={() => navigate("/checkout")}>
                <span>{formatMoney(totalAmount)}</span>
                <span>CHECK OUT</span>
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <section className="empty-cart-container">
          <h1>Your cart is empty</h1>
          <p>Start with products available for sale or rent.</p>
          <div className="empty-cart-buttons">
            <button className="buy-btn" type="button" onClick={() => navigate("/buy")}>
              EXPLORE BUYING
            </button>
            <button className="rent-btn" type="button" onClick={() => navigate("/rent")}>
              EXPLORE RENTING
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Cartpage;
