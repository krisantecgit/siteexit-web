import axiosInstance from "./axiosInstance";

export const getOrders = ({ userId, orderType = "" }) =>
  axiosInstance.get("accounts/orders/", {
    params: { page: 1, user: userId, order_type: orderType },
  });

export const downloadInvoice = (orderId) =>
  axiosInstance.get(`accounts/pdf/${orderId}/`, {
    responseType: "blob",
  });

export const getAddresses = (userId) =>
  axiosInstance.get("accounts/address/", {
    params: { user: userId, is_suspended: false },
  });

export const updateAddress = (addressId, payload) =>
  axiosInstance.patch(`accounts/address/${addressId}/`, payload);

export const getWishlist = ({ userId, type }) =>
  axiosInstance.get("catlog/wishlists/", {
    params: { user: userId, type },
  });

export const removeWishlist = (wishlistId) =>
  axiosInstance.delete(`catlog/wishlists/${wishlistId}/`);
