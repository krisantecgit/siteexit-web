import { createSlice } from "@reduxjs/toolkit";

const readWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch {
    return [];
  }
};

const persistWishlist = (items) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
};

const initialState = {
  items: readWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlistItem: (state, action) => {
      const existing = state.items.find((item) => item.id === action.payload.id);

      if (existing) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }

      persistWishlist(state.items);
    },
    removeWishlistItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem("wishlist");
    },
  },
});

export const { toggleWishlistItem, removeWishlistItem, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
