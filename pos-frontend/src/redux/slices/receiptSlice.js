import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customerReceipts: [],
  kitchenReceipts: [],
  isGenerating: false,
  generatedAt: null
};

const receiptSlice = createSlice({
  name: "receipt",
  initialState,
  reducers: {
    setGeneratingReceipt: (state, action) => {
      state.isGenerating = action.payload;
    },
    
    setReceipts: (state, action) => {
      const { customerReceipts, kitchenReceipts } = action.payload;
      state.customerReceipts = customerReceipts;
      state.kitchenReceipts = kitchenReceipts;
      state.generatedAt = new Date().toISOString();
      state.isGenerating = false;
    },
    
    clearReceipts: (state) => {
      state.customerReceipts = [];
      state.kitchenReceipts = [];
      state.generatedAt = null;
      state.isGenerating = false;
    }
  }
});

export const { setGeneratingReceipt, setReceipts, clearReceipts } = receiptSlice.actions;
export default receiptSlice.reducer;
