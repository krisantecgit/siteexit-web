import React, { useCallback, useEffect, useState } from "react";
import "./payment.css";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { FaRegCreditCard, FaRegSmile } from "react-icons/fa";
import { FiShield, FiTruck, FiInfo } from "react-icons/fi";
import CheckoutNavbar from "../CheckoutNavbar/CheckoutNavbar";
import StripePaymentSection from "./StripePaymentSection";
import axiosInstance from "../../utils/axiosInstance";
import { clearPaymentIntentIdempotencyKey } from "../../utils/paymentApi";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearBuyCart, clearRentCart } from "../../redux/cartSlice";

function Payment() {
  const [active, setActive] = useState("cash");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completingRedirect, setCompletingRedirect] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdRaw = localStorage.getItem("orderId");
  const orderId = (!orderIdRaw || orderIdRaw === "null" || orderIdRaw === "undefined") ? "580" : orderIdRaw;

  useEffect(() => {
    if (!orderId) {
      toast.warning("No active order session found. Redirecting to cart.");
      navigate("/cart");
      return;
    }

    async function fetchOrderDetails() {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/accounts/orders/${orderId}/`);
        setOrderDetails(res?.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to retrieve order details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetails();
  }, [orderId, navigate]);

  // Robustly extract the order object
  const order = orderDetails 
    ? (Array.isArray(orderDetails) ? orderDetails[0] : orderDetails)
    : null;

  const netAmount = order?.net_amount || 0;
  const totalAmount = order?.total_amount || 0;
  const totalSaved = Math.max(totalAmount - netAmount, 0);
  const deliveryCharge = Number(localStorage.getItem("deliveryCharge") || 0);
  const payableAmount = netAmount + deliveryCharge;

  const clearCheckoutSession = useCallback(() => {
    localStorage.removeItem("orderId");
    localStorage.removeItem("buyCart");
    localStorage.removeItem("rentCart");
    localStorage.removeItem("saleAddress");
    localStorage.removeItem("rentalAddress");
    localStorage.removeItem("deliveryCharge");
    dispatch(clearBuyCart());
    dispatch(clearRentCart());
    clearPaymentIntentIdempotencyKey(orderId);
  }, [dispatch, orderId]);

  const completeOnlineOrder = useCallback(async () => {
    const payload = {
      status: "Placed",
      payment_mode: "online",
    };
    const res = await axiosInstance.post(
      `/accounts/orders/${orderId}/order_status_update/`,
      payload
    );
    toast.success(res.data?.message || "Online payment successful! Order confirmed.");
    clearCheckoutSession();
    navigate("/orders");
  }, [clearCheckoutSession, navigate, orderId]);

  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");
    const paymentIntent = searchParams.get("payment_intent");

    if (redirectStatus !== "succeeded" || !paymentIntent || !orderId) {
      return;
    }

    let cancelled = false;

    async function finalizeRedirectPayment() {
      setCompletingRedirect(true);
      try {
        await completeOnlineOrder();
        if (!cancelled) {
          setSearchParams({}, { replace: true });
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Payment succeeded but order confirmation failed. Contact support."
        );
      } finally {
        if (!cancelled) {
          setCompletingRedirect(false);
        }
      }
    }

    finalizeRedirectPayment();

    return () => {
      cancelled = true;
    };
  }, [completeOnlineOrder, orderId, searchParams, setSearchParams]);

  async function PlaceOrderByCOD() {
    setProcessing(true);
    const payload = {
      status: "Placed",
      payment_mode: "cash"
    };
    try {
      const res = await axiosInstance.post(`/accounts/orders/${orderId}/order_status_update/`, payload);
      toast.success(res.data.message || "Order placed successfully via Cash on Delivery!");
      clearCheckoutSession();
      navigate("/orders");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong placing the order.");
    } finally {
      setProcessing(false);
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rs. 0.00";
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    return `Rs. ${formatted}`;
  };

  return (
    <div className="payment-page-wrapper">
      <CheckoutNavbar />
      
      {loading || completingRedirect ? (
        <div className="payment-loading-container">
          <div className="payment-spinner"></div>
          <p>
            {completingRedirect
              ? "Confirming your payment…"
              : "Retrieving secure order details…"}
          </p>
        </div>
      ) : (
        <div className="payment-layout-container">
          
          {/* Header Row */}
          <div className="payment-title-header">
            <h1>Secure Payment</h1>
            <p className="subtitle">Choose a payment method and finalize your transaction.</p>
          </div>

          <div className="payment-main-grid">
            
            {/* Left Side: Payment Options */}
            <div className="payment-methods-card">
              <div className="payment-methods-tabs">
                <button
                  type="button"
                  className={`tab-btn ${active === "cash" ? "active" : ""}`}
                  onClick={() => setActive("cash")}
                >
                  <span className="tab-icon">💸</span>
                  <div className="tab-label">
                    <strong>Cash on Delivery</strong>
                    <span>Pay at your convenience</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${active === "online" ? "active" : ""}`}
                  onClick={() => setActive("online")}
                >
                  <span className="tab-icon"><FaRegCreditCard /></span>
                  <div className="tab-label">
                    <strong>Credit / Debit Card</strong>
                    <span>Instant checkout via safe gateway</span>
                  </div>
                </button>
              </div>

              <div className="payment-tab-content">
                {active === "cash" && (
                  <div className="cash-panel animate-fade-in">
                    <div className="info-alert">
                      <FiInfo className="alert-icon" />
                      <div className="alert-text">
                        <h5>Cash on Delivery (COD) Enabled</h5>
                        <p>You can pay via cash, card or digital UPI to the delivery executive when your shipment arrives at your designated address.</p>
                      </div>
                    </div>

                    <div className="cod-details-box">
                      <div className="cod-row">
                        <FiTruck className="cod-icon" />
                        <div>
                          <h6>Standard Home Delivery</h6>
                          <span>Ships immediately upon order confirmation.</span>
                        </div>
                      </div>
                      <div className="cod-row mt-3">
                        <FiShield className="cod-icon" />
                        <div>
                          <h6>Genuine Products Guaranteed</h6>
                          <span>Check products before making payment.</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-action-area">
                      <button
                        className="btn-pay-submit cod-btn"
                        onClick={PlaceOrderByCOD}
                        disabled={processing}
                      >
                        {processing ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>
                            <span>PLACE ORDER (COD)</span>
                            <span className="price-badge">{formatPrice(netAmount)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {active === "online" && (
                  <div className="online-panel animate-fade-in">
                    <div className="info-alert stripe-info-alert">
                      <FiShield className="alert-icon" />
                      <div className="alert-text">
                        <h5>Secure card payment</h5>
                        <p>
                          Pay with credit or debit card via Stripe. Amount charged:{" "}
                          <strong>{formatPrice(payableAmount)}</strong>
                        </p>
                      </div>
                    </div>

                    <StripePaymentSection
                      orderId={orderId}
                      amountLabel={formatPrice(payableAmount)}
                      processing={processing}
                      setProcessing={setProcessing}
                      onPaymentSuccess={completeOnlineOrder}
                    />

                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="payment-summary-card">
              <div className="summary-title">
                <HiOutlineCurrencyDollar className="summary-dollar-icon" />
                <h3>Order Summary</h3>
              </div>

              <div className="order-summary-details">
                <div className="summary-info-row">
                  <span className="info-lbl">Order Reference</span>
                  <span className="info-val highlight">#{order?.order_no || order?.id || orderId}</span>
                </div>
                <div className="summary-info-row">
                  <span className="info-lbl">Payment Mode Status</span>
                  <span className="info-val badge-status">Awaiting Payment</span>
                </div>
                
                <hr className="divider" />

                <div className="summary-price-row">
                  <span>Cart Subtotal</span>
                  <strong>{formatPrice(totalAmount)}</strong>
                </div>

                {totalSaved > 0 && (
                  <div className="summary-price-row discount text-success">
                    <span>Campaign Savings</span>
                    <strong>-{formatPrice(totalSaved)}</strong>
                  </div>
                )}

                <div className="summary-price-row">
                  <span>Shipping &amp; Delivery</span>
                  <span className={deliveryCharge === 0 ? "free-shipping" : "info-val"}>
                    {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                  </span>
                </div>

                <hr className="divider" />

                <div className="summary-price-row total">
                  <span>Net Amount Payable</span>
                  <span className="total-val">{formatPrice(netAmount + deliveryCharge)}</span>
                </div>

                {totalSaved > 0 && (
                  <div className="savings-alert-box">
                    <FaRegSmile className="savings-icon" />
                    <span>Fantastic! You saved {formatPrice(totalSaved)} on this transaction.</span>
                  </div>
                )}
              </div>

              <div className="security-guarantee-box">
                <FiShield className="guarantee-icon" />
                <div>
                  <h6>100% Encrypted Transactions</h6>
                  <p>All data is processed using industry-standard AES-256 secure network gateways.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;

