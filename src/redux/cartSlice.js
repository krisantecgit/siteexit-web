// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     buyCart: JSON.parse(localStorage.getItem("buyCart")) || [],
//     rentCart: JSON.parse(localStorage.getItem("rentCart")) || []
// };

// const cartSlice = createSlice({
//     name: "cart",
//     initialState,
//     reducers: {
//         addToBuyCart: (state, action) => {
//             const existing = state.buyCart.find(item => item.id === action.payload.id);

//             if (existing) {
//                 existing.qty += 1;
//             } else {
//                 state.buyCart.push({ ...action.payload, qty: 1 });
//             }

//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         addToRentCart: (state, action) => {
//             const existing = state.rentCart.find(item => item.id === action.payload.id);

//             if (existing) {
//                 existing.qty += 1;
//             } else {
//                 state.rentCart.push({ ...action.payload, qty: 1 });
//             }

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         decreaseBuyQty: (state, action) => {
//             const existing = state.buyCart.find(item => item.id === action.payload);

//             if (!existing) return;

//             if (existing.qty > 1) {
//                 existing.qty -= 1;
//             } else {
//                 state.buyCart = state.buyCart.filter(item => item.id !== action.payload);
//             }

//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         decreaseRentQty: (state, action) => {
//             const existing = state.rentCart.find(item => item.id === action.payload);

//             if (!existing) return;

//             if (existing.qty > 1) {
//                 existing.qty -= 1;
//             } else {
//                 state.rentCart = state.rentCart.filter(item => item.id !== action.payload);
//             }

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         removeFromBuyCart: (state, action) => {
//             state.buyCart = state.buyCart.filter(item => item.id !== action.payload);
//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         removeFromRentCart: (state, action) => {
//             state.rentCart = state.rentCart.filter(item => item.id !== action.payload);
//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         clearBuyCart: (state) => {
//             state.buyCart = [];
//             localStorage.removeItem("buyCart");
//         },

//         clearRentCart: (state) => {
//             state.rentCart = [];
//             localStorage.removeItem("rentCart");
//         },
//         setRentDates: (state, action) => {
//             const { id, fromDate, toDate } = action.payload;
//             const existing = state.rentCart.find(item => item.id === id);
//             if (existing) {
//                 existing.fromDate = fromDate;
//                 existing.toDate = toDate;
//             }
//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },
//     }
// });

// export const {
//     addToBuyCart,
//     addToRentCart,
//     decreaseBuyQty,
//     decreaseRentQty,
//     removeFromBuyCart,
//     removeFromRentCart,
//     clearBuyCart,
//     clearRentCart,
//     setRentDates
// } = cartSlice.actions;

// export default cartSlice.reducer;
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     buyCart: JSON.parse(localStorage.getItem("buyCart")) || [],
//     rentCart: JSON.parse(localStorage.getItem("rentCart")) || [],
//     rentalPackages: JSON.parse(localStorage.getItem("rentalPackages")) || {}
// };

// const cartSlice = createSlice({
//     name: "cart",
//     initialState,
//     reducers: {

//         /* ===================== BUY CART ===================== */

//         addToBuyCart: (state, action) => {
//             const existing = state.buyCart.find(
//                 item => item.id === action.payload.id
//             );

//             if (existing) {
//                 existing.qty += 1;
//             } else {
//                 state.buyCart.push({
//                     ...action.payload,
//                     qty: 1
//                 });
//             }

//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         decreaseBuyQty: (state, action) => {
//             const existing = state.buyCart.find(
//                 item => item.id === action.payload
//             );

//             if (!existing) return;

//             if (existing.qty > 1) {
//                 existing.qty -= 1;
//             } else {
//                 state.buyCart = state.buyCart.filter(
//                     item => item.id !== action.payload
//                 );
//             }

//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         removeFromBuyCart: (state, action) => {
//             state.buyCart = state.buyCart.filter(
//                 item => item.id !== action.payload
//             );

//             localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
//         },

//         clearBuyCart: (state) => {
//             state.buyCart = [];
//             localStorage.removeItem("buyCart");
//         },

//         /* ===================== RENT CART ===================== */

//         // ✅ ALWAYS ADD NEW RENT ITEM (NO MERGE)
//         addToRentCart: (state, action) => {
//             const { cartItemId } = action.payload;

//             const existing = state.rentCart.find(
//                 item => item.cartItemId === cartItemId
//             );

//             if (existing) {
//                 // ✅ SAME UNIQUE CART ITEM → INCREASE QTY
//                 existing.qty += 1;
//             } else {
//                 // ✅ NEW UNIQUE CART ITEM → ADD
//                 state.rentCart.push({
//                     ...action.payload,
//                     qty: 1
//                 });
//             }

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         // ✅ USE cartItemId (NOT product id)
//         decreaseRentQty: (state, action) => {
//             const existing = state.rentCart.find(
//                 item => item.cartItemId === action.payload
//             );

//             if (!existing) return;

//             if (existing.qty > 1) {
//                 existing.qty -= 1;
//             } else {
//                 state.rentCart = state.rentCart.filter(
//                     item => item.cartItemId !== action.payload
//                 );
//             }

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         removeFromRentCart: (state, action) => {
//             state.rentCart = state.rentCart.filter(
//                 item => item.cartItemId !== action.payload
//             );

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },

//         clearRentCart: (state) => {
//             state.rentCart = [];
//             localStorage.removeItem("rentCart");
//         },

//         // ✅ UPDATE RENT DATES PER UNIQUE RENT ITEM
//         setRentDates: (state, action) => {
//             const { cartItemId, fromDate, toDate } = action.payload;

//             const existing = state.rentCart.find(
//                 item => item.cartItemId === cartItemId
//             );

//             if (existing) {
//                 existing.fromDate = fromDate;
//                 existing.toDate = toDate;
//             }

//             localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
//         },
//         setRentalPackages: (state, action) => {
//             const { variantId, packages } = action.payload;
//             // You might want to store all available packages by variant ID
//             state.rentalPackages[variantId] = packages;
//             localStorage.setItem("rentalPackages", JSON.stringify(state.rentalPackages));
//         }
//     }
// });

// export const {
//     addToBuyCart,
//     addToRentCart,
//     decreaseBuyQty,
//     decreaseRentQty,
//     removeFromBuyCart,
//     removeFromRentCart,
//     clearBuyCart,
//     clearRentCart,
//     setRentDates,
//     setRentalPackages
// } = cartSlice.actions;

// export default cartSlice.reducer;
// cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    buyCart: JSON.parse(localStorage.getItem("buyCart")) || [],
    rentCart: JSON.parse(localStorage.getItem("rentCart")) || []
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        /* ===================== BUY CART ===================== */
        addToBuyCart: (state, action) => {
            const existing = state.buyCart.find(
                item => item.id === action.payload.id
            );

            if (existing) {
                existing.qty += 1;
            } else {
                state.buyCart.push({
                    ...action.payload,
                    qty: 1
                });
            }

            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        decreaseBuyQty: (state, action) => {
            const existing = state.buyCart.find(
                item => item.id === action.payload
            );

            if (!existing) return;

            if (existing.qty > 1) {
                existing.qty -= 1;
            } else {
                state.buyCart = state.buyCart.filter(
                    item => item.id !== action.payload
                );
            }

            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        removeFromBuyCart: (state, action) => {
            state.buyCart = state.buyCart.filter(
                item => item.id !== action.payload
            );
            localStorage.setItem("buyCart", JSON.stringify(state.buyCart));
        },

        clearBuyCart: (state) => {
            state.buyCart = [];
            localStorage.removeItem("buyCart");
        },

        /* ===================== RENT CART ===================== */
        addToRentCart: (state, action) => {
            const { cartItemId } = action.payload;
            const existing = state.rentCart.find(
                item => item.cartItemId === cartItemId
            );

            if (existing) {
                existing.qty += 1;
            } else {
                // Calculate monthly price from package if available
                let offerPrice = action.payload.offerPrice;
                if (action.payload.selectedPackage) {
                    offerPrice = action.payload.selectedPackage.offer_price / action.payload.selectedPackage.duration_value;
                }
                
                state.rentCart.push({
                    ...action.payload,
                    qty: 1,
                    offerPrice: offerPrice,
                    selectedPackage: action.payload.selectedPackage || null
                });
            }

            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        decreaseRentQty: (state, action) => {
            const existing = state.rentCart.find(
                item => item.cartItemId === action.payload
            );

            if (!existing) return;

            if (existing.qty > 1) {
                existing.qty -= 1;
            } else {
                state.rentCart = state.rentCart.filter(
                    item => item.cartItemId !== action.payload
                );
            }

            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        removeFromRentCart: (state, action) => {
            state.rentCart = state.rentCart.filter(
                item => item.cartItemId !== action.payload
            );
            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        clearRentCart: (state) => {
            state.rentCart = [];
            localStorage.removeItem("rentCart");
        },

        setRentDates: (state, action) => {
            const { cartItemId, fromDate, toDate } = action.payload;
            const existing = state.rentCart.find(
                item => item.cartItemId === cartItemId
            );

            if (existing) {
                existing.fromDate = fromDate;
                existing.toDate = toDate;
            }
            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        },

        // ✅ Set selected rental package for a cart item
        setRentalPackage: (state, action) => {
            const { cartItemId, packageData } = action.payload;
            
            const rentItem = state.rentCart.find(
                item => item.cartItemId === cartItemId
            );
            
            if (rentItem) {
                rentItem.selectedPackage = packageData;
                // Calculate and update the monthly offer price
                rentItem.offerPrice = packageData.offer_price / packageData.duration_value;
            }
            
            localStorage.setItem("rentCart", JSON.stringify(state.rentCart));
        }
    }
});

export const {
    addToBuyCart,
    addToRentCart,
    decreaseBuyQty,
    decreaseRentQty,
    removeFromBuyCart,
    removeFromRentCart,
    clearBuyCart,
    clearRentCart,
    setRentDates,
    setRentalPackage
} = cartSlice.actions;

export default cartSlice.reducer;