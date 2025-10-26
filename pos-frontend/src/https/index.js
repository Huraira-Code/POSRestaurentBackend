import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");
export const superAdminLogout = () =>
  axiosWrapper.post("/api/user/superadmin-logout");

//Super Admin Endpoints
export const registerAdmin = (data) =>
  axiosWrapper.post("/api/user/register-admin", data);
export const createCategory = (data) =>
  axiosWrapper.post("/api/user/create-category", data);
export const createItem = (data) => {
  // For FormData uploads, we need to remove the default Content-Type header
  // to let the browser set it with the correct boundary
  if (data instanceof FormData) {
    return axiosWrapper.post("/api/user/create-item", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return axiosWrapper.post("/api/user/create-item", data);
};
export const createMenu = (data) => {
  // For FormData uploads, we need to remove the default Content-Type header
  // to let the browser set it with the correct boundary
  if (data instanceof FormData) {
    return axiosWrapper.post("/api/user/create-menu", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return axiosWrapper.post("/api/user/create-menu", data);
};
export const getAllAdmin = () => axiosWrapper.get("/api/user/get-admin");
export const getCategoriesForAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/admin-categories/${adminId}`);
export const importCategories = (data) =>
  axiosWrapper.post("/api/user/import-categories", data);
export const importItems = (data) =>
  axiosWrapper.post("/api/user/import-items", data);
export const importMenus = (data) =>
  axiosWrapper.post("/api/user/import-menus", data);
export const assignCategoriesToImportedItems = (data) =>
  axiosWrapper.post("/api/user/assign-categories", data);
export const assignItemsToImportedMenu = (data) =>
  axiosWrapper.post("/api/user/assign-items", data);
export const getAllItemsOfAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-items/${adminId}`);
export const getAllMenuOfAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-menus/${adminId}`);
export const deleteCategory = (adminId, categoryId) =>
  axiosWrapper.delete(`/api/user/admin-categories/${adminId}`, {
    data: { categoryId },
  });
export const updateCategory = (adminId, categoryId, data) =>
  axiosWrapper.patch(`/api/user/admin-categories/${adminId}`, {
    categoryId,
    ...data,
  });
export const deleteItem = (adminId, itemId) =>
  axiosWrapper.delete(`/api/user/delete-item/${adminId}`, { data: { itemId } });
export const updateItem = (adminId, itemId, data) => {
  // For FormData uploads, we need to handle multipart/form-data
  if (data instanceof FormData) {
    // Add adminId and itemId to FormData
    data.append("itemId", itemId);
    return axiosWrapper.patch(`/api/user/update-item/${adminId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return axiosWrapper.patch(`/api/user/update-item/${adminId}`, {
    itemId,
    ...data,
  });
};
export const deleteMenu = (adminId, menuId) =>
  axiosWrapper.delete(`/api/user/delete-menu/${adminId}`, { data: { menuId } });
export const updateMenu = (adminId, menuId, data) => {
  // For FormData uploads, we need to handle multipart/form-data
  if (data instanceof FormData) {
    // Add adminId and menuId to FormData
    data.append("menuId", menuId);
    return axiosWrapper.patch(`/api/user/update-menu/${adminId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return axiosWrapper.patch(`/api/user/update-menu/${adminId}`, {
    menuId,
    ...data,
  });
};
export const removeItemFromMenu = (data) =>
  axiosWrapper.post("/api/user/remove-item", data);

// Voucher Management Endpoints
export const createVoucher = (data) =>
  axiosWrapper.post("/api/user/create-voucher", data);
export const updateVoucher = (data) =>
  axiosWrapper.patch("/api/user/update-voucher", data);
export const getAllVouchers = () => axiosWrapper.get("/api/user/get-vouchers"); //It gets all vouchers
export const getVouchersByAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-vouchers/${adminId}`);
export const deleteVoucher = (data) =>
  axiosWrapper.delete("/api/user/delete-voucher", { data });
export const validateVoucher = (data) =>
  axiosWrapper.post("/api/user/validate-voucher", data);

// Deal Management Endpoints (SuperAdmin)
export const createDeal = (data) =>
  axiosWrapper.post("/api/user/create-deal", data);
export const updateDeal = (dealId, data) =>
  axiosWrapper.patch(`/api/user/update-deal/${dealId}`, data);
export const getDealsByAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-deals/${adminId}`);
export const getMyCreatedDeals = () =>
  axiosWrapper.get("/api/user/my-created-deals");
export const deleteDeal = (dealId) =>
  axiosWrapper.delete(`/api/user/delete-deal/${dealId}`);
export const getDealById = (dealId) =>
  axiosWrapper.get(`/api/user/deal/${dealId}`);
export const calculateDealTax = (dealId, paymentMethod) =>
  axiosWrapper.get(
    `/api/user/deal-tax/${dealId}?paymentMethod=${paymentMethod}`
  );

// Deal Management Endpoints (Admin)
export const getMyDeals = () => axiosWrapper.get("/api/admin/get-deals");

// Admin Menu Endpoints (for fetching categories, items, and menus)
export const getCategories = () =>
  axiosWrapper.get("/api/admin/get-categories");
export const getItemsByCategory = (categoryId) =>
  axiosWrapper.get(`/api/admin/get-items/${categoryId}`);
export const getMenus = () => axiosWrapper.get("/api/admin/get-menus");
export const getItems = () => axiosWrapper.get("/api/admin/get-all-items");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Management Endpoints
export const createOrder = (data) =>
  axiosWrapper.post("/api/admin/create-order", data);
export const updateOrderNew = (data) =>
  axiosWrapper.post("/api/admin/update-order-item-deal", data);

export const updateOrder = (data) =>
  axiosWrapper.patch("/api/admin/update-order", data);
export const changePaymentMethod = (data) =>
  axiosWrapper.post("/api/admin/change-payment-method", data);

export const completeOrder = (data) =>
  axiosWrapper.patch("/api/admin/complete-order", data);
export const getPayment = (data) =>
  axiosWrapper.patch("/api/admin/get-payment", data);
export const getOrders = ({ page = 1, limit = 10 } = {}) => {
  return axiosWrapper.get(`/api/admin/orders?page=${page}&limit=${limit}`);
};

export const deleteOrders = (data) => {
  return axiosWrapper.post("/api/admin/deleteOrder", data);
};



export const generateCustomerReceipts = (data) =>
  axiosWrapper.post("/api/admin/generate-customer-receipts", data);
export const printDailySalesReportAndCloseDay = () =>
  axiosWrapper.post("/api/user/printDailySalesReportAndCloseDay"); // Adjust endpoint URL if different

// Receipt Endpoints
export const generateReceipt = (data) =>
  axiosWrapper.post("/api/admin/generate-receipt", data);
export const getAllReceipts = () => axiosWrapper.get("/api/admin/get-receipts");
export const getReceiptsByAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-receipts/${adminId}`);

// Orders Analytics Endpoints
export const getOrdersByAdmin = (adminId) =>
  axiosWrapper.get(`/api/user/get-orders/${adminId}`);
export const exportOrdersToExcel = (adminId) =>
  axiosWrapper.get(`/api/user/export-orders/${adminId}`);
