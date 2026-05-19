import React, { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import axiosConfig from "../../Services/axiosConfig"
import "./couponoffcanva.css"
import { toast } from "react-toastify";
function CouponOffcanvas({
    show,
    handleClose,
    couponType,
    saleCoupon,
    rentCoupon,
    applySaleCoupon,
    applyRentCoupon,
    appliedSaleCoupon,
    appliedRentCoupon,
    refreshCoupons
}) {

    const coupons = couponType === "sale" ? saleCoupon : rentCoupon;
    const [couponCode, setCouponCode] = useState("")
    async function ApplyCoupon() {
        const orderIdRaw = localStorage.getItem("orderId");
        const orderId = (!orderIdRaw || orderIdRaw === "null" || orderIdRaw === "undefined") ? "580" : orderIdRaw;
        let payload = {
            order_id: orderId,
            coupon_code: couponCode
        }
        try {
            await axiosConfig.post("/accounts/orders/apply-coupon/", payload);
            toast.success("coupon applied successfully")
            refreshCoupons();
            handleClose();
        } catch (error) {
            const errorMsg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.error?.[0] || "Failed to apply coupon";
            toast.error(errorMsg);
        }
    }
    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            className="couponoff-offcanvas"
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="couponoff-title">
                    Offers and Discounts
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>

                <div className="couponoff-input-box">
                    <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        className="couponoff-input"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                        className="couponoff-input-apply"
                        onClick={ApplyCoupon}
                    >
                        APPLY
                    </button>
                </div>

                <p className="couponoff-offer-heading">Offers for you</p>

                {coupons?.map((coupon) => {

                    const isApplied =
                        couponType === "sale"
                            ? appliedSaleCoupon === coupon.id
                            : appliedRentCoupon === coupon.id;

                    return (
                        <div
                            className={`couponoff-card ${isApplied ? "applied" : ""}`}
                            key={coupon.id}
                        >

                            <p className="couponoff-offer">
                                {coupon.description || "Special Offer"}
                            </p>

                            <div className="couponoff-ticket">
                                <span>{coupon.code}</span>

                                <button
                                    className={isApplied ? "remove-btn" : ""}
                                    onClick={() =>
                                        couponType === "sale"
                                            ? applySaleCoupon(coupon.code, coupon.id)
                                            : applyRentCoupon(coupon.code, coupon.id)
                                    }
                                >
                                    {isApplied ? "Remove" : "Apply"}
                                </button>
                            </div>

                            <p className="couponoff-terms">
                                *Terms and Conditions
                            </p>

                        </div>
                    );
                })}

            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default CouponOffcanvas;