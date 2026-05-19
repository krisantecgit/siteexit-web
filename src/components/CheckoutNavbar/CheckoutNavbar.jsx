import React from 'react'
import "./nav.css"
import logo from "../images/logo.webp"
import { useLocation, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaRegFileAlt, FaCreditCard } from 'react-icons/fa'

function CheckoutNavbar() {
  let navigate = useNavigate();
  const location = useLocation()
  const params = location.pathname;
  return (
    <div className='checkout-header'>
      <div className="left-content">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" />
        </div>
      </div>

      <div className="checkout-steps">
        <div className={`step ${params === "/address" ? "active" : ""}`}>
          <FaMapMarkerAlt className="step-icon" />
          <p>Address</p>
        </div>

        <div className="dashed-line"></div>

        <div className={`step ${params === "/checkout" ? "active" : ""}`}>
          <FaRegFileAlt className="step-icon" />
          <p>Order Summary</p>
        </div>

        <div className="dashed-line"></div>

        <div className={`step ${params === "/payment" ? "active" : ""}`}>
          <FaCreditCard className="step-icon" />
          <p>Payments</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutNavbar
