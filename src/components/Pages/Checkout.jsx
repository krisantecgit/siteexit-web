import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiCheckCircle, FiShield } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import "../Cart/cartpage.css";
import "./checkout-coupon.css";

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

function Checkout() {
  const navigate = useNavigate();
  const { buyCart = [], rentCart = [] } = useSelector((store) => store.cart || {});
  const [placing, setPlacing] = useState(false);

  const orderIdRaw = localStorage.getItem("orderId");
  const orderId = (!orderIdRaw || orderIdRaw === "null" || orderIdRaw === "undefined") ? "580" : orderIdRaw;
  const saleAddressRaw = localStorage.getItem("saleAddress");
  const rentalAddressRaw = localStorage.getItem("rentalAddress");
  const defaultAddressId = localStorage.getItem("defaultAddressId");

  const saleAddressId = saleAddressRaw ? JSON.parse(saleAddressRaw)?.id : (defaultAddressId ? Number(defaultAddressId) : 131);
  const rentalAddressId = rentalAddressRaw ? JSON.parse(rentalAddressRaw)?.id : "";
  const allItems = [
    ...buyCart.map((item) => ({ ...item, cartType: "Sale" })),
    ...rentCart.map((item) => ({ ...item, cartType: "Rental" })),
  ];
  const subtotal = allItems.reduce((sum, item) => sum + getLinePrice(item) * (item.qty || 1), 0);
  const totalQuantity = allItems.reduce((sum, item) => sum + (item.qty || 1), 0);

  const orderDetailsPayload = allItems.map((item) => {
    const variantId = item.variantId || item.id || 187;
    const itemType = item.cartType?.toLowerCase() === "sale" ? "buy" : "rental";
    return {
      variant: Number(variantId),
      item_type: itemType,
      quantity: item.qty || 1
    };
  });

  const deliveryItemsPayload = allItems.map((item) => {
    const isSale = item.cartType?.toLowerCase() === "sale";
    const itemObj = {
      cart_type: isSale ? "buy" : "rental",
      quantity: item.qty || 1,
    };
    if (isSale) {
      itemObj.sale_address_id = saleAddressId;
    } else {
      itemObj.rental_address_id = rentalAddressId;
    }
    return itemObj;
  });

  const [deliveryCharge, setDeliveryCharge] = useState(null);

  useEffect(() => {
    async function fetchDeliveryCharges() {
      try {
        const deliveryPayload = { items: deliveryItemsPayload };
        const res = await axiosInstance.post(`/accounts/deliverycharges/`, deliveryPayload);
        const details = res.data?.details || [];
        const totalDelivery = details.reduce((sum, item) => sum + (item.delivery_charges || 0), 0);
        setDeliveryCharge(totalDelivery);
        localStorage.setItem("deliveryCharge", totalDelivery.toString());
      } catch (err) {
        console.error("Failed to fetch delivery charges", err);
        setDeliveryCharge(0);
        localStorage.setItem("deliveryCharge", "0");
      }
    }
    if (allItems.length > 0) {
      fetchDeliveryCharges();
    }
  }, []);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      // 1. PATCH order
      const patchPayload = {
        sale_addresses: saleAddressId || null,
        rental_addresses: rentalAddressId || "",
        delivery_mode: "company-transport",
        order_details: orderDetailsPayload
      };
      const patchRes = await axiosInstance.patch(`/accounts/orders/${orderId}/`, patchPayload);
      const newOrderId = patchRes?.data?.id || patchRes?.data?.order?.id || orderId;
      
      // Update orderId in localStorage
      localStorage.setItem("orderId", String(newOrderId));

      // 2. GET order details
      await axiosInstance.get(`/accounts/orderdetails/`, {
        params: { order: newOrderId }
      });

      // 3. GET coupons
      await axiosInstance.get(`/catlog/coupons/`, {
        params: { coupon_type: "rental", is_suspended: "false" }
      });

      // 4. POST delivery charges (already fetched, but we can do it again to confirm)
      const deliveryPayload = {
        items: deliveryItemsPayload
      };
      await axiosInstance.post(`/accounts/deliverycharges/`, deliveryPayload);

      toast.success("Order processed successfully!");
      navigate("/payment");
    } catch (err) {
      console.error("Checkout process failed:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.response?.data?.details || "Checkout process failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setPlacing(false);
    }
  };

  if (allItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add products to your cart before checkout.</p>
          <button type="button" onClick={() => navigate("/buy")}>Browse products</button>
        </section>
      </main>
    );
  }

  const grandTotal = subtotal + (deliveryCharge || 0);

  return (
    <main className="checkout-page">
      <div className="checkout-wrap">
        <button className="checkout-back" type="button" onClick={() => navigate("/cart")}>
          <FiArrowLeft /> Back to cart
        </button>

        <div className="checkout-layout">
          <section className="checkout-panel">
            <div className="checkout-heading">
              <span>Secure checkout</span>
              <h1>Review your order</h1>
              <p>Confirm your cart before placing the order. Delivery and payment details can be finalized next.</p>
            </div>

            <div className="checkout-items">
              {allItems.map((item) => (
                <article className="checkout-item" key={`${item.cartType}-${item.cartItemId || item.id}`}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h2>{item.name}</h2>
                    <p>{item.cartType} · Qty {item.qty || 1}</p>
                  </div>
                  <strong>{formatMoney(getLinePrice(item) * (item.qty || 1))}</strong>
                </article>
              ))}
            </div>
          </section>

          <aside className="checkout-summary">
            <div className="checkout-summary-head">
              <FiShield />
              <div>
                <h2>Order summary</h2>
                <p>{totalQuantity} unit{totalQuantity === 1 ? "" : "s"} in this order</p>
              </div>
            </div>
            <div className="checkout-row">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <div className="checkout-row">
              <span>Delivery</span>
              <strong>{deliveryCharge === null ? "Calculating..." : (deliveryCharge === 0 ? "FREE" : formatMoney(deliveryCharge))}</strong>
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatMoney(grandTotal)}</strong>
            </div>
            <button
              className="checkout-place-btn"
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing || deliveryCharge === null}
            >
              <FiCheckCircle /> {placing ? "Processing..." : "Place order"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
