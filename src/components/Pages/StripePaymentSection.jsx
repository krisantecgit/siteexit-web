import React, { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import StripeCheckoutForm from "./StripeCardPayment";
import { resolveStripePublishableKey } from "../../config/stripe";
import {
  createPaymentIntent,
  getPaymentIntentIdempotencyKey,
} from "../../utils/paymentApi";

function StripePaymentSection({
  orderId,
  amountLabel,
  processing,
  setProcessing,
  onPaymentSuccess,
}) {
  const [publishableKey, setPublishableKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(true);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadKey() {
      setKeyLoading(true);
      const key = await resolveStripePublishableKey();
      if (cancelled) return;

      setPublishableKey(key);
      setStripePromise(key ? loadStripe(key) : null);
      setKeyLoading(false);
    }

    loadKey();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!orderId || !stripePromise || !publishableKey) {
      return undefined;
    }

    let cancelled = false;

    async function initPaymentIntent() {
      setIntentLoading(true);
      setIntentError("");

      try {
        const idempotencyKey = getPaymentIntentIdempotencyKey(orderId);
        const res = await createPaymentIntent({
          orderId,
          currency: "inr",
          idempotencyKey,
        });

        const secret =
          res.data?.client_secret || res.data?.payment?.client_secret;

        if (!secret) {
          throw new Error("Missing client_secret from payment intent response.");
        }

        if (!cancelled) {
          setClientSecret(secret);
        }
      } catch (error) {
        console.error("Payment intent error:", error);
        if (!cancelled) {
          const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Could not start secure payment. Please try again.";
          setIntentError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIntentLoading(false);
        }
      }
    }

    initPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [orderId, publishableKey, stripePromise]);

  const elementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#fe7900",
                colorBackground: "#ffffff",
                colorText: "#1a1f36",
                borderRadius: "8px",
              },
            },
          }
        : null,
    [clientSecret]
  );

  if (keyLoading) {
    return (
      <div className="stripe-status">
        <span className="btn-spinner" />
        <p>Loading payment configuration…</p>
      </div>
    );
  }

  if (!publishableKey || !stripePromise) {
    return (
      <div className="stripe-status stripe-status-error">
        <p>
          Stripe publishable key not found. Add{" "}
          <code>REACT_APP_STRIPE_PUBLISHABLE_KEY</code> to <code>.env</code> and
          restart <code>npm start</code>, or set <code>publishableKey</code> in{" "}
          <code>public/stripe-config.json</code>.
        </p>
      </div>
    );
  }

  if (intentLoading) {
    return (
      <div className="stripe-status">
        <span className="btn-spinner" />
        <p>Preparing secure checkout…</p>
      </div>
    );
  }

  if (intentError || !clientSecret || !elementsOptions) {
    return (
      <div className="stripe-status stripe-status-error">
        <p>{intentError || "Unable to initialize payment. Please refresh and try again."}</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripeCheckoutForm
        orderId={orderId}
        amountLabel={amountLabel}
        processing={processing}
        setProcessing={setProcessing}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
}

export default StripePaymentSection;