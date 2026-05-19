import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice.js"
import addressSlice from "./addressSlice.js"
import wishlistSlice from "./wishlistSlice.js";
const store = configureStore({
    reducer : {
        cart : cartSlice,
        address : addressSlice,
        wishlist: wishlistSlice
    }
})

export default store;
