import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axiosInstance from "../../utils/axiosInstance";
import "./orderdetails.css"
import { TbTruckDelivery } from 'react-icons/tb';
import { FaFileDownload } from 'react-icons/fa';
import { IoArrowBack } from "react-icons/io5";

function OrderDetails({ orderIdProp, typeProp, rentalIdProp, addressIdProp, onBack }) {
    let [searchParams] = useSearchParams();
    let navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const [addressData, setAddressdata] = useState()
    const [lodaing, setLoading] = useState(false)
    const orderId = orderIdProp || searchParams.get("orderID");
    const type = typeProp || searchParams.get("type");
    const rentalId = rentalIdProp || searchParams.get("rental_id");
    const addressId = addressIdProp || searchParams.get("address");
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            // minimumFractionDigits: 0,
            // maximumFractionDigits: 0,
        }).replace("$", "$ ");
    async function fetchAddress() {
        try {
            const response = await axiosInstance(`/accounts/address/${addressId}`)
            setAddressdata(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (!orderId || !type) {
            if (!orderIdProp) navigate("/account/orders");
            return;
        }
        async function fetchOrderData() {
            setLoading(true)
            try {
                const rentalParam =
                    type === "rental" ? `&rental_order_id=${rentalId || ""}` : "";

                const res = await axiosInstance(`/accounts/orderdetails/?order=${orderId}&item_type=${type}${rentalParam}`)
                setOrderData(res?.data.results)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrderData()
        fetchAddress()
    }, [rentalId, type, orderId, navigate, orderIdProp])
    const rentalItems = orderData.filter(item => item.item_type === "rental");
    const saleItems = orderData.filter(item => item.item_type === "sale");
    const saleDeliveryCharge =
        orderData.length > 0
            ? Number(orderData[0]?.order?.sale_delivery_charges || 0)
            : 0;

    const saleTotalWithDelivery =
        Number(orderData[0]?.order?.sale_total_amount || 0) +
        Number(orderData[0]?.order?.sale_delivery_charges || 0);

    const rentDeliveryCharge =
        orderData.length > 0
            ? Number(orderData[0]?.order?.rental_delivery_charges || 0)
            : 0;
    const rentTotalWithDelivery =
    Number(orderData[0]?.order?.rental_total_amount || 0) +
    Number(orderData[0]?.order?.rental_delivery_charges || 0);
    const invoiceStatus = orderData[0]?.order?.invoice_status;
    async function handlePrint(id) {
        try {
            const res = await axiosInstance(`/accounts/pdf/${id}/`, { responseType: "blob" })
            const file = new Blob([res.data], { type: "application/pdf" })
            const fileUrl = URL.createObjectURL(file)
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', `Invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.log(error)
            alert("pdf not available")
        }
    }
    return (
        <>
            {
                lodaing ? <div className='spinner-container'><div className='modern-spinner'></div></div> :
                    (
                        <div>
                            <div className="order-details-wrapper">
                                <button
                                    type="button"
                                    className="order-back-button"
                                    onClick={onBack || (() => navigate(-1))}
                                >
                                    <IoArrowBack /> Back to Orders
                                </button>
                                <div className="order-details-topbar">
                                    <div className="order-summary-meta">
                                        <h4 className='mb-0'>{orderData.length} item{orderData.length > 1 ? "s" : ""}</h4>
                                        <div className="order-meta-row">
                                            <h4 className='mb-0'>Order Id: {orderId}</h4>
                                            {invoiceStatus === "Rejected" && (
                                                <span className="invoice-status-badge rejected">Invoice Rejected</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='d-flex gap-2 align-items-center'>
                                        <button className="btn btn-sm d-flex align-items-center gap-2" style={{ backgroundColor: "rgb(6, 155, 170)", color: "white", border: "none" }} onClick={() => handlePrint(orderId)}>
                                            <FaFileDownload /> Download Invoice
                                        </button>
                                    </div>
                                </div>
                                {orderData.map((item) => (
                                    <div className="order-item" key={item.id}>
                                        <div className="left">
                                            <img
                                                src={item?.varient?.images[0]?.image.image || "/placeholder.png"}
                                                alt="product"
                                            />

                                            <div className="info">
                                                <div className="name">{item.varient?.name}</div>
                                                <div className="qty">
                                                    ${item.offer_price} × {item.quantity}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right">
                                            <div className="price">${item.total_price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="price-breakup-section">
                                {rentalItems.length > 0 && (
                                    <div className="breakup-background2">
                                        <div className="break-header">
                                            <h4>Rent Cost Breakup</h4>
                                        </div>

                                        <div className="data-container-parent">
                                            {rentalItems.map((item) => {
                                                const basePrice = Number(
                                                    item?.varient?.product?.rental_price ??
                                                    item?.varient?.prices?.rental_price ??
                                                    0
                                                );
                                                const qty = Number(item.quantity);
                                                const duration = Number(item.rental_duration);
                                                const rentalBaseTotal = basePrice * duration * qty;
                                                const rentalSubtotal = Number(item.total_price || 0);
                                                const rentalDiscount = Math.max(rentalBaseTotal - rentalSubtotal, 0);
                                                return (
                                                    <div className="data-container" key={item.id}>
                                                        <div className="break-item-title">
                                                            {item.varient.name} × {qty}
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(A) Base Rental Cost</div>
                                                            <div>
                                                                {formatPrice(basePrice)}/
                                                                {item.package === "Monthly"
                                                                    ? "Month"
                                                                    : item.package === "Daily"
                                                                        ? "Day"
                                                                        : "Week"}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(B) Duration</div>
                                                            <div>
                                                                {duration}{" "}
                                                                {item.package === "Monthly"
                                                                    ? "Months"
                                                                    : item.package === "Daily"
                                                                        ? "Days"
                                                                        : "Weeks"}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(C) Quantity</div>
                                                            <div>{qty} Qty</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(D) Total Price (A × B × C)</div>
                                                            <div>{formatPrice(rentalBaseTotal)}</div>
                                                        </div>

                                                        <div className="breakup-item text-success">
                                                            <div>(E) Rental Discount</div>
                                                            <div>
                                                                -{Math.round(Number(item.discount_percentage))}%{" "}
                                                                -{formatPrice(rentalDiscount)}
                                                            </div>
                                                        </div>
                                                        <div className="breakup-item text-success">
                                                            <div>(F) Rental Coupon Discount</div>
                                                            <div>-{formatPrice(item?.rental_coupon_discount || 0)}</div>
                                                        </div>
                                                        <div className="breakup-item">
                                                            <div>(G) Delivery Charges</div>
                                                            <div>{formatPrice(item.delivery_charges)}</div>
                                                        </div>
                                                        <div className="breakup-item">
                                                            <div>Net Amount</div>
                                                            <div>{formatPrice(item?.net_amount || 0)}</div>
                                                        </div>

                                                        <div className="discount-green">
                                                            You Will Save {formatPrice(rentalDiscount)}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="breakup-item">
                                                <div>Rental Total</div>
                                                <div>{formatPrice(rentTotalWithDelivery)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {saleItems.length > 0 && (
                                    <div className="breakup-background2">
                                        <div className="break-header">
                                            <h4>Buy Cost Breakup</h4>
                                        </div>

                                        <div className="data-container-parent">
                                            {saleItems.map((item) => {
                                                const price = Number(item.price);
                                                const offer = Number(item.offer_price);
                                                const qty = Number(item.quantity);
                                                return (
                                                    <div className="data-container" key={item.id}>
                                                        <div className="break-item-title">
                                                            {item.varient.name} × {qty}
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(A) Base Sale Cost</div>
                                                            <div>{formatPrice(price)}</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(B) Quantity</div>
                                                            <div>{qty} Qty</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(C) Total Price (A × B)</div>
                                                            <div>{formatPrice(price * qty)}</div>
                                                        </div>

                                                        <div className="breakup-item text-success">
                                                            <div>(D) Sale Discount</div>
                                                            <div>
                                                                -{Math.round(((price - offer) / price) * 100)}%{" "}
                                                                -{formatPrice(price * qty - offer * qty)}
                                                            </div>
                                                        </div>
                                                        <div className="breakup-item text-success">
                                                            <div>(E) Sale Coupon Discount</div>
                                                            <div>-{formatPrice(orderData[0]?.sale_coupon_discount)}</div>
                                                        </div>
                                                        <div className="breakup-item">
                                                            <div>(F) Net Price</div>
                                                            <div>{formatPrice(offer * qty)}</div>
                                                        </div>
                                                        <div className="breakup-item">
                                                            <div>(G) Delivery Charges</div>
                                                            <div>{formatPrice(saleDeliveryCharge)}</div>
                                                        </div>

                                                        <div className="discount-green">
                                                            You Will Save {formatPrice(price * qty - offer * qty)}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="breakup-item">
                                                <div>Sale Total</div>
                                                <div>{formatPrice(saleTotalWithDelivery)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            {addressData && (
                                <div className="delivery-address-card">
                                    <div className="delivery-header">
                                        <span className="address-icon"><TbTruckDelivery /></span>
                                        <span className="delivery-title">Delivery Address</span>
                                    </div>

                                    <div className="delivery-body">
                                        <div className="address-row">
                                            <span className="label">Name:</span>
                                            <span className="value">{addressData.name}</span>
                                        </div>

                                        <div className="address-row">
                                            <span className="label">Phone number:</span>
                                            <span className="value">{addressData.mobileno}</span>
                                        </div>

                                        <div className="address-row">
                                            <span className="label">Address:</span>
                                            <span className="value">
                                                {addressData.flat_no}, {addressData.address_line_1},{" "}
                                                {addressData.address_line_2}, {addressData.city},{" "}
                                                {addressData.state} {addressData.zipcode},{" "}
                                                {addressData.country}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    )
            }

        </>
    )
}

export default OrderDetails
