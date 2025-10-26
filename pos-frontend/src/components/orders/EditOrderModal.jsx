import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaUtensils, FaReceipt } from "react-icons/fa";
import {
  updateOrder,
  getItems,
  getPayment,
  generateCustomerReceipts,
  completeOrder,
  changePaymentMethod,
  validateVoucher as validateVoucherAPI,
} from "../../https/index";
import PrintReceiptsModal from "../receipt/PrintReceiptsModal";
import { FaPrint } from "react-icons/fa6";

const EditOrderModal = ({
  order,
  onClose,
  onOrderUpdated,
  onCompleteOrder,
  isFullModal,
}) => {
  // Safety check to ensure order is properly defined
  if (!order) {
    return null;
  }
  console.log("this is order", order);

  // Ensure order has deals property
  const safeOrder = { ...order, deals: order.deals || [] };
  console.log("kamali uskanshi ", safeOrder);
  const [orderItems, setOrderItems] = useState(safeOrder.items || []);
  const [showAddItems, setShowAddItems] = useState(false);
  const [showPrintReceiptsModal, setShowPrintReceiptsModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod);
  const [newKitchenReceipts, setNewKitchenReceipts] = useState([]);
  const [showNewKitchenReceiptsModal, setShowNewKitchenReceiptsModal] =
    useState(false);
  const [autoPrintNewItems, setAutoPrintNewItems] = useState(true); // Auto-print new kitchen receipts
  const [selectedItem, setSelectedItem] = useState(null); // For options selection
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showCompleteOrderModal, setShowCompleteOrderModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    order.paymentMethod || "CASH"
  );
  const [newlyAddedReceipts, setNewlyAddedReceipts] = useState([]);

  const [newPaymentStatus, setNewPaymentStatus] = useState(
    order.paymentStatus || "UNPAID"
  );
  const [showCompleteOrderSection, setShowCompleteOrderSection] =
    useState(false);
  const [updatedOrderData, setUpdatedOrderData] = useState(null);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [isPrintingUnpaidReceipt, setIsPrintingUnpaidReceipt] = useState(false);
  const [isChangingPaymentMethod, setIsChangingPaymentMethod] = useState(false);

  const [isPrintingCustomerReceipts, setIsPrintingCustomerReceipts] =
    useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false); // Track if order has been updated

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    // You can add additional logic here if needed
  };

  // Add this function to confirm the payment method selection

  const queryClient = useQueryClient();

  // Debug: Track newKitchenReceipts changes
  useEffect(() => {
    console.log(
      "🍽️ newKitchenReceipts changed:",
      newKitchenReceipts.length,
      newKitchenReceipts
    );
  }, [newKitchenReceipts]);

  useEffect(() => {
    if (order.kitchenReceipts && order.kitchenReceipts.length > 0) {
      // Mark all receipts as newly added initially
      const initialNewReceipts = order.kitchenReceipts.map((_, index) => index);
      setNewlyAddedReceipts(initialNewReceipts);
    }
  }, [order.kitchenReceipts]);
  // Debug: Track newly added items and button visibility
  useEffect(() => {
    const newlyAddedCount = orderItems.filter(
      (item) => item.isNewlyAdded
    ).length;
    const hasNewItems = orderItems.some((item) => item.isNewlyAdded);
    const showButton =
      newKitchenReceipts.length > 0 || (hasNewItems && hasBeenUpdated);
    console.log(
      "🆕 Newly added items:",
      newlyAddedCount,
      "hasBeenUpdated:",
      hasBeenUpdated,
      "shouldShowButton:",
      showButton
    );
  }, [orderItems, hasBeenUpdated, newKitchenReceipts]);

  // Fetch available items for adding
  const { data: itemsData } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    enabled: showAddItems,
  });

  const availableItems = itemsData?.data?.data || [];
  const handlePrintIndividualReceipt = (receiptIndex) => {
    const receipt = order.kitchenReceipts[receiptIndex];

    setReceiptData({
      ...order,
      items: receipt.items || [],
      deals: receipt.deals || [],
      kitchenReceipts: [receipt],
      isNewlyAdded: true,
    });

    setShowPrintReceiptsModal(true);

    // Remove from newly added receipts after printing
    setNewlyAddedReceipts((prev) => prev.filter((i) => i !== receiptIndex));
  };

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, paymentMethod }) => {
      setIsChangingPaymentMethod(true); // Set loading state
      const updateData = { orderId, paymentMethod };

      if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod;
      }

      const response = await changePaymentMethod(updateData);
      return response;
    },
    onSuccess: (response) => {
      setIsChangingPaymentMethod(false); // Clear loading state
      enqueueSnackbar("Payment details updated successfully!", {
        variant: "success",
      });

      console.log("pareesa", response.data.order.paymentMethod);

      // Update the local state with the new payment method
      if (response?.data?.order?.paymentMethod) {
        setSelectedPaymentMethod(response?.data?.order?.paymentMethod);
      }

      onOrderUpdated();
      setShowStatusModal(false);
      setShowPaymentMethodModal(false);
    },
    onError: (error) => {
      setIsChangingPaymentMethod(false); // Clear loading state on error
      enqueueSnackbar(error.message || "Failed to update payment details", {
        variant: "error",
      });
    },
  });

  // Update the handlePaymentMethodConfirm function to use the mutation
  const handlePaymentMethodConfirm = () => {
    updateOrderStatusMutation.mutate({
      orderId: order._id,
      paymentMethod: selectedPaymentMethod,
    });
  };

  // Complete DELIVERY/PICKUP order mutation (mark as COMPLETED and PAID)
  const completeDeliveryPickupMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await updateOrder({
        orderId: orderId,
        orderStatus: "COMPLETED",
        paymentStatus: "PAID",
        items: orderItems.map((item) => ({
          // Core identification
          _id: item._id,
          itemId: item.itemId || item._id,

          // Names and display
          name: item.name,
          originalName: item.originalName || item.name,

          // Quantity
          quantity: item.quantity,

          // Admin and category information
          adminId: item.adminId || "",
          categoryId: item.categoryId || null,
          categoryName: item.categoryName || "General",

          // Menu information
          menuId: item.menuId || null,
          menuName: item.menuName || "General Items",

          // Comprehensive pricing information
          originalPrice: item.originalPrice || item.price,
          price: item.price,
          basePrice: item.basePrice || item.originalPrice || item.price,
          pricePerQuantity: item.pricePerQuantity || item.price,
          totalPrice: item.totalPrice || item.price,

          // Options information
          options: item.options || [],
          selectedOptions: item.selectedOptions || [],

          // Comprehensive discount information
          discount: item.discount || 0,
          itemDiscount: item.itemDiscount || item.discount || 0,

          // Comprehensive tax information
          tax: item.tax || { cash: "0", card: "0" },
          itemTax: item.itemTax || item.tax?.cash || "0",
          cashTax: item.cashTax || item.tax?.cash || "0",
          cardTax: item.cardTax || item.tax?.card || "0",
          totalTax: item.totalTax || 0,

          // Media and metadata
          pictureURL: item.pictureURL || "",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          __v: item.__v || 0,

          // Cart-specific fields
          itemSubtotal: getItemPrice(item) * item.quantity,
          itemTotalAfterDiscount: getItemFinalPrice(item) * item.quantity,
          finalItemPrice: getItemFinalPrice(item),

          // Status flags
          status: item.status || "active",
          addedAt: item.addedAt || new Date().toISOString(),
        })),
      });

      return response;
    },
    onMutate: () => {
      setIsCompletingOrder(true);
    },
    onSuccess: (response) => {
      setIsCompletingOrder(false);
      enqueueSnackbar("Order completed and marked as paid!", {
        variant: "success",
      });
      onOrderUpdated();
      onClose(); // Close the modal
    },
    onError: (error) => {
      setIsCompletingOrder(false);
      enqueueSnackbar(error.message || "Failed to complete order", {
        variant: "error",
      });
    },
  });

  const hasNewItems = useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return orderItems.length > 0;
    }
    return orderItems.some(
      (item) =>
        !order.items.some(
          (originalItem) =>
            originalItem._id === item._id &&
            originalItem.quantity === item.quantity
        )
    );
  }, [orderItems, order.items]);
  // Complete order mutation
  const completeOrderMutation = useMutation({
    mutationFn: async ({ orderId, paymentDetails }) => {
      console.log("Sending complete order request:", {
        orderId,
        paymentDetails,
      });

      // Use the imported API function
      const response = await completeOrder({
        orderId: orderId,
        paymentMethod: paymentDetails.paymentMethod,
        paymentStatus: "UNPAID",
        orderStatus: "COMPLETED",
        finalTotal: paymentDetails.finalTotal,
        tax: paymentDetails.tax,
        voucherCode: paymentDetails.voucherCode,
        voucherDiscount: paymentDetails.voucherDiscount,
        items: paymentDetails.items,
      });

      console.log("Complete order success response:", response);

      // Try to generate customer receipts
      try {
        const receiptData = await generateCustomerReceipts({
          orderId: orderId,
        });

        console.log("Customer receipts generated:", receiptData);
        return {
          ...response,
          data: {
            ...response.data,
            customerReceipts:
              receiptData.data?.customerReceipts ||
              receiptData.customerReceipts ||
              [],
          },
        };
      } catch (receiptError) {
        console.warn(
          "Error generating receipts, but order was completed:",
          receiptError
        );
        return response;
      }
    },
    onMutate: () => {
      setIsCompletingOrder(true);
    },
    onSuccess: (response) => {
      setIsCompletingOrder(false);
      console.log("Complete order mutation success:", response);
      enqueueSnackbar("Order completed successfully!", { variant: "success" });

      // Store the updated order data with pricing details
      const data = response?.data?.data || response?.data;
      if (data) {
        setUpdatedOrderData(data);
      }

      // Handle customer receipts from the response
      const customerReceipts =
        response?.data?.customerReceipts || data?.customerReceipts || [];
      if (customerReceipts && customerReceipts.length > 0) {
        console.log(
          "Generated customer receipts with detailed pricing:",
          customerReceipts
        );
        setReceiptData({
          ...order,
          ...data, // Include updated order data
          items: orderItems,
          customerReceipts: customerReceipts,
          kitchenReceipts: [],
          paymentStatus: "UNPAID",
          orderStatus: "COMPLETED",
          pricingDetails: data?.pricingDetails,
        });
        setShowPrintReceiptsModal(true);
      } else {
        console.log("Order completed but no receipts generated");
      }

      onOrderUpdated();
      setShowCompleteOrderSection(false);
      // Reset voucher state
      setVoucherCode("");
      setVoucherDiscount(0);
      setAppliedVoucher(null);
    },
    onError: (error) => {
      setIsCompletingOrder(false);
      console.error("Complete order mutation error:", error);
      enqueueSnackbar(error.message || "Failed to complete order", {
        variant: "error",
      });
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onMutate: () => {
      setIsUpdatingOrder(true);
    },
    onSuccess: (response) => {
      setIsUpdatingOrder(false);
      setHasBeenUpdated(true); // Enable print new kitchen receipts button
      console.log("Full updateOrder response:", response);
      enqueueSnackbar("Order updated successfully!", { variant: "success" });

      // Handle kitchen receipts for updates
      const data = response?.data?.data || response?.data;
      console.log("Extracted data from response:", data);

      if (data && data.kitchenReceipts) {
        console.log("Updated kitchen receipts:", data.kitchenReceipts);
        setNewKitchenReceipts(data.kitchenReceipts);
      }

      // Handle new kitchen receipts for newly added items
      if (
        data &&
        data.newKitchenReceipts &&
        data.newKitchenReceipts.length > 0
      ) {
        console.log(
          "🍽️ New kitchen receipts for added items:",
          data.newKitchenReceipts
        );
        console.log("🍽️ Auto-print enabled:", autoPrintNewItems);
        console.log(
          "🍽️ Setting newKitchenReceipts state to:",
          data.newKitchenReceipts
        );
        setNewKitchenReceipts(data.newKitchenReceipts);

        // Auto-open print modal for new kitchen receipts if enabled
        if (autoPrintNewItems) {
          console.log("Setting timeout to show modal...");
          setTimeout(() => {
            console.log("Opening new kitchen receipts modal...");
            setShowNewKitchenReceiptsModal(true);
          }, 1000);
        } else {
          enqueueSnackbar(
            `${data.newKitchenReceipts.length} new kitchen receipt(s) ready to print!`,
            {
              variant: "info",
              action: (
                <button
                  onClick={() => setShowNewKitchenReceiptsModal(true)}
                  className="text-white underline"
                >
                  Print Now
                </button>
              ),
            }
          );
        }
      } else {
        console.log("🍽️ No new kitchen receipts found or empty array");
        console.log("🍽️ Server response data:", data);
        // Don't clear newKitchenReceipts here - only clear when items are modified
      }

      // Keep newly added flags until kitchen receipts are printed
      // setOrderItems(prev => prev.map(item => ({ ...item, isNewlyAdded: false })));
    },
    onError: (error) => {
      setIsUpdatingOrder(false);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update order",
        {
          variant: "error",
        }
      );
    },
  });

  // Generate customer receipts mutation
  const generateCustomerReceiptsMutation = useMutation({
    mutationFn: generateCustomerReceipts,
    onMutate: () => {
      setIsPrintingCustomerReceipts(true);
    },
    onSuccess: (response) => {
      setIsPrintingCustomerReceipts(false);
      const data = response?.data;
      enqueueSnackbar("Customer receipts generated successfully!", {
        variant: "success",
      });

      if (data && data.customerReceipts && data.customerReceipts.length > 0) {
        setReceiptData({
          ...order,
          items: orderItems,
          customerReceipts: data.customerReceipts,
          kitchenReceipts: [],
        });
        setShowPrintReceiptsModal(true);
      }
    },
    onError: (error) => {
      setIsPrintingCustomerReceipts(false);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to generate customer receipts",
        {
          variant: "error",
        }
      );
    },
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: getPayment,
    onSuccess: (response) => {
      enqueueSnackbar("Payment processed successfully!", {
        variant: "success",
      });

      // Handle customer receipts for payment
      const data = response?.data?.data || response?.data;
      if (data && data.PaidReceipts) {
        console.log("Customer receipts:", data.PaidReceipts);
        // Set up receipt data for printing
        setReceiptData({
          ...order,
          customerReceipts: data.PaidReceipts,
          kitchenReceipts: [],
          paymentStatus: "PAID",
        });
        setShowPrintReceiptsModal(true);
      }

      onOrderUpdated();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to process payment",
        {
          variant: "error",
        }
      );
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setOrderItems((prev) => prev.filter((item) => item._id !== itemId));
    } else {
      setOrderItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }

    // Reset update status for DINE orders when items are modified
    if (order.orderType === "DINE") {
      setHasBeenUpdated(false);
      // Only clear new kitchen receipts if we're removing items (not just changing quantity)
      if (newQuantity <= 0) {
        setNewKitchenReceipts([]);
      }
    }
  };

  const handleAddItem = (item) => {
    const existingItem = orderItems.find((oi) => oi._id === item._id);

    if (existingItem) {
      // Increase quantity if item already exists
      handleQuantityChange(item._id, existingItem.quantity + 1);
    } else {
      // Check if item has options
      if (item.options && item.options.length > 0) {
        setSelectedItem(item);
        setSelectedOptions([]);
        setShowOptionsModal(true);
      } else {
        // Add item directly if no options
        addItemToOrder(item, []);
      }
    }
  };

  const addItemToOrder = (item, options = []) => {
    // Calculate total options price
    const optionsTotal = options.reduce(
      (sum, opt) => sum + (opt.price || 0),
      0
    );

    // Create complete cart item with all fields from API response
    const cartItem = {
      // Core identification
      _id: item._id,
      id: new Date().getTime(), // Unique ID for cart item to avoid conflicts
      itemId: item._id,

      // Names and display
      name:
        options.length > 0
          ? `${item.name} (${options.map((opt) => opt.name).join(", ")})`
          : item.name,
      originalName: item.name,

      // Quantity management
      quantity: 1,
      isNewlyAdded: true, // Mark as newly added for separate kitchen receipt

      // Admin and category information
      adminId: item.adminId || "",
      categoryId: item.categoryId || null,
      categoryName: item.categoryName || "General",

      // Menu information
      menuId: item.menuId || null,
      menuName: item.menuName || "General Items",

      // Pricing information (all from API response)
      originalPrice: item.originalPrice || item.price, // Original base price from API
      price: item.price + optionsTotal, // Current price including options
      basePrice: item.price, // Base item price without options
      pricePerQuantity: item.price + optionsTotal,
      totalPrice: item.totalPrice || item.price + optionsTotal, // Total price from API or calculated

      // Discount information (from API response)
      discount: item.discount || 0, // Item discount from API
      itemDiscount: item.discount || 0,

      // Tax information (from API response)
      tax: item.tax || { cash: "0", card: "0" }, // Tax rates from API
      itemTax: item.tax?.cash || "0",
      cashTax: item.tax?.cash || "0",
      cardTax: item.tax?.card || "0",
      totalTax: 0, // Will be calculated during checkout

      // Options information
      options: options,
      selectedOptions: options,

      // Media and visual
      pictureURL: item.pictureURL || "",

      // Timestamps and versioning
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      __v: item.__v || 0,

      // Additional calculated fields for cart management
      itemSubtotal: (item.price + optionsTotal) * 1, // Subtotal for this item
      itemTotalAfterDiscount:
        (item.price + optionsTotal - (item.discount || 0)) * 1, // After item discount

      // Voucher information (will be applied at order level)
      voucherDiscount: 0, // Individual item voucher discount (if applicable)

      // Final calculations
      finalItemPrice: item.price + optionsTotal - (item.discount || 0), // Price after all discounts

      // Status and metadata
      status: "active",
      addedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    console.log("Adding complete item to cart:", cartItem);
    console.log("Item tax information:", {
      cashTax: cartItem.tax?.cash,
      cardTax: cartItem.tax?.card,
      originalTax: item.tax,
    });
    console.log("Item pricing breakdown:", {
      originalPrice: cartItem.originalPrice,
      basePrice: cartItem.basePrice,
      finalPrice: cartItem.price,
      discount: cartItem.discount,
      totalPrice: cartItem.totalPrice,
    });

    // Add new item with complete information
    setOrderItems((prev) => [...prev, cartItem]);

    // Reset update status for DINE orders when new items are added
    if (order.orderType === "DINE") {
      setHasBeenUpdated(false);
      // Don't clear newKitchenReceipts when adding items - we want to keep building the list
    }
  };

  const handleOptionsConfirm = () => {
    if (selectedItem) {
      addItemToOrder(selectedItem, selectedOptions);
      setShowOptionsModal(false);
      setSelectedItem(null);
      setSelectedOptions([]);
    }
  };

  const handleUpdateOrder = () => {
    if (
      orderItems.length === 0 &&
      (!safeOrder.deals || safeOrder.deals.length === 0)
    ) {
      enqueueSnackbar("Order must have at least one item or deal", {
        variant: "error",
      });
      return;
    }

    // Separate newly added items for kitchen receipts
    const newlyAddedItems = orderItems.filter((item) => item.isNewlyAdded);
    console.log("Items being sent for update:", orderItems);
    console.log("Newly added items being sent:", newlyAddedItems);

    updateOrderMutation.mutate({
      orderId: order._id,
      items: orderItems.map((item) => ({
        // Core identification
        _id: item._id,
        itemId: item.itemId || item._id,

        // Names and display
        name: item.name,
        originalName: item.originalName || item.name,

        // Quantity
        quantity: item.quantity,

        // Admin and category information
        adminId: item.adminId || "",
        categoryId: item.categoryId || null,
        categoryName: item.categoryName || "General",

        // Menu information
        menuId: item.menuId || null,
        menuName: item.menuName || "General Items",

        // Comprehensive pricing information
        originalPrice: item.originalPrice || item.price,
        price: item.price,
        basePrice: item.basePrice || item.originalPrice || item.price,
        pricePerQuantity: item.pricePerQuantity || item.price,
        totalPrice: item.totalPrice || item.price,

        // Options information
        options: item.options || [],
        selectedOptions: item.selectedOptions || [],

        // Comprehensive discount information
        discount: item.discount || 0,
        itemDiscount: item.itemDiscount || item.discount || 0,

        // Comprehensive tax information
        tax: item.tax || { cash: "0", card: "0" },
        itemTax: item.itemTax || item.tax?.cash || "0",
        cashTax: item.cashTax || item.tax?.cash || "0",
        cardTax: item.cardTax || item.tax?.card || "0",
        totalTax: item.totalTax || 0,

        // Media and metadata
        pictureURL: item.pictureURL || "",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        __v: item.__v || 0,

        // Cart-specific fields
        itemSubtotal: getItemPrice(item) * item.quantity,
        itemTotalAfterDiscount: getItemFinalPrice(item) * item.quantity,
        finalItemPrice: getItemFinalPrice(item),

        // Status flags
        isNewlyAdded: item.isNewlyAdded || false,
        status: item.status || "active",
        addedAt: item.addedAt || new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      })),
      newlyAddedItems: newlyAddedItems.map((item) => ({
        // Core identification
        _id: item._id,
        itemId: item.itemId || item._id,

        // Names and display
        name: item.name,
        originalName: item.originalName || item.name,

        // Quantity
        quantity: item.quantity,

        // Admin and category information
        adminId: item.adminId || "",
        categoryId: item.categoryId || null,
        categoryName: item.categoryName || "General",

        // Menu information
        menuId: item.menuId || null,
        menuName: item.menuName || "General Items",

        // Comprehensive pricing information
        originalPrice: item.originalPrice || item.price,
        price: item.price,
        basePrice: item.basePrice || item.originalPrice || item.price,
        pricePerQuantity: item.pricePerQuantity || item.price,
        totalPrice: item.totalPrice || item.price,

        // Options information
        options: item.options || [],
        selectedOptions: item.selectedOptions || [],

        // Comprehensive discount information
        discount: item.discount || 0,
        itemDiscount: item.itemDiscount || item.discount || 0,

        // Comprehensive tax information
        tax: item.tax || { cash: "0", card: "0" },
        itemTax: item.itemTax || item.tax?.cash || "0",
        cashTax: item.cashTax || item.tax?.cash || "0",
        cardTax: item.cardTax || item.tax?.card || "0",
        totalTax: item.totalTax || 0,

        // Media and metadata
        pictureURL: item.pictureURL || "",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        __v: item.__v || 0,

        // Cart-specific fields
        itemSubtotal: getItemPrice(item) * item.quantity,
        itemTotalAfterDiscount: getItemFinalPrice(item) * item.quantity,
        finalItemPrice: getItemFinalPrice(item),

        // Status flags
        status: item.status || "active",
        addedAt: item.addedAt || new Date().toISOString(),
      })),
      newlyAddedDeals: [], // Explicitly set to empty array to prevent deal kitchen receipts
    });
  };

  // ========== SIMPLIFIED CALCULATION FUNCTIONS ==========

  // Helper function to calculate total options price for an item
  const getOptionsTotal = (item) => {
    if (!item.selectedOptions || !Array.isArray(item.selectedOptions)) return 0;
    return item.selectedOptions.reduce(
      (total, option) => total + (option.price || 0),
      0
    );
  };

  // Helper function to get item's base price (without options)
  const getItemBasePrice = (item) => {
    // Use originalPrice as the true base price, or fall back to totalPrice
    return item.originalPrice;
  };

  // Helper function to get item's full price (base + options)
  const getItemPrice = (item) => {
    const basePrice = getItemBasePrice(item);
    const optionsTotal = getOptionsTotal(item);
    return basePrice + optionsTotal;
  };

  // Helper function to get item's discount amount
  const getItemDiscount = (item) => {
    return item.discount || item.itemDiscount || 0;
  };

  // Helper function to get item's final price after discount
  const getItemFinalPrice = (item) => {
    return getItemPrice(item) - getItemDiscount(item);
  };

  // Calculate subtotal (sum of all items after their individual discounts + deals)
  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((total, item) => {
      const finalPrice = getItemFinalPrice(item);
      return total + finalPrice * item.quantity;
    }, 0);

    const dealsTotal = calculateDealAmount();
    console.log("deal amount", dealsTotal);
    return itemsTotal + dealsTotal;
  };

  // Calculate total item-level discounts
  const calculateTotalDiscount = () => {
    return orderItems.reduce((total, item) => {
      const discount = getItemDiscount(item);
      return total + discount * item.quantity;
    }, 0);
  };

  // Calculate subtotal (same as calculateTotal for consistency)
  const calculateSubtotal = () => {
    return calculateTotal();
  };
  const calculateDeliveryTotal = () => {
    console.log("abhu");
    console.log("delivery total", order.deliveryFee);

    const dealsOriginalTotal = calculateDealOriginalAmount();
    return order.deliveryFee;
  };
  // Calculate original total before any discounts (including deals original amount)
  const calculateOriginalTotal = () => {
    console.log("orginal total", orderItems);
    const itemsOriginalTotal = orderItems.reduce((total, item) => {
      const originalPrice = getItemPrice(item);
      console.log(originalPrice);
      return total + originalPrice * item.quantity;
    }, 0);

    const dealsOriginalTotal = calculateDealOriginalAmount();
    console.log("1st total", dealsOriginalTotal);
    return itemsOriginalTotal;
  };

  // Calculate total savings (item discounts + voucher discount)
  const calculateTotalSavings = () => {
    return calculateTotalDiscount() + voucherDiscount + calculateDealSavings();
  };

  // Calculate deal amounts
  const calculateDealAmount = () => {
    if (!safeOrder.deals || !safeOrder.deals.length) return 0;
    return safeOrder.deals.reduce((total, deal) => {
      return total + deal.dealPrice * deal.quantity;
    }, 0);
  };

  // Calculate deal savings
  const calculateDealSavings = () => {
    if (!safeOrder.deals || !safeOrder.deals.length) return 0;
    return safeOrder.deals.reduce((total, deal) => {
      return total + (deal.originalPrice - deal.dealPrice) * deal.quantity;
    }, 0);
  };

  // Calculate deal original amount
  const calculateDealOriginalAmount = () => {
    if (!safeOrder.deals || !safeOrder.deals.length) return 0;
    return safeOrder.deals.reduce((total, deal) => {
      return total + deal.originalPrice * deal.quantity;
    }, 0);
  };

  // Calculate tax based on payment method
  const calculateTax = (subtotal, paymentMethod) => {
    if (!paymentMethod || !orderItems.length) return 0;

    return orderItems.reduce((totalTax, item) => {
      try {
        // Get item final price after discounts
        const itemFinalPrice = getItemFinalPrice(item);
        const itemTotal = itemFinalPrice * item.quantity;

        // Get tax rate based on payment method
        let taxRate = 0;
        if (item.tax) {
          if (
            paymentMethod.toLowerCase() === "card" ||
            paymentMethod.toLowerCase() === "online"
          ) {
            const cardTax = item.tax.card || item.cardTax || "0";
            taxRate = parseFloat(cardTax.toString().replace("%", "")) / 100;
          } else if (paymentMethod.toLowerCase() === "cash") {
            const cashTax = item.tax.cash || item.cashTax || "0";
            taxRate = parseFloat(cashTax.toString().replace("%", "")) / 100;
          }
        }

        // Ensure tax rate is valid
        if (isNaN(taxRate) || !isFinite(taxRate)) {
          taxRate = 0;
        }

        const itemTax = itemTotal * taxRate;
        return totalTax + (isNaN(itemTax) ? 0 : itemTax);
      } catch (error) {
        console.error(`Tax calculation error for item ${item.name}:`, error);
        return totalTax;
      }
    }, 0);
  };

  const validateVoucher = async (code) => {
    if (!code.trim()) {
      setVoucherDiscount(0);
      setAppliedVoucher(null);
      return;
    }

    setVoucherValidating(true);
    try {
      // Get menu IDs from order items for voucher validation
      const menuIds = [
        ...new Set(orderItems.map((item) => item.menuId).filter(Boolean)),
      ];

      console.log("Validating voucher:", {
        code: code.trim(),
        orderTotal: calculateTotal(),
        menuIds: menuIds,
        orderItems: orderItems,
      });

      // Use the imported API function
      const response = await validateVoucherAPI({
        voucherCode: code.trim(),
        orderTotal: calculateTotal(),
        menuIds: menuIds,
      });

      console.log("Voucher validation response:", response);

      if (response.data.success && response.data.voucher) {
        setVoucherDiscount(response.data.discount || 0);
        setAppliedVoucher(response.data.voucher);
        enqueueSnackbar(
          `Voucher applied! Discount: Rs${response.data.discount}`,
          { variant: "success" }
        );
      } else {
        setVoucherDiscount(0);
        setAppliedVoucher(null);
        enqueueSnackbar(response.data.message || "Invalid voucher code", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Voucher validation error:", error);
      setVoucherDiscount(0);
      setAppliedVoucher(null);
      const errorMessage =
        error.response?.data?.message || "Error validating voucher";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setVoucherValidating(false);
    }
  };

  // Receipt printing handler
  const handlePrintReceipts = () => {
    const receiptData = {
      ...order,
      items: orderItems,
      orderType: order.orderType,
      customerInfo: order.customerInfo,
      paymentMethod: order.paymentMethod,
      paymentType: order.paymentType,
      totalAmount: order.totalAmount,
    };

    setReceiptData(receiptData);
    setShowPrintReceiptsModal(true);
  };

  const handleCompleteOrder = (paymentType) => {
    try {
      console.log("Starting order completion process...");
      console.log("Payment Type:", paymentType);
      console.log("Order Items:", orderItems);

      const subtotal = calculateTotal() + calculateDeliveryTotal();
      const tax = calculateTax(subtotal, paymentType);
      const finalTotal = subtotal + tax - voucherDiscount;

      console.log("Calculated values:", {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        voucherDiscount: voucherDiscount.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
      });

      // Complete the order and generate unpaid receipts
      completeOrderMutation.mutate({
        orderId: order._id,
        paymentDetails: {
          paymentMethod: paymentType,
          subtotal: subtotal,
          tax: tax,
          voucherCode: appliedVoucher?.code || null,
          voucherDiscount: voucherDiscount,
          finalTotal: finalTotal,
          items: orderItems.map((item) => ({
            _id: item._id,
            itemId: item.itemId || item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            finalItemPrice: getItemFinalPrice(item),
            options: item.selectedOptions || [],
          })),
        },
      });
    } catch (error) {
      console.error("Error in handleCompleteOrder:", error);
      enqueueSnackbar("Error completing order: " + error.message, {
        variant: "error",
      });
    }
  };

  const handleStatusChange = () => {
    updateOrderStatusMutation.mutate({
      orderId: order._id,
      paymentStatus: newPaymentStatus,
    });
  };

  // Handle direct change to paid for DINE orders
  const handleChangeToPaid = () => {
    updateOrderStatusMutation.mutate({
      orderId: order._id,
      paymentStatus: "PAID",
    });
  };

  // Handle completing DELIVERY/PICKUP orders
  const handleCompleteDeliveryPickup = () => {
    completeDeliveryPickupMutation.mutate({
      orderId: order._id,
    });
  };

  // Handle printing unpaid receipt for DELIVERY/PICKUP orders
  const handlePrintUnpaidReceipt = () => {
    generateCustomerReceiptsMutation.mutate({
      orderId: order._id,
    });
  };

  // Check if order is completed (cannot be edited)
  const isOrderCompleted = order.orderStatus === "COMPLETED";
  const canEditOrder = !isOrderCompleted;

  // Check if any operation is in progress
  const isAnyOperationInProgress =
    isCompletingOrder ||
    isPrintingUnpaidReceipt ||
    isPrintingCustomerReceipts ||
    isUpdatingOrder;

  const handlePayment = (selectedPaymentMethod = paymentMethod) => {
    paymentMutation.mutate({
      orderId: order._id,
      paymentType: selectedPaymentMethod,
      paymentMode: selectedPaymentMethod.toLowerCase(),
    });
  };

  return (
    <>
      {isFullModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-[#f5f5f5]">
                Edit Order #{safeOrder._id.slice(-6)}
              </h2>
              <button
                onClick={onClose}
                className="text-[#a0a0a0] hover:text-[#f5f5f5] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Order Info */}
              <div className="mb-6 p-4 bg-[#262626] rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#a0a0a0]">Order Type:</span>
                    <span className="ml-2 text-[#f5f5f5] font-medium">
                      {safeOrder.orderType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Status:</span>
                    <span className="ml-2 text-[#f5f5f5] font-medium">
                      {safeOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Payment Status:</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-medium ${
                          safeOrder.paymentStatus === "PAID"
                            ? "text-[#10b981]"
                            : safeOrder.paymentStatus === "UNPAID"
                            ? "text-[#ef4444]"
                            : "text-[#f5f5f5]"
                        }`}
                      >
                        {safeOrder.paymentStatus}
                      </span>
                      {isOrderCompleted && (
                        <button
                          onClick={() => {
                            setNewPaymentStatus(safeOrder.paymentStatus);
                            setShowStatusModal(true);
                          }}
                          className="text-[#f6b100] hover:text-[#e5a000] text-xs underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Payment Method:</span>
                    <div className="flex items-center space-x-2">
                      {isChangingPaymentMethod ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#f6b100]"></div>
                      ) : (
                        <span className="ml-2 text-[#f5f5f5] font-medium">
                          {selectedPaymentMethod}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setNewPaymentStatus(safeOrder.paymentStatus);
                          setShowPaymentMethodModal(true);
                        }}
                        className="text-[#f6b100] hover:text-[#e5a000] text-xs underline disabled:opacity-50"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Created:</span>
                    <span className="ml-2 text-[#f5f5f5] font-medium">
                      {new Date(
                        safeOrder.printedAt || safeOrder.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Customer:</span>
                    <span className="ml-2 text-[#f5f5f5] font-medium">
                      {safeOrder.customerInfo?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#a0a0a0]">Order Total:</span>
                    <span className="ml-2 text-[#3b82f6] font-bold">
                      Rs{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Info if present */}
                {safeOrder.customerInfo?.name && (
                  <div className="mt-3 p-2 bg-[#3b82f6]/20 border border-[#3b82f6]/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[#3b82f6] text-sm font-medium">
                        Customer:
                      </span>
                      <span className="text-[#3b82f6] font-medium">
                        {safeOrder.customerInfo.name}
                      </span>
                    </div>
                    {safeOrder.customerInfo.phone && (
                      <div className="text-[#3b82f6] text-xs">
                        Phone: {safeOrder.customerInfo.phone}
                      </div>
                    )}
                    {safeOrder.customerInfo.address && (
                      <div className="text-[#3b82f6] text-xs">
                        Address: {safeOrder.customerInfo.address}
                      </div>
                    )}
                  </div>
                )}

                {/* Voucher Info if present */}
                {safeOrder.voucherCode && (
                  <div className="mt-3 p-2 bg-[#10b981]/20 border border-[#10b981]/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[#10b981] text-sm font-medium">
                        Voucher Applied:
                      </span>
                      <span className="text-[#10b981] font-medium">
                        {safeOrder.voucherCode}
                      </span>
                    </div>
                    <div className="text-[#10b981] text-xs">
                      Discount: Rs{(safeOrder.voucherDiscount || 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              {order.kitchenReceipts && order.kitchenReceipts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">
                      Kitchen Receipts
                    </h3>
                    {newlyAddedReceipts.length > 0 && (
                      <span className="px-3 py-1 bg-[#f6b100] text-[#1f1f1f] text-sm rounded-full font-medium">
                        {newlyAddedReceipts.length} new receipt
                        {newlyAddedReceipts.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {order.kitchenReceipts.map((receipt, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          newlyAddedReceipts.includes(index)
                            ? "bg-[#f6b100]/20 border border-[#f6b100]/50"
                            : "bg-[#262626]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[#f5f5f5] font-medium">
                            Receipt #{index + 1}
                            {newlyAddedReceipts.includes(index) && (
                              <span className="ml-2 text-[#f6b100] text-xs">
                                NEW
                              </span>
                            )}
                          </h4>
                          <button
                            onClick={() => handlePrintIndividualReceipt(index)}
                            className="px-3 py-1 bg-[#f6b100] text-[#1f1f1f] rounded text-sm hover:bg-[#e5a000] transition-colors"
                          >
                            Print
                          </button>
                        </div>

                        <div className="text-sm text-[#a0a0a0]">
                          <div>
                            Items: {receipt.items ? receipt.items.length : 0}
                          </div>
                          <div>
                            Deals: {receipt.deals ? receipt.deals.length : 0}
                          </div>
                          {receipt.deals && receipt.deals.length > 0 && (
                            <div className="mt-1">
                              {receipt.deals.map((deal, dealIndex) => (
                                <div key={dealIndex} className="text-xs">
                                  • {deal.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order completion status notice */}
              {isOrderCompleted && (
                <div className="mb-4 p-3 bg-[#f59e0b]/20 border border-[#f59e0b]/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#f59e0b] text-lg">⚠️</span>
                    <div>
                      <div className="text-[#f59e0b] font-medium">
                        Order Completed
                      </div>
                      <div className="text-[#f59e0b] text-sm">
                        This order is completed. You cannot add or remove items,
                        but you can print receipts and change payment status.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Debug Information */}
              {/* <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg text-xs">
            <div className="text-[#a0a0a0] font-medium mb-2">Order Calculations:</div>
            <div className="text-[#f5f5f5] space-y-1">
              <div>Items: {orderItems.length} | New Items: {orderItems.filter(item => item.isNewlyAdded).length}</div>
              <div>Original Total: Rs{calculateOriginalTotal().toFixed(2)} | After Discounts: Rs{calculateTotal().toFixed(2)}</div>
              <div>Item Discounts: Rs{calculateTotalDiscount().toFixed(2)} | Voucher: Rs{voucherDiscount.toFixed(2)} | Deal Savings: Rs{calculateDealSavings().toFixed(2)}</div>
              <div>Total Savings: Rs{calculateTotalSavings().toFixed(2)} | Database Total: Rs{(order.totalAmount || 0).toFixed(2)}</div>
              <div>Deal Amount: Rs{calculateDealAmount().toFixed(2)} | Deal Original: Rs{calculateDealOriginalAmount().toFixed(2)}</div>
              {orderItems.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#404040]">
                  <div className="text-[#a0a0a0] font-medium mb-1">Item Breakdown:</div>
                  {orderItems.map((item, index) => (
                    <div key={index} className="text-[#f5f5f5] text-xs">
                      {item.name}: Base Rs{getItemBasePrice(item)} + Options Rs{getOptionsTotal(item)} - Discount Rs{getItemDiscount(item)} = Rs{getItemFinalPrice(item)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

              {/* Order Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">
                    Order Items
                  </h3>
                  <div className="flex items-center space-x-3">
                    {/* Auto-print toggle - disabled for completed orders and hidden for DELIVERY/PICKUP */}
                    {!(
                      order.orderType === "DELIVERY" ||
                      order.orderType === "PICKUP"
                    ) && (
                      <label
                        className={`flex items-center space-x-2 text-sm ${
                          canEditOrder ? "text-[#a0a0a0]" : "text-[#606060]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={autoPrintNewItems}
                          onChange={(e) =>
                            setAutoPrintNewItems(e.target.checked)
                          }
                          disabled={!canEditOrder}
                          className="text-[#f6b100] focus:ring-[#f6b100] rounded disabled:opacity-50"
                        />
                        <span>Auto-print new items</span>
                      </label>
                    )}
                    {/* Action Buttons - Show for all order types when editable */}
                    {canEditOrder &&
                      !(
                        order.orderType === "DELIVERY" ||
                        order.orderType === "PICKUP"
                      ) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAddItems(!showAddItems)}
                            className="px-4 py-2 rounded-lg transition-colors bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e5a000]"
                          >
                            {showAddItems ? "Hide Items" : "Add Items"}
                          </button>

                          {/* <button
                      onClick={() => handlePrintReceipts()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#10b981] text-white hover:bg-[#059669]"
                    >
                      <FaReceipt />
                      Print Receipts
                    </button> */}
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div
                      key={item._id || item.itemId}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        item.isNewlyAdded
                          ? "bg-[#f6b100]/20 border border-[#f6b100]/50"
                          : "bg-[#262626]"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-[#f5f5f5] font-medium">
                            {item.name || item.originalName}
                          </h4>
                          {item.isNewlyAdded && (
                            <span className="px-2 py-1 bg-[#f6b100] text-[#1f1f1f] text-xs rounded-full font-medium">
                              NEW
                            </span>
                          )}
                          {item.status === "active" && (
                            <span className="px-2 py-1 bg-[#10b981] text-white text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Menu and Category Info */}
                        <div className="flex items-center space-x-3 mb-2">
                          {item.menuName &&
                            item.menuName !== "General Items" && (
                              <span className="text-[#f6b100] text-xs bg-[#f6b100]/20 px-2 py-1 rounded">
                                📋 {item.menuName}
                              </span>
                            )}
                          {item.categoryName &&
                            item.categoryName !== "General" && (
                              <span className="text-[#3b82f6] text-xs bg-[#3b82f6]/20 px-2 py-1 rounded">
                                🏷️ {item.categoryName}
                              </span>
                            )}
                        </div>

                        {/* Enhanced Price Display with Options */}
                        <div className="space-y-1">
                          {/* Base price + options breakdown */}
                          <div className="flex items-center space-x-2">
                            <span className="text-[#a0a0a0] text-xs">
                              Base:
                            </span>
                            <span className="text-[#a0a0a0] text-sm">
                              Rs{getItemBasePrice(item).toFixed(2)}
                            </span>

                            {getOptionsTotal(item) > 0 && (
                              <>
                                <span className="text-[#f6b100] text-xs">
                                  + Options:
                                </span>
                                <span className="text-[#f6b100] text-sm">
                                  Rs{getOptionsTotal(item).toFixed(2)}
                                </span>
                              </>
                            )}

                            {getItemDiscount(item) > 0 && (
                              <>
                                <span className="text-[#ef4444] text-xs">
                                  - Discount:
                                </span>
                                <span className="text-[#ef4444] text-sm">
                                  Rs{getItemDiscount(item).toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Final price line */}
                          <div className="flex items-center space-x-2">
                            <span className="text-[#f5f5f5] text-sm font-medium">
                              Final: Rs{getItemFinalPrice(item).toFixed(2)}
                            </span>
                            {getItemDiscount(item) > 0 && (
                              <span className="text-[#10b981] text-xs bg-[#10b981]/20 px-1 rounded">
                                Save Rs{getItemDiscount(item)}
                              </span>
                            )}
                          </div>

                          {/* Tax info (simplified) */}
                          {item.tax &&
                            (item.tax.cash !== "0" ||
                              item.tax.card !== "0") && (
                              <div className="text-[#3b82f6] text-xs">
                                💰 Tax: Cash {item.tax.cash}% | Card{" "}
                                {item.tax.card}%
                              </div>
                            )}
                        </div>

                        {/* Options Display */}

                        {/* Selected Options */}
                        {item.selectedOptions &&
                          item.selectedOptions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[#a0a0a0] text-xs">
                                Selected Options:
                              </p>
                              {item.selectedOptions.map((option, index) => (
                                <p
                                  key={index}
                                  className="text-[#10b981] text-xs ml-2"
                                >
                                  ✓ {option.name} (+Rs{option.price || 0})
                                </p>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {/* Quantity */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[#f5f5f5] font-medium text-sm">
                            Qty: {item.quantity}
                          </span>
                        </div>

                        {/* Simplified Total Price */}
                        <div className="text-right">
                          <div className="text-[#f5f5f5] font-bold text-lg">
                            Rs
                            {(getItemFinalPrice(item) * item.quantity).toFixed(
                              2
                            )}
                          </div>
                          {getItemDiscount(item) > 0 && (
                            <div className="text-[#ef4444] text-xs">
                              Save Rs
                              {(getItemDiscount(item) * item.quantity).toFixed(
                                2
                              )}
                            </div>
                          )}
                        </div>

                        {/* Item Status Indicators */}
                        <div className="flex items-center space-x-1">
                          {item.pictureURL && (
                            <span className="text-[#f6b100] text-xs">🖼️</span>
                          )}
                          {item.menuLogo && (
                            <span className="text-[#3b82f6] text-xs">🏪</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {orderItems.length === 0 &&
                  (!safeOrder.deals || safeOrder.deals.length === 0) && (
                    <div className="text-center py-8 text-[#606060]">
                      No items or deals in order. Add some items or deals to
                      continue.
                    </div>
                  )}
              </div>

              {/* Order Deals */}
              {safeOrder.deals && safeOrder.deals.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">
                      Applied Deals
                    </h3>
                    <span className="px-3 py-1 bg-[#f6b100]/20 text-[#f6b100] text-sm rounded-full">
                      {(safeOrder.deals || []).length} deal
                      {(safeOrder.deals || []).length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(safeOrder.deals || []).map((deal, index) => {
                      // Debug logging to see deal structure
                      console.log(`=== DEAL ${index} DEBUG ===`);
                      console.log("Deal object:", deal);
                      console.log("Deal items:", deal.items);
                      if (deal.items && deal.items.length > 0) {
                        console.log("First deal item:", deal.items[0]);
                        console.log(
                          "First deal item selectedOptions:",
                          deal.items[0].selectedOptions
                        );
                      }
                      console.log(`=== END DEAL ${index} DEBUG ===`);

                      return (
                        <div
                          key={deal.dealId || index}
                          className="bg-[#f6b100]/10 border border-[#f6b100]/30 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-[#f6b100] text-lg">🏷️</span>
                              <h4 className="text-[#f5f5f5] font-medium">
                                {deal.name}
                              </h4>
                              <span className="px-2 py-1 bg-[#f6b100] text-[#1f1f1f] text-xs rounded-full font-medium">
                                DEAL
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-[#f5f5f5] font-bold text-lg">
                                Rs{(deal.dealPrice * deal.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="text-[#a0a0a0]">
                                Quantity:{" "}
                                <span className="text-[#f5f5f5] font-medium">
                                  {deal.quantity}
                                </span>
                              </span>
                            </div>
                          </div>
                          {console.log("deal items", deal)}
                          {/* Deal Items */}
                          {deal.items && deal.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#f6b100]/20">
                              <p className="text-[#a0a0a0] text-xs mb-2">
                                Included Items:
                              </p>
                              <div className="space-y-2">
                                {deal.items.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="bg-[#262626] text-[#f5f5f5] text-xs p-2 rounded"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {item.name}
                                      </span>
                                      <span className="text-[#a0a0a0]">
                                        ({item.quantity}x)
                                      </span>
                                    </div>

                                    {/* Show selected options for deal items */}
                                    {item.selectedOptions &&
                                      item.selectedOptions.length > 0 && (
                                        <div className="mt-1 pl-2 border-l-2 border-[#f6b100]/30">
                                          <p className="text-[#a0a0a0] text-xs mb-1">
                                            Selected Options:
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {item.selectedOptions.map(
                                              (option, optionIndex) => (
                                                <span
                                                  key={optionIndex}
                                                  className="bg-[#f6b100]/20 text-[#f6b100] text-xs px-1 py-0.5 rounded"
                                                >
                                                  {typeof option === "string"
                                                    ? option
                                                    : option.name}
                                                  {option.price &&
                                                    option.price > 0 &&
                                                    ` (+Rs${option.price})`}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Deal Customizations */}
                  </div>

                  {/* Deals Summary */}
                  <div className="mt-4 p-3 bg-[#262626] rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[#a0a0a0] font-medium">
                        Total Deals Value:
                      </span>
                      <span className="text-[#f6b100] font-bold">
                        Rs
                        {(safeOrder.deals || [])
                          .reduce(
                            (sum, deal) => sum + deal.dealPrice * deal.quantity,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Items Section - disabled for completed orders and DELIVERY/PICKUP orders */}
              {showAddItems &&
                canEditOrder &&
                !(
                  order.orderType === "DELIVERY" || order.orderType === "PICKUP"
                ) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">
                      Available Items
                    </h3>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {availableItems.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleAddItem(item)}
                          className="p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[#f5f5f5] font-medium">
                              {item.name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {item.discount && item.discount > 0 && (
                                <span className="text-[#ef4444] text-xs bg-[#ef4444]/20 px-1 rounded">
                                  -{item.discount}
                                </span>
                              )}
                              {item.options && item.options.length > 0 && (
                                <span className="text-[#f6b100] text-xs bg-[#f6b100]/20 px-1 rounded">
                                  +Options
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price display with discount */}
                          {item.discount && item.discount > 0 ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-[#a0a0a0] text-sm line-through">
                                Rs{item.price}
                              </span>
                              <span className="text-[#10b981] text-sm font-medium">
                                Rs{(item.price - item.discount).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[#a0a0a0] text-sm">
                              Rs{item.price}
                            </p>
                          )}

                          {item.options && item.options.length > 0 && (
                            <p className="text-[#606060] text-xs mt-1">
                              {item.options.length} option(s) available
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Simplified Order Totals */}
              <div className="mb-6 space-y-3">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">
                  Order Summary
                </h3>

                {/* Single comprehensive total display */}
                <div className="p-4 bg-[#262626] rounded-lg">
                  <div className="space-y-3">
                    {/* Original total */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#a0a0a0]">Original Total:</span>
                      <span className="text-[#a0a0a0] font-medium">
                        Rs{calculateOriginalTotal().toFixed(2)}
                      </span>
                    </div>
                    {console.log("meow 1", order)}

                    {/* Item discounts */}
                    {calculateTotalDiscount() > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#ef4444]">Item Discounts:</span>
                        <span className="text-[#ef4444] font-medium">
                          -Rs{calculateTotalDiscount().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Voucher discount */}
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#10b981]">
                          Voucher Discount:
                        </span>
                        <span className="text-[#10b981] font-medium">
                          -Rs{voucherDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Deal discounts */}
                    {calculateDealSavings() > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b5cf6]">Deal Savings:</span>
                        <span className="text-[#8b5cf6] font-medium">
                          -Rs{calculateDealSavings().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Final subtotal */}
                    <div className="border-t border-[#404040] pt-3 flex justify-between items-center">
                      <span className="text-[#f5f5f5] font-medium text-lg">
                        Subtotal:
                      </span>
                      <span className="text-[#f5f5f5] font-bold text-xl">
                        Rs{calculateTotal().toFixed(2)}
                      </span>
                    </div>

                    {/* Total savings summary */}
                    {calculateTotalSavings() > 0 && (
                      <div className="flex justify-between items-center text-sm bg-[#10b981]/20 -mx-4 -mb-4 mt-3 p-3 rounded-b-lg">
                        <span className="text-[#10b981] font-medium">
                          🎉 You Save:
                        </span>
                        <span className="text-[#10b981] font-bold">
                          Rs{calculateTotalSavings().toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complete Order Section */}
                {showCompleteOrderSection && (
                  <div className="mt-6 p-6 bg-[#262626] rounded-lg border-t border-[#404040]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#f5f5f5]">
                        Complete Order
                      </h3>
                      <button
                        onClick={() => {
                          setShowCompleteOrderSection(false);
                          setVoucherCode("");
                          setVoucherDiscount(0);
                          setAppliedVoucher(null);
                        }}
                        className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
                      >
                        ×
                      </button>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                      <h4 className="text-[#f5f5f5] font-medium mb-3">
                        Order Summaryys
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#a0a0a0]">
                            Original Total:
                          </span>
                          <span className="text-[#a0a0a0]">
                            Rs{calculateOriginalTotal().toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#a0a0a0]">
                            Item Discounts:
                          </span>
                          <span className="text-[#ef4444]">
                            -Rs{calculateTotalDiscount().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a0a0a0]">Subtotal:</span>
                          <span className="text-[#f5f5f5]">
                            Rs{calculateTotal().toFixed(2)}
                          </span>
                        </div>
                        {voucherDiscount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">
                              Voucher Discount:
                            </span>
                            <span className="text-[#10b981]">
                              -Rs{voucherDiscount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[#a0a0a0]">
                            Tax ({paymentMethod}):
                          </span>
                          <span className="text-[#f5f5f5]">
                            Rs
                            {calculateTax(
                              calculateTotal(),
                              paymentMethod
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-[#404040] pt-2 flex justify-between font-bold">
                          <span className="text-[#f5f5f5]">Final Total:</span>
                          <span className="text-[#f6b100]">
                            Rs
                            {(
                              calculateTotal() +
                              calculateTax(calculateTotal(), paymentMethod) -
                              voucherDiscount
                            ).toFixed(2)}
                          </span>
                        </div>
                        {calculateTotalSavings() > 0 && (
                          <div className="flex justify-between text-[#10b981] font-medium">
                            <span>Total Savings:</span>
                            <span>Rs{calculateTotalSavings().toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Voucher Section */}
                    <div className="mb-6">
                      <label className="block text-[#f5f5f5] font-medium mb-2">
                        Voucher Code (Optional)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) =>
                            setVoucherCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter voucher code"
                          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#606060] focus:outline-none focus:border-[#f6b100]"
                        />
                        <button
                          onClick={() => validateVoucher(voucherCode)}
                          disabled={voucherValidating || !voucherCode.trim()}
                          className="px-4 py-2 bg-[#f6b100] text-[#1f1f1f] rounded-lg hover:bg-[#e5a000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {voucherValidating ? "..." : "Apply"}
                        </button>
                      </div>

                      {appliedVoucher && (
                        <div className="mt-2 p-2 bg-[#10b981]/20 border border-[#10b981]/50 rounded-lg">
                          <div className="text-[#10b981] text-sm font-medium">
                            ✓ Voucher "{appliedVoucher.code}" applied
                          </div>
                          <div className="text-[#10b981] text-xs">
                            Discount: Rs{voucherDiscount.toFixed(2)}
                            {appliedVoucher.description &&
                              ` - ${appliedVoucher.description}`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-6">
                      <label className="block text-[#f5f5f5] font-medium mb-3">
                        Select Payment Method
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: "CASH", label: "Cash Payment", icon: "💵" },
                          { value: "CARD", label: "Card Payment", icon: "💳" },
                          {
                            value: "ONLINE",
                            label: "Online Payment",
                            icon: "📱",
                          },
                          {
                            value: "CASH ON DELIVERY",
                            label: "Cash on Delivery",
                            icon: "🛵",
                          },
                          {
                            value: "CASH ON ARRIVAL",
                            label: "Cash On Arrival",
                            icon: "👋",
                          },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="completePaymentMethod"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="text-[#f6b100] focus:ring-[#f6b100]"
                            />
                            <span className="text-lg">{method.icon}</span>
                            <div className="flex-1">
                              <span className="text-[#f5f5f5] font-medium">
                                {method.label}
                              </span>
                              <div className="text-xs text-[#a0a0a0]">
                                Tax: Rs
                                {calculateTax(
                                  calculateTotal(),
                                  method.value
                                ).toFixed(2)}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowCompleteOrderSection(false);
                          setVoucherCode("");
                          setVoucherDiscount(0);
                          setAppliedVoucher(null);
                        }}
                        className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCompleteOrder(paymentMethod)}
                        disabled={isCompletingOrder || isUpdatingOrder}
                        className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                          isCompletingOrder || isUpdatingOrder
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                        }`}
                      >
                        {isCompletingOrder ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          `Complete Order - Rs${(
                            calculateTotal() +
                            calculateTax(calculateTotal(), paymentMethod) -
                            voucherDiscount
                          ).toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-[#2a2a2a] bg-[#1a1a1a]">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
              >
                Cancel
              </button>

              <div className="flex space-x-3">
                {/* Complete Order Button */}
                {order.orderStatus === "IN_PROGRESS" && (
                  <button
                    onClick={() => setShowCompleteOrderSection(true)}
                    className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          </div>

          {showPrintReceiptsModal &&
            (console.log(
              "Opening print receipts modal with data:",
              receiptData
            ),
            (
              <PrintReceiptsModal
                isOpen={showPrintReceiptsModal}
                onClose={() => setShowPrintReceiptsModal(false)}
                orderData={receiptData}
                orderType={order.orderType || "DINE"}
                customerReceipts={receiptData?.customerReceipts || []}
                kitchenReceipts={receiptData?.kitchenReceipts || []}
              />
            ))}

          {/* New Kitchen Receipts Modal */}
          {showNewKitchenReceiptsModal && (
            <PrintReceiptsModal
              isOpen={showNewKitchenReceiptsModal}
              onClose={() => {
                console.log("Closing new kitchen receipts modal");
                setShowNewKitchenReceiptsModal(false);
                // Clear new kitchen receipts after printing
                setNewKitchenReceipts([]);
                // Clear newly added flags after printing kitchen receipts
                setOrderItems((prev) =>
                  prev.map((item) => ({ ...item, isNewlyAdded: false }))
                );
              }}
              orderData={{
                ...safeOrder,
                items: orderItems.filter((item) => item.isNewlyAdded),
                deals: [], // Exclude deals from new kitchen receipts - only show newly added items
              }}
              orderType={safeOrder.orderType || "DINE"}
              customerReceipts={[]}
              kitchenReceipts={newKitchenReceipts.filter(
                (receipt) => !receipt.isDealReceipt
              )}
              isNewlyAddedOnly={true}
            />
          )}

          {/* Options Selection Modal */}
          {showOptionsModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    Select Options for {selectedItem.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowOptionsModal(false);
                      setSelectedItem(null);
                      setSelectedOptions([]);
                    }}
                    className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-3 bg-[#262626] rounded-lg">
                  <div className="text-[#f5f5f5] font-medium">
                    {selectedItem.name}
                  </div>
                  <div className="text-[#a0a0a0] text-sm">
                    Base Price: Rs{selectedItem.price}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="text-[#f5f5f5] font-medium">
                    Available Options:
                  </h4>
                  {selectedItem.options && selectedItem.options.length > 0 ? (
                    selectedItem.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedOptions.some(
                              (opt) => opt.name === option.name
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOptions((prev) => [...prev, option]);
                              } else {
                                setSelectedOptions((prev) =>
                                  prev.filter((opt) => opt.name !== option.name)
                                );
                              }
                            }}
                            className="text-[#f6b100] focus:ring-[#f6b100]"
                          />
                          <span className="text-[#f5f5f5] font-medium">
                            {option.name}
                          </span>
                        </div>
                        <span className="text-[#f6b100] font-medium">
                          +Rs{option.price || 0}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-[#a0a0a0] text-sm text-center py-4">
                      No options available for this item
                    </div>
                  )}
                </div>

                {selectedOptions.length > 0 && (
                  <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg">
                    <div className="text-[#f5f5f5] font-medium mb-2">
                      Selected Options:
                    </div>
                    {selectedOptions.map((option, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-[#a0a0a0]">{option.name}</span>
                        <span className="text-[#f6b100]">
                          +Rs{option.price || 0}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-[#404040] mt-2 pt-2 flex justify-between font-medium">
                      <span className="text-[#f5f5f5]">Total Price:</span>
                      <span className="text-[#f6b100]">
                        Rs
                        {selectedItem.price +
                          selectedOptions.reduce(
                            (sum, opt) => sum + (opt.price || 0),
                            0
                          )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowOptionsModal(false);
                      setSelectedItem(null);
                      setSelectedOptions([]);
                    }}
                    className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOptionsConfirm}
                    className="px-4 py-2 bg-[#f6b100] text-[#1f1f1f] rounded-lg hover:bg-[#e5a000] transition-colors"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPaymentMethodModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    Select Payment Method
                  </h3>
                  <button
                    onClick={() => setShowPaymentMethodModal(false)}
                    disabled={isChangingPaymentMethod} // Disable close during mutation
                    className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { value: "CASH", label: "Cash Payment", icon: "💵" },
                    { value: "CARD", label: "Card Payment", icon: "💳" },
                    { value: "ONLINE", label: "Online Payment", icon: "📱" },
                    {
                      value: "CASH ON DELIVERY",
                      label: "Cash on Delivery",
                      icon: "🛵",
                    },
                    {
                      value: "CASH ON ARRIVAL",
                      label: "Cash On Arrival",
                      icon: "👋",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center space-x-3 p-3 bg-[#262626] rounded-lg transition-colors ${
                        isChangingPaymentMethod
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#404040] cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={selectedPaymentMethod === method.value}
                        onChange={() => handlePaymentMethodSelect(method.value)}
                        disabled={isChangingPaymentMethod} // Disable during mutation
                        className="text-[#f6b100] focus:ring-[#f6b100]"
                      />
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-[#f5f5f5] font-medium">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentMethodModal(false)}
                    disabled={isChangingPaymentMethod} // Disable during mutation
                    className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentMethodConfirm}
                    disabled={isChangingPaymentMethod} // Disable during mutation
                    className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                  >
                    {isChangingPaymentMethod ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Complete Order Modal */}
          {showCompleteOrderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    Complete Order
                  </h3>
                  <button
                    onClick={() => {
                      setShowCompleteOrderModal(false);
                      setVoucherCode("");
                      setVoucherDiscount(0);
                      setAppliedVoucher(null);
                    }}
                    className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-[#262626] rounded-lg">
                  <h4 className="text-[#f5f5f5] font-medium mb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0]">Original Total:</span>
                      <span className="text-[#a0a0a0]">
                        Rs{calculateOriginalTotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0]">Item Discounts:</span>
                      <span className="text-[#ef4444]">
                        -Rs{calculateTotalDiscount().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0]">Subtotal:</span>
                      <span className="text-[#f5f5f5]">
                        Rs{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#a0a0a0]">
                          Voucher Discount:
                        </span>
                        <span className="text-[#10b981]">
                          -Rs{voucherDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0]">
                        Tax ({paymentMethod}):
                      </span>
                      <span className="text-[#f5f5f5]">
                        Rs
                        {calculateTax(calculateTotal(), paymentMethod).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="border-t border-[#404040] pt-2 flex justify-between font-bold">
                      <span className="text-[#f5f5f5]">Final Total:</span>
                      <span className="text-[#f6b100]">
                        Rs
                        {(
                          calculateTotal() +
                          calculateTax(calculateTotal(), paymentMethod) -
                          voucherDiscount
                        ).toFixed(2)}
                      </span>
                    </div>
                    {calculateTotalSavings() > 0 && (
                      <div className="flex justify-between text-[#10b981] font-medium">
                        <span>Total Savings:</span>
                        <span>Rs{calculateTotalSavings().toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voucher Section */}
                <div className="mb-6">
                  <label className="block text-[#f5f5f5] font-medium mb-2">
                    Voucher Code (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter voucher code"
                      className="flex-1 px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#606060] focus:outline-none focus:border-[#f6b100]"
                    />
                    <button
                      onClick={() => validateVoucher(voucherCode)}
                      disabled={voucherValidating || !voucherCode.trim()}
                      className="px-4 py-2 bg-[#f6b100] text-[#1f1f1f] rounded-lg hover:bg-[#e5a000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {voucherValidating ? "..." : "Apply"}
                    </button>
                  </div>

                  {appliedVoucher && (
                    <div className="mt-2 p-2 bg-[#10b981]/20 border border-[#10b981]/50 rounded-lg">
                      <div className="text-[#10b981] text-sm font-medium">
                        ✓ Voucher "{appliedVoucher.code}" applied
                      </div>
                      <div className="text-[#10b981] text-xs">
                        Discount: Rs{voucherDiscount.toFixed(2)}
                        {appliedVoucher.description &&
                          ` - ${appliedVoucher.description}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-[#f5f5f5] font-medium mb-3">
                    Select Payment Method
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "CASH", label: "Cash Payment", icon: "💵" },
                      { value: "CARD", label: "Card Payment", icon: "💳" },
                      { value: "ONLINE", label: "Online Payment", icon: "📱" },
                      {
                        value: "CASH ON DELIVERY",
                        label: "Cash on Delivery",
                        icon: "🛵",
                      },
                      {
                        value: "CASH ON ARRIVAL",
                        label: "Cash On Arrival",
                        icon: "👋",
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className="flex items-center space-x-3 p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="completePaymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-[#f6b100] focus:ring-[#f6b100]"
                        />
                        <span className="text-lg">{method.icon}</span>
                        <div className="flex-1">
                          <span className="text-[#f5f5f5] font-medium">
                            {method.label}
                          </span>
                          <div className="text-xs text-[#a0a0a0]">
                            Tax: Rs
                            {calculateTax(
                              calculateTotal(),
                              method.value
                            ).toFixed(2)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCompleteOrderModal(false);
                      setVoucherCode("");
                      setVoucherDiscount(0);
                      setAppliedVoucher(null);
                    }}
                    className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompleteOrder(paymentMethod)}
                    className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
                  >
                    Complete Order - Rs
                    {(
                      calculateTotal() +
                      calculateTax(calculateTotal(), paymentMethod) -
                      voucherDiscount
                    ).toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status Change Modal */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    Change Payment Status
                  </h3>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-6">
                  <div className="text-[#f5f5f5] mb-4">
                    Current Status:{" "}
                    <span
                      className={`font-bold ${
                        order.paymentStatus === "PAID"
                          ? "text-[#10b981]"
                          : "text-[#ef4444]"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="PAID"
                        checked={newPaymentStatus === "PAID"}
                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                        className="text-[#10b981] focus:ring-[#10b981]"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">✅</span>
                        <span className="text-[#f5f5f5] font-medium">PAID</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="UNPAID"
                        checked={newPaymentStatus === "UNPAID"}
                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                        className="text-[#ef4444] focus:ring-[#ef4444]"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">❌</span>
                        <span className="text-[#f5f5f5] font-medium">
                          UNPAID
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={
                      updateOrderStatusMutation.isLoading ||
                      newPaymentStatus === order.paymentStatus
                    }
                    className="px-6 py-2 bg-[#f6b100] text-[#1f1f1f] rounded-lg hover:bg-[#e5a000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateOrderStatusMutation.isLoading
                      ? "Updating..."
                      : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPaymentMethodModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
              <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    Select Payment Method
                  </h3>
                  <button
                    onClick={() => setShowPaymentMethodModal(false)}
                    className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { value: "CASH", label: "Cash Payment", icon: "💵" },
                    { value: "CARD", label: "Card Payment", icon: "💳" },
                    { value: "ONLINE", label: "Online Payment", icon: "📱" },
                    {
                      value: "CASH ON DELIVERY",
                      label: "Cash on Delivery",
                      icon: "🛵",
                    },
                    {
                      value: "CASH ON ARRIVAL",
                      label: "Cash On Arrival",
                      icon: "👋",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center space-x-3 p-3 bg-[#262626] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={selectedPaymentMethod === method.value}
                        onChange={() => handlePaymentMethodSelect(method.value)}
                        className="text-[#f6b100] focus:ring-[#f6b100]"
                      />
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-[#f5f5f5] font-medium">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentMethodModal(false)}
                    className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
                    disabled={isChangingPaymentMethod} // prevent closing during loading
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handlePaymentMethodConfirm}
                    className={`px-4 py-2 flex items-center justify-center rounded-lg transition-colors ${
                      isChangingPaymentMethod
                        ? "bg-[#10b981] opacity-80 cursor-not-allowed"
                        : "bg-[#10b981] hover:bg-[#059669]"
                    } text-white`}
                    disabled={isChangingPaymentMethod}
                  >
                    {isChangingPaymentMethod ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="mt-6 p-6 bg-[#262626] overflow-y-auto max-h-[90vh] rounded-lg border-t border-[#404040]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#f5f5f5]">
                Complete Order
              </h3>
              <button
                onClick={() => {
                  setShowCompleteOrderSection(false);
                  setVoucherCode("");
                  setVoucherDiscount(0);
                  setAppliedVoucher(null);
                  onClose();
                }}
                className="text-[#a0a0a0] hover:text-[#f5f5f5] text-xl"
              >
                ×
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
              <h4 className="text-[#f5f5f5] font-medium mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Item Total:</span>
                  <span className="text-[#a0a0a0]">
                    Rs{calculateOriginalTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Deals Total:</span>
                  <span className="text-[#a0a0a0]">
                    Rs{calculateDealAmount().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Delivery Fees:</span>
                  <span className="text-[#a0a0a0]">
                    Rs{calculateDeliveryTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Item Discounts:</span>
                  <span className="text-[#ef4444]">
                    -Rs{calculateTotalDiscount().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Subtotal:</span>
                  <span className="text-[#f5f5f5]">
                    Rs{calculateTotal() + calculateDeliveryTotal()}
                  </span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Voucher Discount:</span>
                    <span className="text-[#10b981]">
                      -Rs{voucherDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Tax ({paymentMethod}):</span>
                  <span className="text-[#f5f5f5]">
                    Rs{calculateTax(calculateTotal(), paymentMethod).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-[#404040] pt-2 flex justify-between font-bold">
                  <span className="text-[#f5f5f5]">Final Total:</span>
                  <span className="text-[#f6b100]">
                    Rs
                    {(
                      calculateTotal() +
                      calculateDeliveryTotal() +
                      calculateTax(calculateTotal(), paymentMethod) -
                      voucherDiscount
                    ).toFixed(2)}
                  </span>
                </div>
                {calculateTotalSavings() > 0 && (
                  <div className="flex justify-between text-[#10b981] font-medium">
                    <span>Total Savings:</span>
                    <span>Rs{calculateTotalSavings().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Voucher Section */}
            <div className="mb-6">
              <label className="block text-[#f5f5f5] font-medium mb-2">
                Voucher Code (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Enter voucher code"
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#606060] focus:outline-none focus:border-[#f6b100]"
                />
                <button
                  onClick={() => validateVoucher(voucherCode)}
                  disabled={voucherValidating || !voucherCode.trim()}
                  className="px-4 py-2 bg-[#f6b100] text-[#1f1f1f] rounded-lg hover:bg-[#e5a000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voucherValidating ? "..." : "Apply"}
                </button>
              </div>

              {appliedVoucher && (
                <div className="mt-2 p-2 bg-[#10b981]/20 border border-[#10b981]/50 rounded-lg">
                  <div className="text-[#10b981] text-sm font-medium">
                    ✓ Voucher "{appliedVoucher.code}" applied
                  </div>
                  <div className="text-[#10b981] text-xs">
                    Discount: Rs{voucherDiscount.toFixed(2)}
                    {appliedVoucher.description &&
                      ` - ${appliedVoucher.description}`}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-[#f5f5f5] font-medium mb-3">
                Select Payment Method
              </label>
              <div className="space-y-3">
                {[
                  { value: "CASH", label: "Cash Payment", icon: "💵" },
                  { value: "CARD", label: "Card Payment", icon: "💳" },
                  { value: "ONLINE", label: "Online Payment", icon: "📱" },
                  {
                    value: "CASH ON DELIVERY",
                    label: "Cash on Delivery",
                    icon: "🛵",
                  },
                  {
                    value: "CASH ON ARRIVAL",
                    label: "Cash On Arrival",
                    icon: "👋",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#404040] transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="completePaymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-[#f6b100] focus:ring-[#f6b100]"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <div className="flex-1">
                      <span className="text-[#f5f5f5] font-medium">
                        {method.label}
                      </span>
                      <div className="text-xs text-[#a0a0a0]">
                        Tax: Rs
                        {calculateTax(calculateTotal(), method.value).toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCompleteOrderSection(false);
                  setVoucherCode("");
                  setVoucherDiscount(0);
                  onClose();
                  setAppliedVoucher(null);
                }}
                className="px-4 py-2 bg-[#404040] text-[#f5f5f5] rounded-lg hover:bg-[#505050] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteOrder(paymentMethod)}
                disabled={isCompletingOrder || isUpdatingOrder}
                className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isCompletingOrder || isUpdatingOrder
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                }`}
              >
                {isCompletingOrder ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Complete Order - Rs${(
                    calculateTotal() +
                    calculateDeliveryTotal() +
                    calculateTax(calculateTotal(), paymentMethod) -
                    voucherDiscount
                  ).toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditOrderModal;
