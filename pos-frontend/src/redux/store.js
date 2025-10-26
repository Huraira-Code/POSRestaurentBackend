import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice";
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import receiptSlice from "./slices/receiptSlice";
import dealSlice from "./slices/dealSlice";

const store = configureStore({
  reducer: {
    customer: customerSlice,
    cart: cartSlice,
    user: userSlice,
    receipt: receiptSlice,
    deals: dealSlice, // Add this line
  },

  devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;
