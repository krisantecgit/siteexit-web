import axiosInstance from "./axiosInstance";

/**
 * Create a Stripe PaymentIntent for store checkout.
 * @param {{ orderId: number|string, currency?: string, idempotencyKey: string }} params
 */
export const createPaymentIntent = ({ orderId, currency = "inr", idempotencyKey }) =>
  axiosInstance.post("payments/store/payment-intents/", {
    order_id: Number(orderId),
    currency,
    idempotency_key: idempotencyKey,
  });

export const getPaymentIntentIdempotencyKey = (orderId) => {
  const storageKey = `stripe-ik-${orderId}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const key = `order-${orderId}-${Date.now()}`;
  sessionStorage.setItem(storageKey, key);
  return key;
};

export const clearPaymentIntentIdempotencyKey = (orderId) => {
  sessionStorage.removeItem(`stripe-ik-${orderId}`);
};
