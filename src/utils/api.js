import axiosInstance from "./axiosInstance";

// ─── Enquiry / Lead ────────────────────────────────────────────────────────────

/**
 * Submit an enquiry/lead form
 * @param {Object} payload - { full_name, mobile, email, location, from_date, to_date, message, product }
 */
export const submitEnquiry = (payload) =>
  axiosInstance.post("api/leads/", payload);

// ─── Contact ───────────────────────────────────────────────────────────────────

/**
 * Submit a contact-us message
 * @param {Object} payload - { full_name, mobile, email, location, message }
 */
export const submitContact = (payload) =>
  axiosInstance.post("api/contact/", payload);
