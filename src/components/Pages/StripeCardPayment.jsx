import React, { useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { FaLock } from "react-icons/fa";
import { toast } from "react-toastify";

function StripeCheckoutForm({
  orderId,
  amountLabel,
  processing,
  setProcessing,
  onPaymentSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment is still loading. Please wait a moment.");
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment could not be completed.");
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        await onPaymentSuccess();
        return;
      }

      toast.error("Payment was not completed. Please try again.");
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className="card-form stripe-card-form" onSubmit={handleSubmit}>
      <div className="stripe-element-wrap">
        <PaymentElement
          options={{ layout: "tabs" }}
          onReady={() => setElementReady(true)}
        />
      </div>

      <p className="stripe-powered-note">
        Secured by Stripe. Your card details are encrypted and never stored on our servers.
      </p>

      <div className="payment-action-area">
        <button
          type="submit"
          className="btn-pay-submit online-btn"
          disabled={processing || !stripe || !elements || !elementReady}
        >
          {processing ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <FaLock className="lock-icon" />
              <span>PAY {amountLabel} NOW</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default StripeCheckoutForm;
