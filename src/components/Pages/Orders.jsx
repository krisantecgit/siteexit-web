import React, { useEffect, useState } from "react";
import { FiDownload, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { downloadInvoice, getOrders } from "../../utils/accountApi";
import OrderDetails from "./OrderDetails";
import "./account.css";

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Rs. 0.00";
  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");
  const userName = localStorage.getItem("name") || "Customer";
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const logout = () => {
    ["token", "userid", "name", "store_id"].forEach((key) => localStorage.removeItem(key));
    toast.success("Logged out");
    navigate("/");
  };

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError("");

    getOrders({ userId, orderType })
      .then((res) => setOrders(Array.isArray(res.data?.results) ? res.data.results : []))
      .catch(() => {
        setError("Failed to load orders. Please try again.");
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [orderType, userId]);

  const handleInvoiceDownload = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const res = await downloadInvoice(orderId);
      const file = new Blob([res.data], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Invoice is not available");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!userId) {
    return (
      <main className="account-page">
        <div className="account-wrap">
          <section className="account-empty">
            <p>Please login to view your orders.</p>
            <button className="account-primary-btn" type="button" onClick={() => navigate("/")}>
              Go home
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <aside className="account-sidebar">
          <p>Account</p>
          <strong>{userName}</strong>
          <button className="active" type="button">Orders</button>
          <button type="button" onClick={() => navigate("/address")}>Address</button>
          <button type="button" onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button type="button" onClick={logout}>Logout</button>
        </aside>

        <section className="account-content">
          {selectedOrder ? (
            <OrderDetails
              orderIdProp={selectedOrder.id}
              typeProp={selectedOrder.order_type || "sale"}
              rentalIdProp={selectedOrder.rental_order_id}
              addressIdProp={selectedOrder.rental_addresses?.id || selectedOrder.sale_addresses?.id || ""}
              onBack={() => setSelectedOrder(null)}
            />
          ) : (
            <>
              <div className="account-toolbar">
                <div className="account-tabs">
                  <button className={orderType === "" ? "active" : ""} type="button" onClick={() => setOrderType("")}>All</button>
                  <button className={orderType === "sale" ? "active" : ""} type="button" onClick={() => setOrderType("sale")}>Sale</button>
                  <button className={orderType === "rental" ? "active" : ""} type="button" onClick={() => setOrderType("rental")}>Rental</button>
                </div>
              </div>

              {loading && <div className="account-empty">Loading orders...</div>}
              {error && <div className="account-alert">{error}</div>}

              {!loading && !error && (
                <div className="orders-list">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <article className="order-row" key={order.id}>
                        <div className="order-status-mark">
                          <FiPackage />
                        </div>

                        <div className="order-main">
                          <div className="order-title-line">
                            <h2>Order Id:{order.order_no || order.id} - {formatMoney(order.net_amount || order.payment || order.total_amount)}</h2>
                            <span className="account-pill">{order.orderstatus || "Placed"}</span>
                          </div>
                          <p>Placed on {formatDate(order.order_date)}</p>
                          {order.order_type === "rental" && (
                            <button className="account-soft-btn" type="button">Extend</button>
                          )}
                        </div>

                        <div className="order-actions">
                          <button
                            className="account-primary-btn invoice-btn"
                            type="button"
                            onClick={() => handleInvoiceDownload(order.id)}
                            disabled={downloadingId === order.id}
                          >
                            <FiDownload />
                            {downloadingId === order.id ? "Downloading" : "Invoice Download"}
                          </button>
                          <button
                            className="account-secondary-btn details-btn"
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View details
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <section className="account-empty">No orders found.</section>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Orders;
