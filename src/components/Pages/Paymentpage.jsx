import React, { useEffect, useState } from "react";
import "./payment.css";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { FaRegCreditCard, FaLock, FaCheckCircle, FaChevronRight, FaRegSmile } from "react-icons/fa";
import { FiCreditCard, FiShield, FiTruck, FiInfo } from "react-icons/fi";
import CheckoutNavbar from "../CheckoutNavbar/CheckoutNavbar";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearBuyCart, clearRentCart } from "../../redux/cartSlice";

function Payment() {
  const [active, setActive] = useState("cash");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    focused: ""
  });

  const dispatch = useDispatch();
  const orderIdRaw = localStorage.getItem("orderId");
  const orderId = (!orderIdRaw || orderIdRaw === "null" || orderIdRaw === "undefined") ? "580" : orderIdRaw;
  const navigate = useNavigate();

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

  async function PlaceOrderByCOD() {
    setProcessing(true);
    const payload = {
      status: "Placed",
      payment_mode: "cash"
    };
    try {
      const res = await axiosInstance.post(`/accounts/orders/${orderId}/order_status_update/`, payload);
      toast.success(res.data.message || "Order placed successfully via Cash on Delivery!");
      
      // Cleanup localStorage and Redux cart
      localStorage.removeItem("orderId");
      localStorage.removeItem("buyCart");
      localStorage.removeItem("rentCart");
      localStorage.removeItem("saleAddress");
      localStorage.removeItem("rentalAddress");
      localStorage.removeItem("deliveryCharge");
      dispatch(clearBuyCart());
      dispatch(clearRentCart());
      
      navigate("/orders");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong placing the order.");
    } finally {
      setProcessing(false);
    }
  }

  async function HandleOnlinePayment(e) {
    e.preventDefault();
    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
      toast.error("Please fill in all credit card details.");
      return;
    }
    if (cardDetails.number.replace(/\s/g, "").length < 16) {
      toast.error("Invalid card number length.");
      return;
    }
    if (cardDetails.cvv.length < 3) {
      toast.error("Invalid CVV.");
      return;
    }

    setProcessing(true);
    // Simulate payment transaction Processing
    setTimeout(async () => {
      const payload = {
        status: "Placed",
        payment_mode: "online"
      };
      try {
        const res = await axiosInstance.post(`/accounts/orders/${orderId}/order_status_update/`, payload);
        toast.success("Online payment successful! Order confirmed.");
        
        localStorage.removeItem("orderId");
        localStorage.removeItem("buyCart");
        localStorage.removeItem("rentCart");
        localStorage.removeItem("saleAddress");
        localStorage.removeItem("rentalAddress");
        dispatch(clearBuyCart());
        dispatch(clearRentCart());
        
        navigate("/orders");
      } catch (error) {
        console.error(error);
        toast.error("Payment authorization failed. Please try again.");
      } finally {
        setProcessing(false);
      }
    }, 1800);
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rs. 0.00";
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    return `Rs. ${formatted}`;
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    // Format as four blocks of 4 digits: "XXXX XXXX XXXX XXXX"
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardDetails({ ...cardDetails, expiry: val });
  };

  const handleCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    setCardDetails({ ...cardDetails, cvv: val });
  };

  return (
    <div className="payment-page-wrapper">
      <CheckoutNavbar />
      
      {loading ? (
        <div className="payment-loading-container">
          <div className="payment-spinner"></div>
          <p>Retrieving secure order details...</p>
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
                    {/* Live Card Preview */}
                    <div className="card-preview-container">
                      <div className={`mock-card ${cardDetails.focused === "cvv" ? "flipped" : ""}`}>
                        <div className="card-face front">
                          <div className="card-gloss-bg"></div>
                          <div className="card-brand">VIRTUAL CHIP</div>
                          <div className="card-chip"></div>
                          <div className="card-number-display">
                            {cardDetails.number || "•••• •••• •••• ••••"}
                          </div>
                          <div className="card-meta">
                            <div className="card-holder">
                              <span className="card-lbl">CARDHOLDER</span>
                              <div className="card-val">{cardDetails.name.toUpperCase() || "YOUR FULL NAME"}</div>
                            </div>
                            <div className="card-exp">
                              <span className="card-lbl">EXPIRES</span>
                              <div className="card-val">{cardDetails.expiry || "MM/YY"}</div>
                            </div>
                          </div>
                        </div>
                        <div className="card-face back">
                          <div className="card-strip"></div>
                          <div className="card-cvv-box">
                            <span className="card-lbl">CVV</span>
                            <div className="cvv-display">{cardDetails.cvv || "•••"}</div>
                          </div>
                          <div className="card-signature">SECURE TRANSACTION</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Input Form */}
                    <form className="card-form" onSubmit={HandleOnlinePayment}>
                      <div className="form-group">
                        <label htmlFor="cardNum">Card Number</label>
                        <div className="input-with-icon">
                          <FiCreditCard className="input-icon" />
                          <input
                            type="text"
                            id="cardNum"
                            placeholder="4111 2222 3333 4444"
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: "number" })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="cardName">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardName"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          onFocus={() => setCardDetails({ ...cardDetails, focused: "name" })}
                          required
                        />
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="cardExpiry">Expiration Date</label>
                          <input
                            type="text"
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: "expiry" })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="cardCvv">CVV Code</label>
                          <input
                            type="password"
                            id="cardCvv"
                            placeholder="•••"
                            maxLength="4"
                            value={cardDetails.cvv}
                            onChange={handleCvvChange}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: "cvv" })}
                            onBlur={() => setCardDetails({ ...cardDetails, focused: "" })}
                            required
                          />
                        </div>
                      </div>

                      <div className="payment-action-area">
                        <button
                          type="submit"
                          className="btn-pay-submit online-btn"
                          disabled={processing}
                        >
                          {processing ? (
                            <span className="btn-spinner"></span>
                          ) : (
                            <>
                              <FaLock className="lock-icon" />
                              <span>PAY {formatPrice(netAmount)} NOW</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
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

