import React, { useState, useEffect, useCallback } from "react";
import {
  FaUserPlus,
  FaUsers,
  FaUtensils,
  FaEdit,
  FaTrash,
  FaEye,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdRestaurantMenu, MdAssignment } from "react-icons/md";
import {
  logout as logoutAPI,
  superAdminLogout,
  getAllAdmin,
  getCategoriesForAdmin,
  getAllItemsOfAdmin,
  getAllMenuOfAdmin,
  deleteCategory,
  updateCategory,
  deleteItem,
  updateItem,
  deleteMenu,
  updateMenu,
  getReceiptsByAdmin,
  getOrdersByAdmin,
  exportOrdersToExcel,
  getAnalyticsByAdmin,
  getAllVouchers,
  getVouchersByAdmin,
  deleteVoucher,
  getDealsByAdmin,
  deleteDeal,
} from "../../https/index";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import CreateUserModal from "../superAdminModals/CreateUserModal";
import CreateCategoryModal from "../superAdminModals/CreateCategoryModal";
import CreateItemModal from "../superAdminModals/CreateItemModal";
import CreateMenuModal from "../superAdminModals/CreateMenuModal";
import EditCategoryModal from "../superAdminModals/EditCategoryModal";
import EditItemModal from "../superAdminModals/EditItemModal";
import EditMenuModal from "../superAdminModals/EditMenuModal";
import CreateVoucherModal from "../superAdminModals/CreateVoucherModal";
import EditVoucherModal from "../superAdminModals/EditVoucherModal";
import CreateDealModal from "../superAdminModals/CreateDealModal";
import EditDealModal from "../superAdminModals/EditDealModal";
import AdminInsights from "./AdminInsight";
import LogoutModal from "../superAdminModals/LogoutModal";
import DeleteCategory from "../superAdminModals/DeleteCategory";
import DeleteItemModal from "../superAdminModals/DeleteItemModal";
import DeleteMenuModal from "../superAdminModals/DeleteMenuModal";
import SetupWizardTab from "./componenets/SetupWizardTab";
import AllAdminsTab from "./componenets/AllAdminTab";
import DeleteVoucherModal from "../superAdminModals/DeleteVoucherModal";

const tabs = ["Setup Wizard", "All Admins"];

const setupSteps = [
  {
    id: 1,
    title: "Create User",
    description: "First, create a user account",
    completed: false,
  },
  {
    id: 2,
    title: "Create Categories",
    description: "Create multiple categories for menu items",
    completed: false,
  },
  {
    id: 3,
    title: "Create Items",
    description: "Add multiple menu items to categories",
    completed: false,
  },
  {
    id: 4,
    title: "Create Menu",
    description: "Create the final menu with logo and items",
    completed: false,
  },
];

// Mock data for demonstration

const SuperAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS | Super Admin Dashboard";
  }, []);

  const [activeTab, setActiveTab] = useState("All Admins");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [createdUser, setCreatedUser] = useState(null);
  const [createdCategories, setCreatedCategories] = useState([]);
  const [createdItems, setCreatedItems] = useState([]);
  const [createdMenu, setCreatedMenu] = useState(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminDetailView, setAdminDetailView] = useState("Analytics");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Category management states
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Item management states
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  // Menu management states
  const [editingMenu, setEditingMenu] = useState(null);
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);
  const [isUpdatingMenu, setIsUpdatingMenu] = useState(false);
  const [showAddItemInMenuEdit, setShowAddItemInMenuEdit] = useState(false);
  const [newlyAddedItemId, setNewlyAddedItemId] = useState(null);

  // Voucher management states
  const [isCreateVoucherModalOpen, setIsCreateVoucherModalOpen] =
    useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [showDeleteVoucherModal, setShowDeleteVoucherModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [isDeletingVoucher, setIsDeletingVoucher] = useState(false);
  const [allVouchers, setAllVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [vouchersError, setVouchersError] = useState("");

  // Deal Management State
  const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showDeleteDealModal, setShowDeleteDealModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [isDeletingDeal, setIsDeletingDeal] = useState(false);
  const [allDeals, setAllDeals] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [dealsError, setDealsError] = useState("");

  // State for fetched data from APIs
  const [allAdmins, setAllAdmins] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [adminMenu, setAdminMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);

  // Error states for API calls
  const [adminsError, setAdminsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [itemsError, setItemsError] = useState("");
  const [menuError, setMenuError] = useState("");
  // Add this state to your component
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAdminDropdownOpen && !event.target.closest(".relative")) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdminDropdownOpen]);
  // Analytics states
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminInsightOrders, setAdminInsightOrders] = useState([]);

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingSingleOrder, setIsExportingSingleOrder] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true); // for "Load more" logic

  const [displayedOrdersCount, setDisplayedOrdersCount] = useState(5);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    salesByDate: [],
    recentTransactions: [],
    dealMetrics: {
      totalDealRevenue: 0,
      totalDealsSold: 0,
      totalDealsSavings: 0,
      topDeals: [],
      dealPercentageOfSales: 0,
    },
  });

  const handleStepCompletion = (stepId, data = null) => {
    if (stepId === 1) {
      setCreatedUser(data);
      setCurrentStep(2);
      setCompletedSteps((prev) => [...prev, stepId]);
      // Fetch all admins when user is created
      fetchAllAdmins();
    } else if (stepId === 2) {
      // For categories, append new data to existing categories
      if (data) {
        if (Array.isArray(data)) {
          setCreatedCategories((prev) => [...prev, ...data]);
        } else {
          setCreatedCategories((prev) => [...prev, data]);
        }
      }
      // Don't auto-advance to next step, let user add more categories
      // They can manually proceed to step 3 when ready
    } else if (stepId === 3) {
      // For items, append new data to existing items
      if (data) {
        if (Array.isArray(data)) {
          setCreatedItems((prev) => [...prev, ...data]);
        } else {
          setCreatedItems((prev) => [...prev, data]);
        }
      }
      // Don't auto-advance to next step, let user add more items
      // They can manually proceed to step 4 when ready
    } else if (stepId === 4) {
      setCreatedMenu(data);
      setCurrentStep(5); // Workflow completed
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  // New function to manually advance steps
  const handleManualStepAdvance = (stepId) => {
    if (stepId === 2 && createdCategories.length > 0) {
      setCurrentStep(3);
      setCompletedSteps((prev) => [...prev, stepId]);
    } else if (stepId === 3 && createdItems.length > 0) {
      setCurrentStep(4);
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  // Fetch all admins
  const fetchAllAdmins = async () => {
    setIsLoadingAdmins(true);
    setAdminsError("");
    try {
      const response = await getAllAdmin();
      if (response.data?.success) {
        setAllAdmins(response.data.data || []);
      } else {
        setAdminsError("Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdminsError("Error loading administrators. Please try again.");
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  // Fetch categories for specific admin
  const fetchCategoriesForAdmin = useCallback(async (adminId) => {
    if (!adminId) {
      setAdminCategories([]);
      return;
    }

    setIsLoadingCategories(true);
    setCategoriesError("");
    try {
      const response = await getCategoriesForAdmin(adminId);
      if (response.data?.success) {
        console.log("mera 1", response.data.data);
        setAdminCategories(response.data.data || []);
      } else {
        setCategoriesError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories for admin:", error);
      setCategoriesError("Error loading categories. Please try again.");
      setAdminCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch items for specific admin
  const fetchItemsForAdmin = useCallback(async (adminId) => {
    if (!adminId) {
      setAdminItems([]);
      return;
    }

    setIsLoadingItems(true);
    setItemsError("");
    try {
      const response = await getAllItemsOfAdmin(adminId);
      if (response.data?.success) {
        setAdminItems(response.data.data || []);
      } else {
        setItemsError("Failed to fetch menu items");
      }
    } catch (error) {
      console.error("Error fetching items for admin:", error);
      setItemsError("Error loading menu items. Please try again.");
      setAdminItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  // Fetch menu for specific admin
  const fetchMenuForAdmin = useCallback(async (adminId) => {
    if (!adminId) {
      setAdminMenu(null);
      setMenuItems([]);
      return;
    }

    setIsLoadingMenu(true);
    setMenuError("");
    try {
      const response = await getAllMenuOfAdmin(adminId);
      console.log("Menu fetch response:", response.data);

      if (response.data?.success && response.data.data?.length > 0) {
        const menus = response.data.data; // Get all menus, not just the first one
        setAdminMenu(menus); // Store all menus

        // Collect all items from all menus
        const allItems = [];
        menus.forEach((menu) => {
          if (menu.itemsID && menu.itemsID.length > 0) {
            allItems.push(...menu.itemsID);
          }
        });

        // Also fetch category names for each item
        await fetchMenuItemsWithCategories(allItems);
      } else {
        setAdminMenu(null);
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu for admin:", error);
      setMenuError("Error loading menu. Please try again.");
      setAdminMenu(null);
      setMenuItems([]);
    } finally {
      setIsLoadingMenu(false);
    }
  }, []);

  // Fetch menu items with category information
  const fetchMenuItemsWithCategories = useCallback(async (items) => {
    if (!items || items.length === 0) {
      setMenuItems([]);
      return;
    }

    setIsLoadingMenuItems(true);
    try {
      // Get all categories for the admin to resolve category names
      const categoriesResponse = await getCategoriesForAdmin(items[0].adminId);
      const categories = categoriesResponse.data?.success
        ? categoriesResponse.data.data || []
        : [];

      // Map items with category information
      const itemsWithCategories = items.map((item) => {
        const category = categories.find((cat) => cat._id === item.categoryId);
        return {
          ...item,
          categoryId: category || { name: "Unknown Category" },
        };
      });

      setMenuItems(itemsWithCategories);
    } catch (error) {
      console.error("Error fetching category information:", error);
      // Still set the items even if category fetch fails
      setMenuItems(items);
    } finally {
      setIsLoadingMenuItems(false);
    }
  }, []);

  const handleLoadMore = () => {
    if (hasMoreOrders) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchOrders(nextPage);
    }
  };

  // ✅ Automatically fetch analytics when Insights is selected
  useEffect(() => {
    if (adminDetailView === "Insights" && selectedAdmin?._id) {
      fetchAnalytics(selectedAdmin._id);
      console.log("zakir khan", selectedAdmin._id);
    }
    console.log("fchgddhsfn");
  }, [adminDetailView, selectedAdmin?._id]);

  const fetchOrdersAndAnalytics = useCallback(
    async (adminId) => {
      if (!adminId) {
        setAdminOrders([]);
        setAnalyticsData({
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          salesByDate: [],
          recentTransactions: [],
        });
        return;
      }

      setIsLoadingOrders(true);
      setOrdersError("");

      try {
        const page = currentPage || 1;
        const limit = 10;
        const selectedDated = selectedDate || null;

        const response = await getOrdersByAdmin(
          adminId,
          page,
          limit,
          selectedDated
        );
        console.log("Orders fetch response:", response.data);

        if (response.data?.success) {
          const orders = response.data.data || [];
          const hasMore = response.data.hasMore ?? false;

          console.log("Processing orders count:", orders.length);

          // ✅ Validate and filter orders
          const validOrders = orders.filter((order) => {
            if (!order) return false;
            if (typeof order.totalAmount !== "number" && !order.totalAmount) {
              console.warn("Order missing totalAmount:", order._id);
            }
            return true;
          });

          // ✅ Sort by most recent first
          const sortedOrders = validOrders.sort((a, b) => {
            const dateA = new Date(a.createdAt || new Date());
            const dateB = new Date(b.createdAt || new Date());
            return dateB.getTime() - dateA.getTime();
          });

          // ✅ Append or replace orders depending on page
          setAdminOrders((prevOrders) =>
            page === 1 ? sortedOrders : [...prevOrders, ...sortedOrders]
          );

          // ✅ Update pagination state
          setHasMoreOrders(hasMore);

          // ✅ Calculate analytics only from *all* loaded orders
          const allOrders =
            page === 1 ? sortedOrders : [...adminOrders, ...sortedOrders];

          const analytics = calculateAnalytics(allOrders);
          setAnalyticsData(analytics);
        } else {
          throw new Error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders for admin:", error);
        setOrdersError("Error loading orders data. Please try again.");
        setAdminOrders([]);
        setAnalyticsData({
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          salesByDate: [],
          recentTransactions: [],
        });
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [selectedDate, currentPage] // ✅ re-run when date or page changes
  );

  const fetchAnalytics = useCallback(async (adminId) => {
    if (!adminId) {
      setAdminInsightOrders([]);
      setAnalyticsData({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        salesByDate: [],
        recentTransactions: [],
      });
      return;
    }

    setIsLoadingAnalytics(true);
    setOrdersError("");
    try {
      const response = await getAnalyticsByAdmin(adminId);
      console.log("Orders fetch response:", response.data);
      if (response.data?.success) {
        const orders = response.data.data || [];
        console.log("Processing orders count:", orders.length);
        console.log("Processing orders :", response.data.data);

        // Validate orders data
        const validOrders = orders.filter((order) => {
          if (!order) return false;
          // Check if essential fields exist
          if (typeof order.totalAmount !== "number" && !order.totalAmount) {
            console.warn("Order missing totalAmount:", order._id);
          }
          return true;
        });

        // Sort orders by most recent first (recent order manner)
        const sortedOrders = validOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || new Date());
          const dateB = new Date(b.createdAt || new Date());
          return dateB.getTime() - dateA.getTime(); // Most recent first
        });

        setAdminInsightOrders(sortedOrders);

        // Calculate analytics from sorted orders
        const analytics = calculateAnalytics(sortedOrders);
        console.log("Calculated analytics:", analytics);
        setAnalyticsData(analytics);
      } else {
        setOrdersError("Failed to fetch orders");
        setAdminInsightOrders([]);
        setAnalyticsData({
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          salesByDate: [],
          recentTransactions: [],
        });
      }
    } catch (error) {
      console.error("Error fetching orders for admin:", error);
      setOrdersError("Error loading orders data. Please try again.");
      setAdminInsightOrders([]);
      setAnalyticsData({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        salesByDate: [],
        recentTransactions: [],
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  // Calculate analytics from orders data
  const calculateAnalytics = (orders) => {
    console.log("Starting analytics calculation with orders:", orders.length);

    if (!orders || orders.length === 0) {
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        salesByDate: [],
        recentTransactions: [],
      };
    }

    // Calculate total sales and orders using the same method as PrintReceiptsModal
    let totalSales = 0;
    orders.forEach((order) => {
      let orderTotal = 0;

      // Calculate items total
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const basePrice =
            item.basePrice || item.originalPrice || item.price || 0;
          const options = item.options || [];
          const optionsPrice = options.reduce(
            (sum, opt) => sum + (opt.price || 0),
            0
          );
          const discount = item.discount || item.itemDiscount || 0;
          const quantity = item.quantity || 1;

          const paymentMethod =
            order.paymentMethod || order.paymentType || "CASH";
          const taxRates = item.tax || { card: "0", cash: "0" };
          const taxRate =
            paymentMethod === "CARD"
              ? parseFloat(taxRates.card || "0")
              : parseFloat(taxRates.cash || "0");

          const originalAmount = basePrice + optionsPrice;
          const taxAmount = (originalAmount * taxRate) / 100;
          const finalPrice = originalAmount - discount + taxAmount;

          orderTotal += finalPrice * quantity;
        });
      }

      // Add deals total
      if (order.deals && order.deals.length > 0) {
        order.deals.forEach((deal) => {
          const dealPrice = parseFloat(deal.dealPrice) || 0;
          const quantity = parseInt(deal.quantity) || 1;
          orderTotal += dealPrice * quantity;
        });
      }

      // Subtract voucher discount and add to total sales
      totalSales += orderTotal - (order.voucherDiscount || 0);
    });

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    console.log("Basic stats:", { totalSales, totalOrders, averageOrderValue });

    // Get recent transactions (last 10)
    const recentTransactions = orders
      .filter((order) => {
        // Filter out orders with invalid dates
        if (!order.createdAt) return false;
        const date = new Date(order.createdAt);
        return !isNaN(date.getTime());
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10)
      .map((order) => ({
        id: order._id,
        date: order.createdAt,
        amount: parseFloat(order.totalAmount) || 0,
        customer: order.customerInfo?.name || "Walk-in Customer",
        items: order.items?.length || 0,
      }));

    // Calculate sales by date (last 30 days)
    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push({
        date: date.toISOString().split("T")[0],
        sales: 0,
        orders: 0,
      });
    }

    // orders.forEach((order) => {
    //   try {
    //     // Validate and parse the order date
    //     if (order.endOfDayClosedData) {
    //       const orderDate = new Date(order.endOfDayClosedData);
    //       // Check if date is valid
    //       if (!isNaN(orderDate.getTime())) {
    //         const orderDateString = orderDate.toISOString().split("T")[0];
    //         const dayIndex = last30Days.findIndex(
    //           (day) => day.date === orderDateString
    //         );
    //         if (dayIndex !== -1) {
    //           let orderTotal = 0;
    //           if (order.items && order.items.length > 0) {
    //             order.items.forEach((item) => {
    //               const basePrice =
    //                 item.basePrice || item.originalPrice || item.price || 0;
    //               const options = item.options || [];
    //               const optionsPrice = options.reduce(
    //                 (sum, opt) => sum + (opt.price || 0),
    //                 0
    //               );
    //               const discount = item.discount || item.itemDiscount || 0;
    //               const quantity = item.quantity || 1;

    //               const paymentMethod =
    //                 order.paymentMethod || order.paymentType || "CASH";
    //               const taxRates = item.tax || { card: "0", cash: "0" };
    //               const taxRate =
    //                 paymentMethod === "CARD"
    //                   ? parseFloat(taxRates.card || "0")
    //                   : parseFloat(taxRates.cash || "0");

    //               const originalAmount = basePrice + optionsPrice;
    //               const taxAmount = (originalAmount * taxRate) / 100;
    //               const finalPrice = originalAmount - discount + taxAmount;

    //               orderTotal += finalPrice * quantity;
    //             });
    //           }
    //                                  orderTotal = order.totalAmount

    //           const finalAmount = orderTotal - (order.voucherDiscount || 0);
    //           console.log("value point data" , finalAmount)
    //           last30Days[dayIndex].sales += finalAmount;
    //           last30Days[dayIndex].orders += 1;
    //         }
    //       }
    //     }
    //   } catch (dateError) {
    //     console.warn(
    //       "Invalid date found in order:",
    //       order._id,
    //       order.endOfDayClosedData
    //     );
    //   }
    // });

    // Calculate top selling items
    const itemCounts = {};
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          try {
            const itemName = item.name || "Unknown Item";
            const quantity = parseInt(item.quantity) || 1;
            const price = parseFloat(item.price) || 0;

            if (!itemCounts[itemName]) {
              itemCounts[itemName] = {
                name: itemName,
                quantity: 0,
                totalRevenue: 0,
              };
            }
            itemCounts[itemName].quantity += quantity;
            itemCounts[itemName].totalRevenue += price * quantity;
          } catch (itemError) {
            console.warn("Error processing item:", item, itemError);
          }
        });
      }
    });

    const topSellingItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    console.log("Top selling items:", topSellingItems);

    // Calculate deal analytics
    let totalDealRevenue = 0;
    let totalDealsSold = 0;
    let totalDealsSavings = 0;
    const dealCounts = {};

    orders.forEach((order) => {
      if (order.deals && Array.isArray(order.deals)) {
        order.deals.forEach((deal) => {
          try {
            const dealName = deal.name || "Unknown Deal";
            const quantity = parseInt(deal.quantity) || 1;
            const dealPrice = parseFloat(deal.dealPrice) || 0;
            const originalPrice = parseFloat(deal.originalPrice) || 0;
            const savings = (originalPrice - dealPrice) * quantity;

            totalDealRevenue += dealPrice * quantity;
            totalDealsSold += quantity;
            totalDealsSavings += savings;

            if (!dealCounts[dealName]) {
              dealCounts[dealName] = {
                name: dealName,
                quantity: 0,
                totalRevenue: 0,
                totalSavings: 0,
              };
            }
            dealCounts[dealName].quantity += quantity;
            dealCounts[dealName].totalRevenue += dealPrice * quantity;
            dealCounts[dealName].totalSavings += savings;
          } catch (dealError) {
            console.warn("Error processing deal:", deal, dealError);
          }
        });
      }
    });

    const topDeals = Object.values(dealCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    console.log("Deal analytics:", {
      totalDealRevenue,
      totalDealsSold,
      totalDealsSavings,
      topDeals,
    });

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topSellingItems,
      salesByDate: last30Days,
      recentTransactions,
      // Deal analytics
      dealMetrics: {
        totalDealRevenue,
        totalDealsSold,
        totalDealsSavings,
        topDeals,
        dealPercentageOfSales:
          totalSales > 0 ? (totalDealRevenue / totalSales) * 100 : 0,
      },
    };
  };

  // const fetchAnalytics = useCallback(
  //   async (adminId) => {
  //     if (!adminId) {
  //       setAnalyticsData({
  //         totalSales: 0,
  //         totalOrders: 0,
  //         averageOrderValue: 0,
  //         topSellingItems: [],
  //         salesByDate: [],
  //         recentTransactions: [],
  //         dealMetrics: {},
  //       });
  //       return;
  //     }
  //     console.log("djgj we are me");

  //     setIsLoadingAnalytics(true);
  //     // setOrdersError("");

  //     try {
  //       const selectedDated = selectedDate || null;
  //       const response = await getAnalyticsByAdmin(adminId);

  //       console.log("Analytics fetch response:", response.data);

  //       if (response.data?.success) {
  //         const analytics = response.data.data;

  //         // ✅ Ensure safe structure before setting
  //         setAnalyticsData({
  //           totalSales: analytics.totalSales || 0,
  //           totalOrders: analytics.totalOrders || 0,
  //           averageOrderValue: analytics.averageOrderValue || 0,
  //           topSellingItems: analytics.topSellingItems || [],
  //           salesByDate: analytics.salesByDate || [],
  //           recentTransactions: analytics.recentTransactions || [],
  //           dealMetrics: analytics.dealMetrics || {},
  //         });
  //       } else {
  //         throw new Error("Failed to fetch analytics");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching analytics for admin:", error);
  //       setOrdersError("Error loading analytics data. Please try again.");
  //       setAnalyticsData({
  //         totalSales: 0,
  //         totalOrders: 0,
  //         averageOrderValue: 0,
  //         topSellingItems: [],
  //         salesByDate: [],
  //         recentTransactions: [],
  //         dealMetrics: {},
  //       });
  //     } finally {
  //       setIsLoadingAnalytics(false);
  //     }
  //     console.log("me4", adminId);
  //   },
  //   [selectedDate] // ✅ re-run when date changes
  // );

  // Handle Excel export
  const handleExportToExcel = async (adminId) => {
    try {
      setIsExportingExcel(true);
      const response = await exportOrdersToExcel(adminId);
      if (response.data?.success) {
        const excelData = response.data.data;

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = [
          { wch: 12 }, // Order ID
          { wch: 12 }, // Order Date
          { wch: 12 }, // Order Time
          { wch: 12 }, // Order Type
          { wch: 15 }, // Order Status
          { wch: 15 }, // Payment Status
          { wch: 15 }, // Payment Method
          { wch: 20 }, // Customer Name
          { wch: 15 }, // Customer Phone
          { wch: 30 }, // Customer Address
          { wch: 12 }, // Table Number
          { wch: 12 }, // Total Amount
          { wch: 10 }, // Total Tax
          { wch: 15 }, // Voucher Code
          { wch: 15 }, // Voucher Discount
          { wch: 12 }, // Total Items
          { wch: 25 }, // Item Name
          { wch: 12 }, // Item Quantity
          { wch: 12 }, // Item Price
          { wch: 12 }, // Item Total
          { wch: 20 }, // Menu Name
          { wch: 15 }, // Category
          { wch: 20 }, // Item Notes
        ];
        worksheet["!cols"] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Generate filename
        const filename = `orders_${selectedAdmin.email}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;

        // Download file
        XLSX.writeFile(workbook, filename);

        console.log("Excel export completed successfully");
      } else {
        console.error("Failed to export orders:", response.data?.message);
        alert("Failed to export orders. Please try again.");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Error exporting orders. Please try again.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handle Excel export for a single order
  const handleExportSingleOrder = async (order) => {
    try {
      setIsExportingSingleOrder(true);

      // Calculate order totals
      let totalOriginalAmount = 0;
      let totalItemDiscount = 0;
      let totalTaxAmount = 0;
      let totalFinalAmount = 0;
      let totalBasePrice = 0;
      let totalOptionsPrice = 0;

      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const basePrice =
            item.basePrice || item.originalPrice || item.price || 0;
          const options = item.options || [];
          const optionsPrice = options.reduce(
            (sum, opt) => sum + (opt.price || 0),
            0
          );
          const discount = item.discount || item.itemDiscount || 0;
          const quantity = item.quantity || 1;

          // Determine tax rate based on payment method
          const paymentMethod =
            order.paymentMethod || order.paymentType || "CASH";
          const taxRates = item.tax || { card: "0", cash: "0" };
          const taxRate =
            paymentMethod === "CARD"
              ? parseFloat(taxRates.card || "0")
              : parseFloat(taxRates.cash || "0");

          // Calculate amounts
          const originalAmount = basePrice + optionsPrice;
          const taxAmount = (originalAmount * taxRate) / 100;
          const finalPrice = originalAmount - discount + taxAmount;

          totalOriginalAmount += originalAmount * quantity;
          totalItemDiscount += discount * quantity;
          totalTaxAmount += taxAmount * quantity;
          totalFinalAmount += finalPrice * quantity;
          totalBasePrice += basePrice * quantity;
          totalOptionsPrice += optionsPrice * quantity;
        });
      }

      const voucherDiscount = order.voucherDiscount || 0;
      const finalOrderTotal = totalFinalAmount - voucherDiscount;

      // Format date and time
      const orderDateTime = order.createdAt
        ? new Date(order.createdAt)
        : new Date();
      const formattedDate = !isNaN(orderDateTime.getTime())
        ? orderDateTime.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "N/A";
      const formattedTime = !isNaN(orderDateTime.getTime())
        ? orderDateTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A";

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Create multiple worksheets for better organization

      // === WORKSHEET 1: ORDER SUMMARY ===
      const summaryData = [
        ["🍽️ ORDER DETAILS REPORT", "", "", ""],
        [
          "Generated on:",
          new Date().toLocaleDateString("en-GB"),
          new Date().toLocaleTimeString("en-US"),
          "",
        ],
        ["", "", "", ""],
        ["📋 ORDER INFORMATION", "", "", ""],
        [
          "Order ID:",
          order._id ? String(order._id).slice(-8).toUpperCase() : "N/A",
          "",
          "",
        ],
        ["Order Type:", order.orderType || "DINE", "", ""],
        ["Order Status:", order.orderStatus || "COMPLETED", "", ""],
        ["Order Date:", formattedDate, "", ""],
        ["Order Time:", formattedTime, "", ""],
        [
          "Payment Method:",
          order.paymentMethod || order.paymentType || "CASH",
          "",
          "",
        ],
        ["", "", "", ""],
        ["📊 FINANCIAL SUMMARY", "", "", ""],
        ["Total Items:", order.items?.length || 0, "", ""],
        ["Base Price Total:", `Rs ${totalBasePrice.toFixed(2)}`, "", ""],
        ["Options Price Total:", `Rs ${totalOptionsPrice.toFixed(2)}`, "", ""],
        [
          "Gross Total:",
          `Rs ${(totalBasePrice + totalOptionsPrice).toFixed(2)}`,
          "",
          "",
        ],
        ["Item Discounts:", `Rs ${totalItemDiscount.toFixed(2)}`, "", ""],
        ["Tax Amount:", `Rs ${totalTaxAmount.toFixed(2)}`, "", ""],
        ["Voucher Discount:", `Rs ${voucherDiscount.toFixed(2)}`, "", ""],
        ["", "", "", ""],
        ["💰 FINAL TOTAL:", `Rs ${finalOrderTotal.toFixed(2)}`, "", ""],
        [
          "Total Savings:",
          `Rs ${(totalItemDiscount + voucherDiscount).toFixed(2)}`,
          "",
          "",
        ],
      ];

      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Style the summary worksheet
      summaryWorksheet["!cols"] = [
        { wch: 25 }, // Labels
        { wch: 20 }, // Values
        { wch: 15 }, // Extra space
        { wch: 15 }, // Extra space
      ];

      // === WORKSHEET 2: ITEMS BREAKDOWN ===
      const itemsData = [
        ["🛍️ ITEMS BREAKDOWN", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", ""],
        [
          "#",
          "Item Name",
          "Category",
          "Menu",
          "Qty",
          "Base Price",
          "Options",
          "Options Price",
          "Discount",
          "Tax Rate",
          "Tax Amount",
          "Subtotal",
        ],
      ];

      // Add individual items
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          const basePrice =
            item.basePrice || item.originalPrice || item.price || 0;
          const options = item.options || [];
          const optionsPrice = options.reduce(
            (sum, opt) => sum + (opt.price || 0),
            0
          );
          const discount = item.discount || item.itemDiscount || 0;
          const quantity = item.quantity || 1;

          // Calculate tax
          const paymentMethod =
            order.paymentMethod || order.paymentType || "CASH";
          const taxRates = item.tax || { card: "0", cash: "0" };
          const taxRate =
            paymentMethod === "CARD"
              ? parseFloat(taxRates.card || "0")
              : parseFloat(taxRates.cash || "0");
          const originalAmount = basePrice + optionsPrice;
          const taxAmount = (originalAmount * taxRate) / 100;
          const finalPrice = originalAmount - discount + taxAmount;

          // Format options for display
          const optionsText =
            options.length > 0
              ? options.map((opt) => `${opt.name} (+Rs${opt.price})`).join(", ")
              : "None";

          itemsData.push([
            index + 1,
            item.name || "Unknown Item",
            item.categoryName || "General",
            item.menuName || "General Items",
            quantity,
            `Rs ${basePrice.toFixed(2)}`,
            optionsText,
            `Rs ${optionsPrice.toFixed(2)}`,
            `Rs ${discount.toFixed(2)}`,
            `${taxRate}%`,
            `Rs ${taxAmount.toFixed(2)}`,
            `Rs ${(finalPrice * quantity).toFixed(2)}`,
          ]);
        });
      }

      // Add totals row
      itemsData.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
      itemsData.push([
        "",
        "TOTALS",
        "",
        "",
        order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,
        `Rs ${totalBasePrice.toFixed(2)}`,
        "",
        `Rs ${totalOptionsPrice.toFixed(2)}`,
        `Rs ${totalItemDiscount.toFixed(2)}`,
        "",
        `Rs ${totalTaxAmount.toFixed(2)}`,
        `Rs ${totalFinalAmount.toFixed(2)}`,
      ]);

      const itemsWorksheet = XLSX.utils.aoa_to_sheet(itemsData);

      // Style the items worksheet
      itemsWorksheet["!cols"] = [
        { wch: 5 }, // #
        { wch: 25 }, // Item Name
        { wch: 15 }, // Category
        { wch: 20 }, // Menu
        { wch: 8 }, // Qty
        { wch: 12 }, // Base Price
        { wch: 35 }, // Options
        { wch: 15 }, // Options Price
        { wch: 12 }, // Discount
        { wch: 10 }, // Tax Rate
        { wch: 12 }, // Tax Amount
        { wch: 15 }, // Subtotal
      ];

      // === WORKSHEET 3: CALCULATION BREAKDOWN ===
      const calculationData = [
        ["🧮 CALCULATION BREAKDOWN", "", ""],
        ["", "", ""],
        ["Step", "Description", "Amount"],
        ["1", "Base Price Total", `Rs ${totalBasePrice.toFixed(2)}`],
        ["2", "Add: Options Price", `Rs ${totalOptionsPrice.toFixed(2)}`],
        [
          "3",
          "Gross Amount",
          `Rs ${(totalBasePrice + totalOptionsPrice).toFixed(2)}`,
        ],
        ["4", "Less: Item Discounts", `Rs ${totalItemDiscount.toFixed(2)}`],
        [
          "5",
          "Amount After Discounts",
          `Rs ${(
            totalBasePrice +
            totalOptionsPrice -
            totalItemDiscount
          ).toFixed(2)}`,
        ],
        ["6", "Add: Tax Amount", `Rs ${totalTaxAmount.toFixed(2)}`],
        ["7", "Subtotal", `Rs ${totalFinalAmount.toFixed(2)}`],
        ["8", "Less: Voucher Discount", `Rs ${voucherDiscount.toFixed(2)}`],
        ["", "", ""],
        ["💰", "FINAL TOTAL", `Rs ${finalOrderTotal.toFixed(2)}`],
        ["", "", ""],
        [
          "📈",
          "Total Savings",
          `Rs ${(totalItemDiscount + voucherDiscount).toFixed(2)}`,
        ],
        ["", "", ""],
        ["📊 PAYMENT BREAKDOWN", "", ""],
        [
          "Payment Method:",
          order.paymentMethod || order.paymentType || "CASH",
          "",
        ],
        ["Payment Status:", order.paymentStatus || "COMPLETED", ""],
        ["Order Status:", order.orderStatus || "COMPLETED", ""],
      ];

      const calculationWorksheet = XLSX.utils.aoa_to_sheet(calculationData);

      // Style the calculation worksheet
      calculationWorksheet["!cols"] = [
        { wch: 15 }, // Step
        { wch: 30 }, // Description
        { wch: 20 }, // Amount
      ];

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Order Summary");
      XLSX.utils.book_append_sheet(workbook, itemsWorksheet, "Items Details");
      XLSX.utils.book_append_sheet(
        workbook,
        calculationWorksheet,
        "Calculations"
      );

      // Generate filename with timestamp
      const orderId = order._id
        ? String(order._id).slice(-8).toUpperCase()
        : "ORDER";
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .split("T")[0];
      const filename = `Order_${orderId}_Details_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      console.log("Enhanced single order Excel export completed successfully");
    } catch (error) {
      console.error("Error exporting single order:", error);
      alert("Error exporting order details. Please try again.");
    } finally {
      setIsExportingSingleOrder(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    fetchAllAdmins();
  }, []);

  // Fetch data when switching to All Admins tab
  useEffect(() => {
    if (activeTab === "All Admins") {
      fetchAllAdmins();
    }
  }, [activeTab]);

  // Fetch categories and items when an admin is selected
  useEffect(() => {
    if (selectedAdmin && selectedAdmin._id) {
      fetchCategoriesForAdmin(selectedAdmin._id);
      fetchItemsForAdmin(selectedAdmin._id);
      fetchMenuForAdmin(selectedAdmin._id);
      fetchOrdersAndAnalytics(selectedAdmin._id);
    }
  }, [
    selectedAdmin,
    fetchCategoriesForAdmin,
    fetchItemsForAdmin,
    fetchMenuForAdmin,
    fetchOrdersAndAnalytics,
  ]);

  // Simple modal handlers - actual form logic is in the modal components
  const handleCloseUserModal = useCallback(() => {
    setIsCreateUserModalOpen(false);
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    setIsCreateCategoryModalOpen(false);
  }, []);

  const handleCloseItemModal = useCallback(() => {
    setIsCreateItemModalOpen(false);
  }, []);

  const handleCloseMenuModal = useCallback(() => {
    setIsCreateMenuModalOpen(false);
  }, []);

  // Category management handlers
  const handleDeleteCategory = useCallback(async (adminId, categoryId) => {
    setIsDeletingCategory(true);
    try {
      const response = await deleteCategory(adminId, categoryId);
      if (response.data?.success) {
        // Refresh categories for the admin
        await fetchCategoriesForAdmin(adminId);
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setCategoriesError("Failed to delete category. Please try again.");
    } finally {
      setIsDeletingCategory(false);
    }
  }, []);

  const handleUpdateCategory = useCallback(
    async (newName) => {
      if (!editingCategory || !newName || newName.trim() === "") return;

      setIsUpdatingCategory(true);
      try {
        const response = await updateCategory(
          selectedAdmin._id,
          editingCategory._id,
          { name: newName.trim() }
        );
        if (response.data?.success) {
          // Refresh categories for the admin
          await fetchCategoriesForAdmin(selectedAdmin._id);
          setEditingCategory(null);
        }
      } catch (error) {
        console.error("Error updating category:", error);
        setCategoriesError("Failed to update category. Please try again.");
      } finally {
        setIsUpdatingCategory(false);
      }
    },
    [editingCategory, selectedAdmin, fetchCategoriesForAdmin]
  );

  const handleEditCategoryClick = useCallback((category) => {
    setEditingCategory({ ...category });
  }, []);

  const handleDeleteCategoryClick = useCallback((category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  }, []);

  const handleEditCategoryNameChange = useCallback((e) => {
    setEditingCategory((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCategory(null);
  }, []);

  // Separate component for category row to prevent re-renders
  const CategoryRow = React.memo(({ category }) => {
    const isEditing = editingCategory && editingCategory._id === category._id;

    return (
      <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={editingCategory.name}
                onChange={handleEditCategoryNameChange}
                disabled={isUpdatingCategory}
                className="flex-1 p-2 bg-[#262626] text-[#f5f5f5] rounded border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50"
                placeholder="Category name"
                autoFocus
              />
              <button
                onClick={() => handleUpdateCategory(editingCategory.name)}
                disabled={isUpdatingCategory || !editingCategory.name.trim()}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  isUpdatingCategory || !editingCategory.name.trim()
                    ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isUpdatingCategory ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdatingCategory}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  isUpdatingCategory
                    ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                    : "bg-[#404040] hover:bg-[#505050] text-[#f5f5f5]"
                }`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <h4 className="text-[#f5f5f5] font-medium">{category.name}</h4>
              <p className="text-[#a0a0a0] text-sm">
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
              Active
            </span>
            <button
              onClick={() => handleEditCategoryClick(category)}
              className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#10b981]"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => handleDeleteCategoryClick(category)}
              className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#ef4444]"
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}
      </div>
    );
  });

  // Item management handlers
  const handleDeleteItem = useCallback(async (adminId, itemId) => {
    setIsDeletingItem(true);
    try {
      const response = await deleteItem(adminId, itemId);
      if (response.data?.success) {
        // Refresh items for the admin
        await fetchItemsForAdmin(adminId);
        // Also refresh menu to update item counts
        await fetchMenuForAdmin(adminId);
        setShowDeleteItemModal(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setItemsError("Failed to delete item. Please try again.");
    } finally {
      setIsDeletingItem(false);
    }
  }, []);

  const handleUpdateItem = useCallback(
    async (itemData) => {
      if (!editingItem || !itemData.name || itemData.name.trim() === "") return;
      if (!itemData.price || isNaN(parseFloat(itemData.price))) return;

      setIsUpdatingItem(true);
      try {
        const response = await updateItem(selectedAdmin._id, editingItem._id, {
          name: itemData.name.trim(),
          price: parseFloat(itemData.price),
          description: itemData.description?.trim() || "",
          pictureURL: editingItem.pictureURL,
          categoryId: editingItem.categoryId,
          options: itemData.options || [],
        });
        if (response.data?.success) {
          // Refresh items for the admin
          await fetchItemsForAdmin(selectedAdmin._id);
          // Also refresh menu to update item data
          await fetchMenuForAdmin(selectedAdmin._id);
          setEditingItem(null);
        }
      } catch (error) {
        console.error("Error updating item:", error);
        setItemsError("Failed to update item. Please try again.");
      } finally {
        setIsUpdatingItem(false);
      }
    },
    [editingItem, selectedAdmin, fetchItemsForAdmin, fetchMenuForAdmin]
  );

  const handleEditItemClick = useCallback((item) => {
    setEditingItem({ ...item });
  }, []);

  const handleDeleteItemClick = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteItemModal(true);
  }, []);

  const handleCancelItemEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  // Menu management handlers
  const handleDeleteMenu = useCallback(async (adminId, menuId) => {
    setIsDeletingMenu(true);
    try {
      const response = await deleteMenu(adminId, menuId);
      if (response.data?.success) {
        // Refresh menu for the admin
        await fetchMenuForAdmin(adminId);
        setShowDeleteMenuModal(false);
        setMenuToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      setMenuError("Failed to delete menu. Please try again.");
    } finally {
      setIsDeletingMenu(false);
    }
  }, []);

  const handleUpdateMenu = useCallback(
    async (menuData, logoFile = null) => {
      if (!menuData.name || menuData.name.trim() === "") return;
      if (!menuData._id) {
        console.error("Menu ID is missing:", menuData);
        setMenuError("Menu ID is missing. Cannot update menu.");
        return;
      }

      console.log("handleUpdateMenu called with:", { menuData, logoFile });
      console.log("menuData._id:", menuData._id);
      console.log("selectedAdmin._id:", selectedAdmin?._id);

      setIsUpdatingMenu(true);
      try {
        let requestData;

        // If a new logo is provided, use FormData
        if (logoFile) {
          const formData = new FormData();
          formData.append("name", menuData.name.trim());
          formData.append("description", menuData.description?.trim() || "");
          formData.append("itemsID", JSON.stringify(menuData.itemsID || []));
          formData.append("logo", logoFile);
          requestData = formData;
        } else {
          // If no new logo, use JSON data
          requestData = {
            name: menuData.name.trim(),
            description: menuData.description?.trim() || "",
            pictureURL: menuData.pictureURL,
            itemsID: menuData.itemsID || [],
          };
        }

        // Use selectedAdmin._id instead of menuData.adminId to ensure we have a valid adminId
        const adminId = selectedAdmin?._id || menuData.adminId;

        if (!adminId) {
          console.error("Admin ID is missing");
          setMenuError("Admin ID is missing. Cannot update menu.");
          return;
        }

        console.log("About to call updateMenu with:", {
          adminId,
          menuId: menuData._id,
          requestData,
        });

        const response = await updateMenu(adminId, menuData._id, requestData);
        if (response.data?.success) {
          // Refresh menu for the admin
          await fetchMenuForAdmin(adminId);
          setEditingMenu(null);
          setNewlyAddedItemId(null);
        }
      } catch (error) {
        console.error("Error updating menu:", error);
        setMenuError("Failed to update menu. Please try again.");
      } finally {
        setIsUpdatingMenu(false);
      }
    },
    [selectedAdmin, fetchMenuForAdmin]
  );

  const handleItemRemovedFromMenu = useCallback(
    async (removedItem, updatedMenu) => {
      console.log("Item removed from menu:", removedItem.name);

      // Refresh the menu data for the admin to sync with backend
      if (selectedAdmin?._id) {
        await fetchMenuForAdmin(selectedAdmin._id);
      }

      // Update the editing menu state with the new data
      if (updatedMenu) {
        setEditingMenu(updatedMenu);
      }
    },
    [selectedAdmin, fetchMenuForAdmin]
  );

  // ===============================
  // VOUCHER MANAGEMENT FUNCTIONS
  // ===============================

  const fetchAllVouchers = useCallback(async () => {
    setIsLoadingVouchers(true);
    setVouchersError("");

    try {
      const response = await getAllVouchers();
      if (response.data?.success) {
        setAllVouchers(response.data.data || []);
      } else {
        setAllVouchers([]);
        setVouchersError("Failed to load vouchers");
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setAllVouchers([]);
      if (error.response?.status === 404) {
        setVouchersError("No vouchers found");
      } else {
        setVouchersError("Failed to load vouchers");
      }
    } finally {
      setIsLoadingVouchers(false);
    }
  }, []);

  // Fetch vouchers for specific admin
  const fetchVouchersForAdmin = useCallback(async (adminId) => {
    if (!adminId) {
      setAllVouchers([]);
      return;
    }

    setIsLoadingVouchers(true);
    setVouchersError("");

    try {
      const response = await getVouchersByAdmin(adminId);
      if (response.data?.success) {
        setAllVouchers(response.data.data || []);
      } else {
        setAllVouchers([]);
        setVouchersError("Failed to load vouchers for this admin");
      }
    } catch (error) {
      console.error("Error fetching vouchers for admin:", error);
      setAllVouchers([]);
      if (error.response?.status === 404) {
        setVouchersError("No vouchers found for this admin");
      } else {
        setVouchersError("Failed to load vouchers for this admin");
      }
    } finally {
      setIsLoadingVouchers(false);
    }
  }, []);

  const handleCreateVoucher = useCallback(() => {
    setIsCreateVoucherModalOpen(true);
  }, []);

  const handleVoucherCreated = useCallback(() => {
    // Refresh vouchers list based on context
    if (selectedAdmin && adminDetailView === "Vouchers") {
      fetchVouchersForAdmin(selectedAdmin._id);
    } else {
      fetchAllVouchers();
    }
    setIsCreateVoucherModalOpen(false);
  }, [fetchAllVouchers, fetchVouchersForAdmin, selectedAdmin, adminDetailView]);

  const handleEditVoucher = useCallback((voucher) => {
    setEditingVoucher(voucher);
  }, []);

  const handleVoucherUpdated = useCallback(() => {
    // Refresh vouchers list based on context
    if (selectedAdmin && adminDetailView === "Vouchers") {
      fetchVouchersForAdmin(selectedAdmin._id);
    } else {
      fetchAllVouchers();
    }
    setEditingVoucher(null);
  }, [fetchAllVouchers, fetchVouchersForAdmin, selectedAdmin, adminDetailView]);

  const handleDeleteVoucherClick = useCallback((voucher) => {
    setVoucherToDelete(voucher);
    setShowDeleteVoucherModal(true);
  }, []);

  const handleDeleteVoucher = useCallback(async () => {
    if (!voucherToDelete) return;

    setIsDeletingVoucher(true);
    try {
      const response = await deleteVoucher({ voucherId: voucherToDelete._id });
      if (response.data?.success) {
        // Refresh vouchers list based on context
        if (selectedAdmin && adminDetailView === "Vouchers") {
          await fetchVouchersForAdmin(selectedAdmin._id);
        } else {
          await fetchAllVouchers();
        }
        setShowDeleteVoucherModal(false);
        setVoucherToDelete(null);
      } else {
        console.error("Failed to delete voucher");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
    } finally {
      setIsDeletingVoucher(false);
    }
  }, [
    voucherToDelete,
    fetchAllVouchers,
    fetchVouchersForAdmin,
    selectedAdmin,
    adminDetailView,
  ]);

  const handleCancelDeleteVoucher = useCallback(() => {
    setShowDeleteVoucherModal(false);
    setVoucherToDelete(null);
  }, []);

  // Deal Management Functions
  const fetchDealsForAdmin = useCallback(async (adminId) => {
    if (!adminId) {
      setAllDeals([]);
      return;
    }

    setIsLoadingDeals(true);
    setDealsError("");

    try {
      const response = await getDealsByAdmin(adminId);
      if (response.data?.success) {
        setAllDeals(response.data.data || []);
      } else {
        setAllDeals([]);
        setDealsError("Failed to load deals for this admin");
      }
    } catch (error) {
      console.error("Error fetching deals for admin:", error);
      setAllDeals([]);
      if (error.response?.status === 404) {
        setDealsError("No deals found for this admin");
      } else {
        setDealsError("Failed to load deals for this admin");
      }
    } finally {
      setIsLoadingDeals(false);
    }
  }, []);

  const handleCreateDeal = useCallback(() => {
    setIsCreateDealModalOpen(true);
  }, []);

  const handleDealCreated = useCallback(
    (newDeal) => {
      // Refresh deals list
      if (selectedAdmin && adminDetailView === "Deals") {
        fetchDealsForAdmin(selectedAdmin._id);
      }
      setIsCreateDealModalOpen(false);
    },
    [fetchDealsForAdmin, selectedAdmin, adminDetailView]
  );

  const handleDealUpdated = useCallback(
    (updatedDeal) => {
      // Refresh deals list
      if (selectedAdmin && adminDetailView === "Deals") {
        fetchDealsForAdmin(selectedAdmin._id);
      }
      setEditingDeal(null);
    },
    [fetchDealsForAdmin, selectedAdmin, adminDetailView]
  );

  const handleEditDeal = useCallback((deal) => {
    setEditingDeal(deal);
  }, []);

  const handleDeleteDeal = useCallback((deal) => {
    setDealToDelete(deal);
    setShowDeleteDealModal(true);
  }, []);

  const confirmDeleteDeal = useCallback(async () => {
    if (!dealToDelete) return;

    setIsDeletingDeal(true);

    try {
      const response = await deleteDeal(dealToDelete._id);
      if (response.data?.success) {
        // Refresh deals list
        if (selectedAdmin && adminDetailView === "Deals") {
          await fetchDealsForAdmin(selectedAdmin._id);
        }
        setShowDeleteDealModal(false);
        setDealToDelete(null);
      } else {
        console.error("Failed to delete deal");
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
    } finally {
      setIsDeletingDeal(false);
    }
  }, [dealToDelete, fetchDealsForAdmin, selectedAdmin, adminDetailView]);

  const handleCancelDeleteDeal = useCallback(() => {
    setShowDeleteDealModal(false);
    setDealToDelete(null);
  }, []);

  const handleEditMenuClick = useCallback(
    (menu) => {
      console.log("handleEditMenuClick called with menu:", menu);
      // Ensure the menu has the adminId when editing
      const editingMenuData = {
        ...menu,
        adminId: selectedAdmin?._id || menu.adminId,
      };
      console.log("Setting editingMenu to:", editingMenuData);
      setEditingMenu(editingMenuData);
    },
    [selectedAdmin]
  );

  const handleDeleteMenuClick = useCallback((menu) => {
    setMenuToDelete(menu);
    setShowDeleteMenuModal(true);
  }, []);

  const handleCancelMenuEdit = useCallback(() => {
    setEditingMenu(null);
    setShowAddItemInMenuEdit(false);
    setNewlyAddedItemId(null);
  }, []);

  // Handler to add item from within menu edit modal
  const handleAddItemFromMenuEdit = useCallback(() => {
    setShowAddItemInMenuEdit(true);
  }, []);

  // Handler to close add item modal from menu edit
  const handleCloseAddItemFromMenuEdit = useCallback(() => {
    setShowAddItemInMenuEdit(false);
  }, []);

  // Handler for when item is successfully added during menu editing
  const handleItemAddedDuringMenuEdit = useCallback(
    async (stepId, data = null) => {
      // Close the add item modal
      setShowAddItemInMenuEdit(false);

      // Track the newly added item ID for auto-addition to menu
      if (data && data._id) {
        setNewlyAddedItemId(data._id);
        // Clear the newly added item ID after a short delay
        setTimeout(() => setNewlyAddedItemId(null), 1000);
      }

      // Refresh admin items to include the new item
      if (selectedAdmin && selectedAdmin._id) {
        await fetchItemsForAdmin(selectedAdmin._id);
      }

      // Also call the regular step completion handler for any other side effects
      handleStepCompletion(stepId, data);
    },
    [selectedAdmin, fetchItemsForAdmin, handleStepCompletion]
  );

  // Logout handlers
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      console.log("Initiating super admin logout process...");
      const response = await superAdminLogout();

      console.log("Super Admin logout API successful:", response);

      // Clear any stored data in localStorage (if any exists)
      localStorage.clear();

      // Clear session storage as well
      sessionStorage.clear();

      console.log("Local storage cleared successfully");

      // Redirect to super admin login page
      navigate("/superAdminlogin", { replace: true });
    } catch (error) {
      console.error("Logout API failed:", error);

      // Log detailed error information
      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        console.error("Server error details:", {
          message,
          serverError,
          status: error.response.status,
        });

        // Handle specific error cases
        if (error.response.status === 401) {
          console.warn(
            "Token invalid or expired - user session already cleared"
          );
        } else if (error.response.status === 403) {
          console.warn("Access denied - insufficient permissions");
        } else if (error.response.status === 500) {
          console.error("Server error during logout");
        }
      } else if (error.request) {
        console.error("Network error - unable to reach server:", error.request);
      } else {
        console.error("Unexpected error during logout:", error.message);
      }

      // Even if logout API fails, we should still redirect to login
      // This handles cases where the token is already invalid or expired
      console.log("Performing local cleanup and redirect...");

      // Clear all local data
      localStorage.clear();
      sessionStorage.clear();

      // Force redirect to login page
      window.location.href = "/superAdminlogin";
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#f5f5f5] flex items-center gap-3">
                <FaUserPlus className="text-[#60a5fa]" />
                Super Admin Dashboard
              </h1>
              <p className="text-[#a0a0a0] mt-2">
                Manage your restaurant network and administrators
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded-lg font-medium transition-colors duration-200"
            >
              <FaSignOutAlt className="text-sm" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#1a1a1a] rounded-lg mb-6">
          <div className="border-b border-[#404040]">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedAdmin(null);
                    setAdminDetailView("Analytics");
                    // Fetch fresh data when switching to All Admins
                    if (tab === "All Admins") {
                      fetchAllAdmins();
                    }
                  }}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-[#60a5fa] text-[#60a5fa]"
                      : "border-transparent text-[#a0a0a0] hover:text-[#f5f5f5] hover:border-[#606060]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Setup Wizard" && (
          <SetupWizardTab
            setupSteps={setupSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            createdUser={createdUser}
            createdCategories={createdCategories}
            createdItems={createdItems}
            createdMenu={createdMenu}
            setIsCreateUserModalOpen={setIsCreateUserModalOpen}
            setIsCreateCategoryModalOpen={setIsCreateCategoryModalOpen}
            setIsCreateItemModalOpen={setIsCreateItemModalOpen}
            setIsCreateMenuModalOpen={setIsCreateMenuModalOpen}
            handleManualStepAdvance={handleManualStepAdvance}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "All Admins" && (
          <AllAdminsTab
            // State props
            adminInsightOrders={adminInsightOrders}
            isLoadingAnalytics={isLoadingAnalytics}
            fetchAnalytics={fetchAnalytics}
            handleLoadMore={handleLoadMore}
            hasMoreOrders={hasMoreOrders}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedAdmin={selectedAdmin}
            setSelectedAdmin={setSelectedAdmin}
            isAdminDropdownOpen={isAdminDropdownOpen}
            setIsAdminDropdownOpen={setIsAdminDropdownOpen}
            allAdmins={allAdmins}
            adminCategories={adminCategories}
            adminItems={adminItems}
            adminDetailView={adminDetailView}
            setAdminDetailView={setAdminDetailView}
            adminOrders={adminOrders}
            searchOrderId={searchOrderId}
            setSearchOrderId={setSearchOrderId}
            displayedOrdersCount={displayedOrdersCount}
            setDisplayedOrdersCount={setDisplayedOrdersCount}
            CategoryRow={CategoryRow}
            MdRestaurantMenu={MdRestaurantMenu}
            // editingOrder={editingOrder}
            // setEditingOrder={setEditingOrder}
            selectedOrderForDetails={selectedOrderForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
            isLoadingOrders={isLoadingOrders}
            ordersError={ordersError}
            isLoadingCategories={isLoadingCategories}
            categoriesError={categoriesError}
            isLoadingItems={isLoadingItems}
            itemsError={itemsError}
            adminMenu={adminMenu}
            isLoadingMenu={isLoadingMenu}
            menuError={menuError}
            menuItems={menuItems}
            isLoadingMenuItems={isLoadingMenuItems}
            allVouchers={allVouchers}
            isLoadingVouchers={isLoadingVouchers}
            vouchersError={vouchersError}
            allDeals={allDeals}
            isLoadingDeals={isLoadingDeals}
            dealsError={dealsError}
            analyticsData={analyticsData}
            isLoadingAdmins={isLoadingAdmins}
            adminsError={adminsError}
            isExportingExcel={isExportingExcel}
            // Function props
            fetchCategoriesForAdmin={fetchCategoriesForAdmin}
            fetchItemsForAdmin={fetchItemsForAdmin}
            fetchOrdersAndAnalytics={fetchOrdersAndAnalytics}
            fetchMenuForAdmin={fetchMenuForAdmin}
            fetchVouchersForAdmin={fetchVouchersForAdmin}
            fetchDealsForAdmin={fetchDealsForAdmin}
            fetchAllAdmins={fetchAllAdmins}
            handleEditItemClick={handleEditItemClick}
            handleDeleteItemClick={handleDeleteItemClick}
            handleEditMenuClick={handleEditMenuClick}
            handleDeleteMenuClick={handleDeleteMenuClick}
            handleCreateVoucher={handleCreateVoucher}
            handleEditVoucher={handleEditVoucher}
            handleDeleteVoucherClick={handleDeleteVoucherClick}
            handleCreateDeal={handleCreateDeal}
            handleEditDeal={handleEditDeal}
            handleDeleteDeal={handleDeleteDeal}
            handleExportToExcel={handleExportToExcel}
            handleExportSingleOrder={handleExportSingleOrder}
            // Modal state props
            setIsCreateCategoryModalOpen={setIsCreateCategoryModalOpen}
            setIsCreateItemModalOpen={setIsCreateItemModalOpen}
            setIsCreateMenuModalOpen={setIsCreateMenuModalOpen}
          />
        )}
        {/* Modals */}
        {showLogoutModal && (
          <LogoutModal
            handleLogoutCancel={handleLogoutCancel}
            isLoggingOut={isLoggingOut}
            handleLogoutConfirm={handleLogoutConfirm}
          />
        )}
        {showDeleteCategoryModal && (
          <DeleteCategory
            setShowDeleteCategoryModal={setShowDeleteCategoryModal}
            setCategoryToDelete={setCategoryToDelete}
            isDeletingCategory={isDeletingCategory}
            handleDeleteCategory={handleDeleteCategory}
            categoryToDelete={categoryToDelete}
            selectedAdmin={selectedAdmin}
          />
        )}
        {showDeleteItemModal && (
          <DeleteItemModal
            setShowDeleteItemModal={setShowDeleteItemModal}
            setItemToDelete={setItemToDelete}
            handleDeleteItem={handleDeleteItem}
            isDeletingItem={isDeletingItem}
            selectedAdmin={selectedAdmin}
            itemToDelete={itemToDelete}
          />
        )}
        {showDeleteMenuModal && (
          <DeleteMenuModal
            setShowDeleteMenuModal={setShowDeleteMenuModal}
            setMenuToDelete={setMenuToDelete}
            menuToDelete={menuToDelete}
            handleDeleteMenu={handleDeleteMenu}
            isDeletingMenu={isDeletingMenu}
            selectedAdmin={selectedAdmin}
          />
        )}
        {editingItem && <EditItemModal />}

        <CreateUserModal
          isOpen={isCreateUserModalOpen}
          onClose={handleCloseUserModal}
          onSuccess={handleStepCompletion}
          allAdmins={allAdmins}
          createdUser={createdUser}
        />

        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          onSuccess={handleStepCompletion}
          allAdmins={allAdmins}
          createdUser={createdUser}
          createdCategories={createdCategories}
          isLoadingAdmins={isLoadingAdmins}
          selectedAdmin={selectedAdmin}
          onCategoryCreated={fetchCategoriesForAdmin}
          isSetupWizard={activeTab === "Setup Wizard"}
          isSettings={
            selectedAdmin &&
            (adminDetailView === "Settings" || adminDetailView === "Categories")
          }
        />

        <CreateItemModal
          isOpen={isCreateItemModalOpen}
          onClose={handleCloseItemModal}
          onSuccess={handleStepCompletion}
          allAdmins={allAdmins}
          createdUser={createdUser}
          isLoadingAdmins={isLoadingAdmins}
          selectedAdmin={selectedAdmin}
          onItemCreated={fetchItemsForAdmin}
          isSetupWizard={activeTab === "Setup Wizard"}
          isSettings={
            selectedAdmin &&
            (adminDetailView === "Settings" || adminDetailView === "Items")
          }
          adminCategories={adminCategories}
          isLoadingCategories={isLoadingCategories}
        />

        <CreateMenuModal
          isOpen={isCreateMenuModalOpen}
          onClose={handleCloseMenuModal}
          onSuccess={handleStepCompletion}
          onMenuCreated={fetchMenuForAdmin}
          allAdmins={allAdmins}
          createdUser={createdUser}
          isLoadingAdmins={isLoadingAdmins}
          selectedAdmin={selectedAdmin}
          isSetupWizard={activeTab === "Setup Wizard"}
          isSettings={
            selectedAdmin &&
            (adminDetailView === "Settings" || adminDetailView === "Menu")
          }
        />

        {/* Edit Modals */}
        {editingCategory && (
          <EditCategoryModal
            isOpen={true}
            categoryData={editingCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            isLoading={isUpdatingCategory}
          />
        )}

        {editingItem && (
          <EditItemModal
            isOpen={true}
            itemData={editingItem}
            onSubmit={handleUpdateItem}
            onCancel={() => setEditingItem(null)}
            isLoading={isUpdatingItem}
            categories={adminCategories}
          />
        )}

        {editingMenu && (
          <EditMenuModal
            menuData={editingMenu}
            onSubmit={handleUpdateMenu}
            onCancel={handleCancelMenuEdit}
            isLoading={isUpdatingMenu}
            onAddItem={handleAddItemFromMenuEdit}
            availableItems={adminItems}
            newlyAddedItemId={newlyAddedItemId}
            enableImmediateRemoval={true}
            onItemRemoved={handleItemRemovedFromMenu}
          />
        )}

        {/* Add Item Modal when called from Menu Edit */}
        {showAddItemInMenuEdit && selectedAdmin && (
          <CreateItemModal
            isOpen={showAddItemInMenuEdit}
            userId={selectedAdmin._id}
            categories={adminCategories}
            onSuccess={handleItemAddedDuringMenuEdit}
            onClose={handleCloseAddItemFromMenuEdit}
            allAdmins={allAdmins}
            selectedAdmin={selectedAdmin}
            isSettings={true}
            adminCategories={adminCategories}
            isLoadingCategories={isLoadingCategories}
          />
        )}

        {/* Create Voucher Modal */}
        {isCreateVoucherModalOpen && (
          <CreateVoucherModal
            isOpen={isCreateVoucherModalOpen}
            onClose={() => setIsCreateVoucherModalOpen(false)}
            onSuccess={handleVoucherCreated}
            allAdmins={allAdmins}
            selectedAdmin={selectedAdmin}
            isLoadingAdmins={isLoadingAdmins}
          />
        )}

        {/* Edit Voucher Modal */}
        {editingVoucher && (
          <EditVoucherModal
            isOpen={!!editingVoucher}
            onClose={() => setEditingVoucher(null)}
            onSuccess={handleVoucherUpdated}
            voucherData={editingVoucher}
            selectedAdmin={selectedAdmin}
          />
        )}

        {/* Delete Voucher Confirmation Modal */}
        {showDeleteVoucherModal && voucherToDelete && (
          <DeleteVoucherModal
            voucherToDelete={voucherToDelete}
            handleCancelDeleteVoucher={handleCancelDeleteVoucher}
            handleDeleteVoucher={handleDeleteVoucher}
            isDeletingVoucher={isDeletingVoucher}
          />
        )}

        {/* Create Deal Modal */}
        {isCreateDealModalOpen && (
          <CreateDealModal
            isOpen={isCreateDealModalOpen}
            onClose={() => setIsCreateDealModalOpen(false)}
            onDealCreated={handleDealCreated}
            preSelectedAdmin={selectedAdmin}
          />
        )}

        {/* Edit Deal Modal */}
        {editingDeal && (
          <EditDealModal
            isOpen={!!editingDeal}
            onClose={() => setEditingDeal(null)}
            onDealUpdated={handleDealUpdated}
            deal={editingDeal}
          />
        )}

        {/* Delete Deal Confirmation Modal */}
        {showDeleteDealModal && dealToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-red-500 text-xl" />
                <h3 className="text-lg font-bold text-[#f5f5f5]">
                  Delete Deal
                </h3>
              </div>
              <p className="text-[#a0a0a0] mb-6">
                Are you sure you want to delete the deal "{dealToDelete.name}"?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDeleteDeal}
                  disabled={isDeletingDeal}
                  className="px-4 py-2 bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteDeal}
                  disabled={isDeletingDeal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                >
                  {isDeletingDeal ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrderForDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-[#60a5fa] text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <p className="text-blue-100 text-sm">
                      Order #
                      {selectedOrderForDetails._id?.slice(-8).toUpperCase() ||
                        "N/A"}{" "}
                      - {selectedOrderForDetails.orderType || "DINE"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Export Button */}
                    <button
                      onClick={() =>
                        handleExportSingleOrder(selectedOrderForDetails)
                      }
                      disabled={isExportingSingleOrder}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {isExportingSingleOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          Export Excel
                        </>
                      )}
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedOrderForDetails(null)}
                      className="text-white hover:text-gray-200 text-2xl transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {(() => {
                  const order = selectedOrderForDetails;
                  console.log("selected Orders", order.deals);
                  // Calculate order totals like in PrintReceiptsModal
                  let totalOriginalAmount = 0;
                  let totalItemDiscount = 0;
                  let totalTaxAmount = 0;
                  let totalFinalAmount = 0;
                  // Process deals
                  const processedDeals =
                    order.deals?.map((deal) => {
                      const quantity = deal.quantity || 1;
                      const basePrice = deal.dealPrice || 0;

                      // Calculate options price from customization
                      const optionsPrice = Object.values(
                        deal.customization || {}
                      ).reduce(
                        (sum, optionArray) =>
                          sum +
                          optionArray.reduce(
                            (optSum, opt) => optSum + (opt.price || 0),
                            0
                          ),
                        0
                      );

                      const discount = deal.savings || 0;
                      const taxRate = parseFloat(deal.dealTax || 0);

                      const taxAmount =
                        ((basePrice + optionsPrice - discount) * taxRate) / 100;
                      const finalPrice =
                        basePrice + optionsPrice - discount + taxAmount;
                      totalOriginalAmount += finalPrice;
                      totalFinalAmount += finalPrice * quantity;

                      return {
                        ...deal,
                        basePrice,
                        optionsPrice,
                        discount,
                        taxRate,
                        taxAmount,
                        finalPrice,
                      };
                    }) || [];

                  const processedItems =
                    order.items?.map((item) => {
                      const basePrice =
                        item.basePrice || item.originalPrice || item.price || 0;
                      const options = item.selectedOptions || [];
                      const optionsPrice = options.reduce(
                        (sum, opt) => sum + (opt.price || 0),
                        0
                      );
                      const discount = item.discount || item.itemDiscount || 0;
                      const quantity = item.quantity || 1;

                      // Determine tax rate based on payment method
                      const paymentMethod =
                        order.paymentMethod || order.paymentType || "CASH";
                      const taxRates = item.tax || { card: "0", cash: "0" };
                      const taxRate =
                        paymentMethod === "CARD"
                          ? parseFloat(taxRates.card || "0")
                          : parseFloat(taxRates.cash || "0");

                      // Calculate original amount before discounts
                      const originalAmount = basePrice + optionsPrice;

                      // Calculate tax on original amount
                      const taxAmount = (originalAmount * taxRate) / 100;

                      // Final calculation: basePrice + options - discount + tax
                      const finalPrice = originalAmount - discount + taxAmount;

                      totalOriginalAmount += originalAmount * quantity;
                      totalItemDiscount += discount * quantity;
                      totalTaxAmount += taxAmount * quantity;
                      totalFinalAmount += finalPrice * quantity;

                      return {
                        ...item,
                        basePrice,
                        optionsPrice,
                        originalAmount,
                        taxAmount,
                        finalPrice,
                        taxRate,
                      };
                    }) || [];

                  const voucherDiscount = order.voucherDiscount || 0;
                  const finalOrderTotal = totalFinalAmount - voucherDiscount;
                  const subtotal = totalOriginalAmount - totalItemDiscount;

                  return (
                    <div className="space-y-6">
                      {/* Order Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#262626] p-4 rounded-lg">
                          <h3 className="text-[#f5f5f5] font-semibold mb-3">
                            Order Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">Order ID:</span>
                              <span className="text-[#f5f5f5]">
                                #{order._id?.slice(-8).toUpperCase() || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Order Type:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  order.orderType === "DINE"
                                    ? "bg-blue-900 text-blue-300"
                                    : order.orderType === "DELIVERY"
                                    ? "bg-green-900 text-green-300"
                                    : order.orderType === "PICKUP"
                                    ? "bg-orange-900 text-orange-300"
                                    : "bg-gray-900 text-gray-300"
                                }`}
                              >
                                {order.orderType || "DINE"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Order Status:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  order.orderStatus === "COMPLETED"
                                    ? "bg-green-900 text-green-300"
                                    : order.orderStatus === "IN_PROGRESS"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : "bg-blue-900 text-blue-300"
                                }`}
                              >
                                {order.orderStatus || "COMPLETED"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Payment Status:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  order.paymentStatus === "PAID"
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300"
                                }`}
                              >
                                {order.paymentStatus || "UNPAID"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Payment Method:
                              </span>
                              <span className="text-[#f5f5f5]">
                                {order.paymentMethod ||
                                  order.paymentType ||
                                  "CASH"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Date & Time:
                              </span>
                              <span className="text-[#f5f5f5]">
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleString()
                                  : new Date().toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#262626] p-4 rounded-lg">
                          <h3 className="text-[#f5f5f5] font-semibold mb-3">
                            Customer Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">
                                Customer Name:
                              </span>
                              <span className="text-[#f5f5f5]">
                                {order.customerInfo?.name || "Walk-in Customer"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">Phone:</span>
                              <span className="text-[#f5f5f5]">
                                {order.customerInfo?.phone || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">Address:</span>
                              <span className="text-[#f5f5f5] text-right max-w-[200px] break-words">
                                {order.customerInfo?.address || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a0a0a0]">Table:</span>
                              <span className="text-[#f5f5f5]">
                                {order.customerInfo?.table ||
                                  order.tableNo ||
                                  "N/A"}
                              </span>
                            </div>
                            {order.voucherCode && (
                              <div className="flex justify-between">
                                <span className="text-[#a0a0a0]">
                                  Voucher Code:
                                </span>
                                <span className="text-[#10b981]">
                                  {order.voucherCode}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-[#f5f5f5] font-semibold mb-4">
                          Order Items ({processedItems.length})
                        </h3>
                        <div className="space-y-4">
                          {processedItems.map((item, index) => (
                            <div
                              key={index}
                              className="border-b border-[#404040] pb-4 last:border-b-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="text-[#f5f5f5] font-medium">
                                    {item.name}
                                  </h4>
                                  {item.menuName &&
                                    item.menuName !== "General Items" && (
                                      <p className="text-[#a0a0a0] text-sm">
                                        {item.menuName}
                                      </p>
                                    )}
                                </div>
                                <div className="text-right">
                                  <div className="text-[#f5f5f5] font-semibold">
                                    x{item.quantity}
                                  </div>
                                  <div className="text-[#10b981] font-bold">
                                    Rs
                                    {(item.finalPrice * item.quantity).toFixed(
                                      2
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-[#a0a0a0]">
                                    Base Price:
                                  </span>
                                  <div className="text-[#f5f5f5]">
                                    Rs{item.basePrice.toFixed(2)}
                                  </div>
                                </div>
                                {item.optionsPrice > 0 && (
                                  <div>
                                    <span className="text-[#a0a0a0]">
                                      Options:
                                    </span>
                                    <div className="text-[#f5f5f5]">
                                      Rs{item.optionsPrice.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                                {item.itemDiscount > 0 && (
                                  <div>
                                    <span className="text-[#a0a0a0]">
                                      Discount:
                                    </span>
                                    <div className="text-[#10b981]">
                                      -Rs{item.itemDiscount.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span className="text-[#a0a0a0]">
                                    Tax ({item.taxRate}%):
                                  </span>
                                  <div className="text-[#f59e0b]">
                                    Rs{item.taxAmount.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {item.selectedOptions &&
                                item.selectedOptions.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-[#a0a0a0] text-xs">
                                      Options:{" "}
                                    </span>
                                    <span className="text-[#f5f5f5] text-xs">
                                      {item.selectedOptions
                                        .map((opt) =>
                                          typeof opt === "string"
                                            ? opt
                                            : `${opt.name} (+Rs${
                                                opt.price || 0
                                              })`
                                        )
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}

                              {item.notes && (
                                <div className="mt-2">
                                  <span className="text-[#a0a0a0] text-xs">
                                    Notes:{" "}
                                  </span>
                                  <span className="text-[#f5f5f5] text-xs">
                                    {item.notes}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-[#f5f5f5] font-semibold mb-4">
                          Order Deals ({processedDeals.length})
                        </h3>
                        <div className="space-y-4">
                          {processedDeals.map((deal, index) => (
                            <div
                              key={index}
                              className="border-b border-[#404040] pb-4 last:border-b-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="text-[#f5f5f5] font-medium">
                                    {deal.name}
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <div className="text-[#f5f5f5] font-semibold">
                                    x{deal.quantity}
                                  </div>
                                  <div className="text-[#10b981] font-bold">
                                    Rs
                                    {(deal.finalPrice * deal.quantity).toFixed(
                                      2
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-[#a0a0a0]">
                                    Base Price:
                                  </span>
                                  <div className="text-[#f5f5f5]">
                                    Rs{deal.basePrice.toFixed(2)}
                                  </div>
                                </div>
                                {deal.optionsPrice > 0 && (
                                  <div>
                                    <span className="text-[#a0a0a0]">
                                      Options:
                                    </span>
                                    <div className="text-[#f5f5f5]">
                                      Rs{deal.optionsPrice.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                                {deal.discount > 0 && (
                                  <div>
                                    <span className="text-[#a0a0a0]">
                                      Discount:
                                    </span>
                                    <div className="text-[#10b981]">
                                      -Rs{deal.discount.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span className="text-[#a0a0a0]">
                                    Tax ({deal.taxRate}%):
                                  </span>
                                  <div className="text-[#f59e0b]">
                                    Rs{deal.taxAmount.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {Object.keys(deal.customization || {}).length >
                                0 && (
                                <div className="mt-2 text-xs">
                                  <span className="text-[#a0a0a0]">
                                    Customization:{" "}
                                  </span>
                                  <span className="text-[#f5f5f5]">
                                    {Object.entries(deal.customization)
                                      .map(([key, options]) =>
                                        options
                                          .map(
                                            (opt) =>
                                              `${key}: ${opt.name} (+Rs${
                                                opt.price || 0
                                              })`
                                          )
                                          .join(", ")
                                      )
                                      .join("; ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-[#f5f5f5] font-semibold mb-4">
                          Order Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a0a0a0]">
                              Original Total:
                            </span>
                            <span className="text-[#f5f5f5]">
                              Rs{totalOriginalAmount.toFixed(2)}
                            </span>
                          </div>
                          {totalItemDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#a0a0a0]">
                                Item Discounts:
                              </span>
                              <span className="text-[#10b981]">
                                -Rs{totalItemDiscount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a0a0a0]">Subtotal:</span>
                            <span className="text-[#f5f5f5]">
                              Rs{subtotal.toFixed(2)}
                            </span>
                          </div>
                          {voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#a0a0a0]">
                                Voucher Discount:
                              </span>
                              <span className="text-[#10b981]">
                                -Rs{voucherDiscount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {totalTaxAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#a0a0a0]">
                                Tax (
                                {order.paymentMethod ||
                                  order.paymentType ||
                                  "CASH"}
                                ):
                              </span>
                              <span className="text-[#f59e0b]">
                                +Rs{totalTaxAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-[#404040] pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span className="text-[#f5f5f5]">
                                FINAL TOTAL:
                              </span>
                              <span className="text-[#10b981]">
                                Rs{finalOrderTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {totalItemDiscount + voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#a0a0a0]">
                                Total Savings:
                              </span>
                              <span className="text-[#10b981] font-semibold">
                                Rs
                                {(totalItemDiscount + voucherDiscount).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="bg-[#262626] p-4 border-t border-[#404040]">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrderForDetails(null)}
                    className="px-6 py-2 bg-[#60a5fa] text-white rounded hover:bg-[#3b82f6] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
