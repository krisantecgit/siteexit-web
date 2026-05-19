import React, { useEffect, useRef, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import "./login.css";

function LoginModal({ show, onHide, onLoginSuccess }) {
  const inputRef = useRef(null);
  const otpRefs = useRef([...Array(4)].map(() => React.createRef()));
  const [step, setStep] = useState("contact");
  const [contact, setContact] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 120);
  }, [show]);

  const reset = () => {
    setStep("contact");
    setContact("");
    setOtpDigits(["", "", "", ""]);
    setMessage("");
    setError("");
    setLoading(false);
  };

  const close = () => { reset(); onHide?.(); };

  const sendOtp = async () => {
    const nextContact = contact.trim();
    if (!/^\d{10}$/.test(nextContact)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axiosInstance.post("accounts/validate_contact/", {
        contact: nextContact,
        role: "Customer",
      });
      setMessage(data?.message || `OTP sent to ${nextContact}`);
      toast.success(data?.message || "OTP sent");
      setStep("otp");
      setOtpDigits(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.current?.focus(), 120);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 4) { setError("Enter the 4-digit OTP."); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.post("accounts/verify_otp/", {
        contact: contact.trim(),
        otp,
      });
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user_id) localStorage.setItem("userid", data.user_id);
      if (data?.name) localStorage.setItem("name", data.name);
      if (data?.store_id) localStorage.setItem("store_id", data.store_id);
      onLoginSuccess?.(data);
      toast.success("Logged in successfully");
      close();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const updateOtpDigit = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);
    if (value && index < 3) otpRefs.current[index + 1]?.current?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.current?.focus();
  };

  return (
    <Modal show={show} onHide={close} centered dialogClassName="lm-dialog">
      <Modal.Header closeButton className="lm-header">
        <Modal.Title className="lm-title">
          {step === "contact" ? "Sign In" : "Verify OTP"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="lm-body">
        {step === "contact" ? (
          <>
            <p className="lm-sub">Enter your phone number to continue.</p>
            <label className="lm-label">
              Phone number
              <input
                ref={inputRef}
                className="lm-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError("");
                }}
                onKeyDown={(e) => { if (e.key === "Enter") sendOtp(); }}
              />
            </label>
          </>
        ) : (
          <>
            <p className="lm-sub">{message || `OTP sent to ${contact}`}</p>
            <div className="lm-otp-row" aria-label="OTP digits">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs.current[index]}
                  className="lm-otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateOtpDigit(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                />
              ))}
            </div>
            <button
              className="lm-link"
              type="button"
              onClick={() => { setStep("contact"); setOtpDigits(["", "", "", ""]); setError(""); }}
            >
              ← Change number
            </button>
          </>
        )}

        {error && <p className="lm-error">{error}</p>}

        <button
          className="lm-submit"
          type="button"
          onClick={step === "contact" ? sendOtp : verifyOtp}
          disabled={loading}
        >
          {loading
            ? <Spinner animation="border" size="sm" />
            : step === "contact" ? "Send OTP" : "Verify & Login"}
        </button>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;