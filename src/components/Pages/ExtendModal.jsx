import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./extendmodal.css";
import axiosConfig from "../../Services/axiosConfig"
function ExtendModal({ show, onHide, order }) {
    const [endDate, setEndDate] = useState(null);
    const [rentalInfo, setRentalInfo] = useState({});
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        async function fetchRentalInfo() {
            setLoading(true)
            try {
                const res = await axiosConfig(`/accounts/orders/${order?.id}/rental-info/?rental_order_id=${order?.rental_order_id}`)
                setRentalInfo(res?.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchRentalInfo()
    }, [])
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Body className="extend-modal">
                <div className="extend-title">
                    <div>
                        <img src={rentalInfo?.product_details?.image_url} height={60} width={80} alt="image" />
                    </div>
                    <div>
                        <h5 className="title">Extend Rental</h5>
                        <p className="subtitle">
                            {rentalInfo?.product_details?.name || "JCB 3DX Super Backhoe Loader"}
                        </p>
                    </div>
                </div>

                {/* Current Rental Info */}
                <p className="section-title">Current Rental Info</p>
                <div className="card-box">
                    <div className="row-item">
                        <span>Start Date</span>
                        <span>{rentalInfo?.current_rental_info?.start_date}</span>
                    </div>
                    <div className="row-item">
                        <span>Current Expiry</span>
                        <span className="expiry">{rentalInfo?.current_rental_info?.current_expiry}</span>
                    </div>
                    <div className="row-item">
                        <span>Days Rented</span>
                        <span>{rentalInfo?.current_rental_info?.days_rented}</span>
                    </div>
                </div>

                {/* Date */}
                <p className="section-title">Select New End Date</p>
                <div className="date-box">
                    <div className="date-box">
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select end date"
                            minDate={new Date()}   // prevent past dates
                            className="custom-date-input"
                            popperPlacement="bottom-start"
                        />
                    </div>

                    <div className="extra-days">
                        + 30 extra days added
                    </div>
                </div>

                {/* Cost */}
                <p className="section-title">Cost Breakdown</p>
                <div className="card-box">
                    <div className="row-item">
                        <span>Previous rental (7 days)</span>
                        <span>${rentalInfo?.current_rental_info?.previous_rental_paid}</span>
                    </div>
                    <div className="row-item">
                        <span>Additional cost</span>
                        <span>₹7,14,000</span>
                    </div>
                    <div className="row-item">
                        <span>Platform fee</span>
                        <span>₹200</span>
                    </div>

                    <div className="total-row">
                        <span>Total Payable</span>
                        <span>₹7,14,200</span>
                    </div>
                </div>

                {/* Coupon */}
                {/* <p className="section-title">Coupon Code (Optional)</p>
                <div className="coupon-box">
                    <input type="text" placeholder="Enter coupon code" />
                    <button>Apply</button>
                </div>

                <div className="operator-box">
                    <div>
                        <strong>Include Operator</strong>
                        <p>+₹800/day · Skilled operator provided</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                    </label>
                </div> */}

                {/* Buttons */}
                <button className="pay-btn">Pay & Extend</button>
                <button className="cancel-btn" onClick={onHide}>
                    Cancel
                </button>

            </Modal.Body>
        </Modal>
    );
}

export default ExtendModal;