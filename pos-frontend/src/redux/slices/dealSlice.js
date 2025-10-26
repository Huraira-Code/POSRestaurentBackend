// redux/slices/dealsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deals: [],
  loading: false,
  error: null,
};

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    // Add a deal to cart
    addDealToCart: (state, action) => {
           const uniqueId = new Date().getTime() + Math.random(); 

      state.deals.push({
        ...action.payload,
        quantity: 1, // Initialize quantity
        uniqueId
      });
    },

    // Remove deal from cart
    removeDealFromCart: (state, action) => {
      state.deals = state.deals.filter(
        (deal) => deal.uniqueId !== action.payload
      );
    },

    // Update deal quantity
    updateDealQuantity: (state, action) => {
      const { dealId, quantity } = action.payload;
      const deal = state.deals.find((d) => d.dealId === dealId);
      if (deal) {
        if (quantity <= 0) {
          state.deals = state.deals.filter((d) => d.dealId !== dealId);
        } else {
          deal.quantity = quantity;
        }
      }
    },

    // Clear all deals from cart
    clearDeals: (state) => {
      state.deals = [];
    },

    // Set loading state
    setDealsLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setDealsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addDealToCart,
  removeDealFromCart,
  updateDealQuantity,
  clearDeals,
  setDealsLoading,
  setDealsError,
} = dealsSlice.actions;

export default dealsSlice.reducer;
