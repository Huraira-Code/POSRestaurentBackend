import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  // addOrder,
  updateTable,
  createOrder,
  updateOrderNew,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import PrintReceiptsModal from "../receipt/PrintReceiptsModal";
import DealSelector from "./DealSelector";
import { FaSpinner, FaTag } from "react-icons/fa";

import {
  addDealToCart,
  removeDealFromCart,
  updateDealQuantity,
  clearDeals,
} from "../../redux/slices/dealSlice";
import UpdateOrderModal from "./updateOrderModal";

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const dealsData = useSelector((state) => state.deals.deals ?? []);
  console.log("deal data shamim", dealsData);
  const total = useSelector(getTotalPrice);

  const [showInvoice, setShowInvoice] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [showPrintReceiptsModal, setShowPrintReceiptsModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState();
  const [orderReceiptData, setOrderReceiptData] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState("abc");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [updateOrderMode, setUpdateOrderMode] = useState(false);
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  // Add instruction state
  const [instructions, setInstructions] = useState("");
  // Add delivery fee state
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Deal-related state
  // const [selectedDeals, setSelectedDeals] = useState([]);
  const [showDealSelector, setShowDealSelector] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Deal calculation functions (moved before usage)
  const getDealsTotal = () => {
    console.log("deal data huraira", dealsData);

    return dealsData.reduce((sum, deal) => {
      // base price
      let dealTotal = deal.dealPrice;

      // add selected customizations price
      if (deal.selectedCustomizations) {
        for (const key in deal.selectedCustomizations) {
          const selectedOptions = deal.selectedCustomizations[key];
          dealTotal += selectedOptions.reduce(
            (optSum, option) => optSum + (option.price || 0),
            0
          );
        }
      }

      // multiply by quantity
      return sum + dealTotal * deal.quantity;
    }, 0);
  };

  const getDealsSavings = () => {
    return dealsData.reduce((sum, deal) => {
      const savingsPerDeal = deal.originalPrice - deal.dealPrice;
      return sum + savingsPerDeal * deal.quantity;
    }, 0);
  };

  // Calculate totals after state declarations
  const totalPriceWithTax = total;
  const dealsTotal = getDealsTotal();
  const dealsSavings = getDealsSavings();
  const grandTotal =
    totalPriceWithTax +
    dealsTotal +
    (selectedOrderType === "DELIVERY" ? deliveryFee : 0);

  // Automatically set payment mode to "online" when payment type is "online"
  useEffect(() => {
    if (paymentType === "online") {
      setPaymentMode("online");
    } else if (paymentType === "cod" || paymentType === "on_arrival") {
      // Reset to cash for non-online payment types
      setPaymentMode("cash");
    }
  }, [paymentType]);

  // Reset delivery fee when order type changes
  useEffect(() => {
    if (selectedOrderType !== "DELIVERY") {
      setDeliveryFee(0);
    }
  }, [selectedOrderType]);

  // Group cart items by menu
  const groupItemsByMenu = () => {
    const grouped = {};
    cartData.forEach((item) => {
      const menuName = item.menuName || "General Items";
      if (!grouped[menuName]) {
        grouped[menuName] = [];
      }
      grouped[menuName].push(item);
    });
    return grouped;
  };

  const groupedCartItems = groupItemsByMenu();

  const handlePlaceOrder = async () => {
    // Just open the order type modal - no validation needed here
    setShowOrderTypeModal(true);
  };

  // Deal handlers
  const handleSelectDeals = () => {
    setShowDealSelector(true);
  };

  const removeDeal = (dealId) => {
    dispatch(removeDealFromCart(dealId));
  };

  // Enhanced receipt printing function
  const showReceiptOptions = (orderData, orderType) => {
    console.log("=== SHOW RECEIPT OPTIONS DEBUG ===");
    console.log("orderData received:", orderData);
    console.log("orderData.kitchenReceipts:", orderData.kitchenReceipts);
    console.log("orderData.customerReceipts:", orderData.customerReceipts);
    console.log("orderData.items:", orderData.items);
    console.log("orderData.deals:", orderData.deals);
    if (orderData.deals && orderData.deals.length > 0) {
      console.log("First deal structure:", orderData.deals[0]);
      console.log("First deal items:", orderData.deals[0].items);
    }

    console.log("cartData:", cartData);

    // Set the receipt data and open the modal
    const receiptData = {
      ...orderData,
      // Ensure order ID is available for receipt display
      _id: orderData._id || orderData.orderId || orderData.id,
      orderType,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        table: orderType === "DINE" ? customerName : null,
      },
      paymentType,
      paymentMode,
      // Preserve kitchen and customer receipts from backend
      kitchenReceipts: orderData.kitchenReceipts || [],
      customerReceipts: orderData.customerReceipts || [],
      // Use backend items if available, otherwise fallback to cartData
      items:
        orderData.items ||
        cartData.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.pricePerQuantity,
          totalPrice: item.pricePerQuantity * item.quantity,
          options: item.selectedOptions || [],
          basePrice: item.basePrice,
        })),
      // Include deals data for receipt processing
      deals:
        orderData.deals ||
        dealsData.map((deal) => ({
          _id: deal._id || deal.dealId,
          dealId: deal.dealId || deal._id,
          name: deal.name,
          dealPrice: deal.dealPrice || deal.price,
          originalPrice: deal.originalPrice,
          quantity: deal.quantity,
          savings: deal.savings || deal.originalPrice - deal.dealPrice,
          items: (deal.items || []).map((item) => ({
            name:
              item.name ||
              item.itemName ||
              (item.itemId && item.itemId.name) ||
              "Unknown Item",
            quantity: item.quantity || 1,
            itemId: item.itemId || item._id,
          })),
        })),
      totalAmount: orderData.totalAmount || grandTotal,
      // Include instructions in receipt data
      instructions: orderData.instructions || instructions,
      // Include delivery fee in receipt data
      deliveryFee: orderData.deliveryFee || deliveryFee,
    };

    console.log("Final receiptData being set:", receiptData);
    console.log("receiptData._id:", receiptData._id);
    console.log("receiptData.orderId:", receiptData.orderId);
    console.log("receiptData.id:", receiptData.id);
    console.log("receiptData.deals:", receiptData.deals);
    console.log("=== END SHOW RECEIPT OPTIONS DEBUG ===");
    console.log("dabhj bs", orderData);
    console.log("sajkhsj d  asgfh sajhdhsagfd", receiptData);
    setOrderReceiptData(receiptData);
    setShowPrintReceiptsModal(true);
  };

  const handleCreateOrder = async (procedd) => {
    console.log("=== CREATE ORDER DEBUG ===");
    console.log("handleCreateOrder called");
    console.log("selectedOrderType:", selectedOrderType);
    console.log("isCreatingOrder:", isCreatingOrder);
    console.log(
      "createOrderMutation.isLoading:",
      createOrderMutation.isLoading
    );

    if (!selectedOrderType) {
      enqueueSnackbar("Please select an order type!", {
        variant: "warning",
      });
      return;
    }

    // Validation for delivery orders
    if (selectedOrderType === "DELIVERY") {
      if (!customerName || !customerPhone || !customerAddress) {
        enqueueSnackbar(
          "Please fill in customer name, phone, and address for delivery orders!",
          {
            variant: "warning",
          }
        );
        return;
      }
    
    }

    // Validation for pickup orders
    if (selectedOrderType === "PICKUP") {
      if (!customerName || !customerPhone) {
        enqueueSnackbar(
          "Please fill in customer name and phone for pickup orders!",
          {
            variant: "warning",
          }
        );
        return;
      }
     
    }

    console.log("Validation passed, setting loading state");

    // Set manual loading state
    setIsCreatingOrder(true);

    console.log("isCreatingOrder set to true");
    console.log("cartData:", cartData);
    // Prepare cart data for API
    const cartForAPI = cartData.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      pricePerQuantity: item.basePrice,
      quantity: item.quantity,
      price: item.basePrice,
      menuId: item.menuId,
      categoryId: item.categoryId,
      menuName: item.menuName,
      categoryName: item.categoryName,
      options: item.selectedOptions || [],
    }));

    console.log("cartForAPI ", cartForAPI);

    const orderData = {
      cart: cartForAPI,
      deals:
        dealsData.length > 0
          ? dealsData.map((deal) => {
              // calculate customization price
              const customizationPrice = Object.values(
                deal.selectedCustomizations || {}
              )
                .flat()
                .reduce((sum, option) => sum + (option.price || 0), 0);

              return {
                dealId: deal.dealId,
                quantity: deal.quantity,
                dealPrice: deal.dealPrice,

                customizationPrice,
                totalPrice:
                  (deal.dealPrice + customizationPrice) * deal.quantity,
                selectedCustomizations: deal.selectedCustomizations || {},
              };
            })
          : undefined,
      orderType: selectedOrderType,
      customerInfo: {
        name: customerName,
        phone: customerPhone || null,
        address: customerAddress || null,
      },
      paymentMethod: paymentMode.toUpperCase(),
      // Add instructions to order data
      instructions: instructions,
      // Add delivery fee to order data
      deliveryFee: selectedOrderType === "DELIVERY" ? deliveryFee : 0,
    };

    console.log("Order data prepared:", orderData);
    console.log("About to call createOrderMutation.mutate");

    createOrderMutation.mutate(orderData);
  };

  const createOrderMutation = useMutation({
    mutationFn: (reqData) => {
      console.log("=== MUTATION DEBUG ===");
      console.log("Mutation function called with data:", reqData);
      console.log("About to call createOrder API");
      return createOrder(reqData);
    },
    onMutate: (variables) => {
      console.log("onMutate called with:", variables);
      console.log("Mutation starting...");
    },
    onSuccess: (resData) => {
      console.log("=== MUTATION SUCCESS ===");
      console.log("Full response:", resData);
      const data = resData?.data?.data || resData?.data;
      console.log("Order created:", data);
      console.log("Order ID from data:", data?._id);
      console.log("Data keys:", data ? Object.keys(data) : "no data");
      console.log("Kitchen receipts:", data?.kitchenReceipts);
      console.log("Customer receipts:", data?.customerReceipts);

      enqueueSnackbar("Order created successfully!", {
        variant: "success",
      });

      setUpdateOrderMode(false);
      // Show receipt printing modal with order data
      if (data) {
        console.log("sklf", data);
        showReceiptOptions(data, selectedOrderType);
      }

      // Clear cart and close modals
      dispatch(removeAllItems());
      dispatch(removeCustomer());
      dispatch(clearDeals());

      setShowOrderTypeModal(false);
      // Reset instructions field
      setInstructions("");
      // Reset delivery fee
      setDeliveryFee(0);
      // setSelectedOrderType("abcd");
      // setCustomerName("");
      // setCustomerPhone("");
      // setCustomerAddress("");
      // setPaymentType("");
      // setPaymentMode("cash");

      // Clear manual loading state
      setIsCreatingOrder(false);
      console.log("isCreatingOrder set to false in success");
    },
    onError: (error) => {
      console.log("=== MUTATION ERROR ===");
      console.error("Error creating order:", error);
      console.log("Error details:", error.response?.data);

      enqueueSnackbar(
        error.response?.data?.message || "Failed to create order!",
        {
          variant: "error",
        }
      );

      // Clear manual loading state on error
      setIsCreatingOrder(false);
      console.log("isCreatingOrder set to false in error");
    },
  });

  const handleUpdateOrder = async (procedd) => {
    // Set manual loading state
    setIsCreatingOrder(true);

    console.log("isCreatingOrder set to true");
    console.log("cartData updating:", cartData);
    // Prepare cart data for API
    const cartForAPI = cartData.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      pricePerQuantity: item.basePrice,
      quantity: item.quantity,
      price: item.basePrice,
      menuId: item.menuId,
      categoryId: item.categoryId,
      menuName: item.menuName,
      categoryName: item.categoryName,
      options: item.selectedOptions || [],
    }));

    console.log("cartForAPI ", cartForAPI);

    const orderData = {
      orderId: selectedOrder._id,
      cart: cartForAPI,
      deals:
        dealsData.length > 0
          ? dealsData.map((deal) => {
              // calculate customization price
              const customizationPrice = Object.values(
                deal.selectedCustomizations || {}
              )
                .flat()
                .reduce((sum, option) => sum + (option.price || 0), 0);

              return {
                dealId: deal.dealId,
                quantity: deal.quantity,
                dealPrice: deal.dealPrice,

                customizationPrice,
                totalPrice:
                  (deal.dealPrice + customizationPrice) * deal.quantity,
                selectedCustomizations: deal.selectedCustomizations || {},
              };
            })
          : undefined,
    };

    console.log("Order data prepared:", orderData);
    console.log("About to call createOrderMutation.mutate");

    handleUpdateOrderMutation.mutate(orderData);
  };

  const handleUpdateOrderMutation = useMutation({
    mutationFn: (reqData) => {
      console.log("=== MUTATION DEBUG ===");
      console.log("Mutation function called with data:", reqData);
      console.log("About to call createOrder API");
      return updateOrderNew(reqData);
    },
    onMutate: (variables) => {
      console.log("onMutate called with:", variables);
      console.log("Mutation starting...");
    },
    onSuccess: (resData) => {
      console.log("=== MUTATION SUCCESS ===");
      console.log("Full response:", resData);
      const data = resData?.data?.data || resData?.data;
      console.log("Order created:", data);
      console.log("Order ID from data:", data?._id);
      console.log("Data keys:", data ? Object.keys(data) : "no data");
      console.log("Kitchen receipts:", data?.kitchenReceipts);
      console.log("Customer receipts:", data?.customerReceipts);

      enqueueSnackbar("Order created successfully!", {
        variant: "success",
      });
      setUpdateOrderMode(true);

      // Show receipt printing modal with order data
      if (data) {
        console.log("sklf", data);
        showReceiptOptions(data, selectedOrderType);
      }

      // Clear cart and close modals
      dispatch(removeAllItems());
      dispatch(removeCustomer());
      dispatch(clearDeals());

      setShowOrderTypeModal(false);
      // Reset instructions field
      setInstructions("");
      // Reset delivery fee
      setDeliveryFee(0);
      // setSelectedOrderType("abcd");
      // setCustomerName("");
      // setCustomerPhone("");
      // setCustomerAddress("");
      // setPaymentType("");
      // setPaymentMode("cash");

      // Clear manual loading state
      setIsCreatingOrder(false);
      console.log("isCreatingOrder set to false in success");
    },
    onError: (error) => {
      console.log("=== MUTATION ERROR ===");
      console.error("Error creating order:", error);
      console.log("Error details:", error.response?.data);

      enqueueSnackbar(
        error.response?.data?.message || "Failed to create order!",
        {
          variant: "error",
        }
      );

      // Clear manual loading state on error
      setIsCreatingOrder(false);
      console.log("isCreatingOrder set to false in error");
    },
  });

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between px-3 sm:px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cartData.length})
        </p>
        <h1 className="text-[#f5f5f5] text-sm sm:text-md font-bold">
          Rs{total.toFixed(2)}
        </h1>
      </div>

      {/* Deals Section */}
      <div className="px-3 sm:px-5 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#ababab] font-medium">
            Deals({dealsData.length}) {/* Use dealsData here */}
          </p>
        </div>

        {/* Selected Deals Display */}
        {dealsData.length > 0 && (
          <div className="space-y-2 mb-3">
            {dealsData.map((deal) => (
              <div
                key={deal._id}
                className="bg-[#262626] p-3 rounded-lg border border-[#404040]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[#f5f5f5] font-medium text-sm">
                    {deal.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[#f5f5f5] text-xs min-w-[20px] text-center">
                        {deal.quantity}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDeal(deal.uniqueId)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="text-[#ababab] text-sm font-medium">
                    Rs{deal.dealPrice} × {deal.quantity}
                  </span>
                  <span className="text-[#f6b100] text-sm font-medium">
                    Rs
                    {(
                      (deal.dealPrice +
                        Object.values(deal.selectedCustomizations || {})
                          .flat()
                          .reduce(
                            (sum, option) => sum + (option.price || 0),
                            0
                          )) *
                      deal.quantity
                    ).toFixed(2)}{" "}
                  </span>
                </div>

                {/* Section to show Included Items */}
                {deal.items && deal.items.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
                    <h3 className="text-white text-sm font-medium mb-3">
                      Included Items
                    </h3>
                    <div className="flex flex-col gap-2">
                      {deal.items.map((item, index) => (
                        <div
                          key={index}
                          className="text-[#a0a0a0] text-sm bg-[#2a2a2a] p-3 rounded-lg flex justify-between items-center"
                        >
                          <span className="font-medium text-white">
                            {item.itemId?.name || "Unknown Item"}
                          </span>
                          <span className="text-xs">
                            Quantity: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section to show Selected Customizations */}
                {deal.selectedCustomizations &&
                  Object.keys(deal.selectedCustomizations).length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
                      <h3 className="text-white text-sm font-medium mb-3">
                        Selected Customizations
                      </h3>
                      <div className="flex flex-col gap-3">
                        {Object.entries(deal.selectedCustomizations).map(
                          ([customizationName, options], index) => (
                            <div
                              key={index}
                              className="bg-[#2a2a2a] p-3 rounded-lg"
                            >
                              <p className="text-[#f5f5f5] text-sm font-semibold mb-2">
                                {customizationName}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {options.map((option, optIndex) => (
                                  <span
                                    key={optIndex}
                                    className="px-2 py-1 bg-[#404040] text-white text-xs rounded flex items-center"
                                  >
                                    {option.name}
                                    {option.price > 0 &&
                                      ` (+Rs${option.price})`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Deals Total */}
        {dealsData.length > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-[#404040]">
            <p className="text-xs text-[#ababab] font-medium">Deals Total</p>
            <h1 className="text-[#f5f5f5] text-sm font-bold">
              Rs{getDealsTotal().toFixed(2)}
            </h1>
          </div>
        )}
      </div>

      {/* Discount Input Field */}
      {/* Discount section removed */}

      <div className="flex items-center justify-between px-3 sm:px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Subtotal</p>
        <h1 className="text-[#f5f5f5] text-sm sm:text-md font-bold">
          Rs{total.toFixed(2)}
        </h1>
      </div>

      {/* Delivery Fee Display */}
      {selectedOrderType === "DELIVERY" && deliveryFee > 0 && (
        <div className="flex items-center justify-between px-3 sm:px-5 mt-2">
          <p className="text-xs text-[#ababab] font-medium mt-2">
            Delivery Fee
          </p>
          <h1 className="text-[#f5f5f5] text-sm sm:text-md font-bold">
            Rs{deliveryFee.toFixed(2)}
          </h1>
        </div>
      )}

      <div className="flex items-center justify-between px-3 sm:px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Grand Total</p>
        <h1 className="text-[#f5f5f5] text-sm sm:text-md font-bold">
          Rs{grandTotal.toFixed(2)}
        </h1>
      </div>

      {/* Savings Display */}
      {getDealsSavings() > 0 && (
        <div className="flex items-center justify-between px-3 sm:px-5 mt-2">
          <p className="text-xs text-green-400 font-medium mt-2">You Save</p>
          <h1 className="text-green-400 text-sm font-bold">
            Rs{getDealsSavings().toFixed(2)}
          </h1>
        </div>
      )}
      {/* Order Requirements removed - just need items in cart */}
      <div className="flex flex-col sm:flex-row items-center gap-3 px-3 sm:px-5 mt-4">
        <button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => setUpdateModalOpen(true)}
          style={{ marginBottom: "10px" }}
          className={`px-3 sm:px-4 py-2 sm:py-3 w-full rounded-lg font-semibold text-sm sm:text-lg ${
            cartData.length === 0 && dealsData.length === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#9a81b3] text-[#1f1f1f] hover:bg-[#e5a000]"
          }`}
        >
          Update Order
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 px-3 sm:px-5 mt-4">
        <button
          onClick={handlePlaceOrder}
          disabled={cartData.length === 0 && dealsData.length === 0}
          className={`px-3 sm:px-4 py-2 sm:py-3 w-full rounded-lg font-semibold text-sm sm:text-lg ${
            cartData.length === 0 && dealsData.length === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e5a000]"
          }`}
        >
          Place Order
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}

      {/* Order Type Modal */}
      {showOrderTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-center text-[#f5f5f5]">
              Create New Order
            </h3>

            {/* Date Display */}
            <div className="mb-4 p-3 bg-[#262626] rounded-lg">
              <div className="text-[#f5f5f5] text-sm">
                <span className="font-medium">Date: </span>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="mb-6">
              <label className="block text-[#f5f5f5] text-sm font-medium mb-3">
                Order Type
              </label>
              <div className="space-y-2">
                {["DINE", "DELIVERY", "PICKUP", "FOODPANDA", "FREE FOOD" , "MARKETING"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedOrderType(type);
                      // Reset fields when order type changes
                      setPaymentType("");
                      setCustomerPhone("");
                      setCustomerAddress("");
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-colors ${
                      selectedOrderType === type
                        ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                        : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{type}</div>
                      <div className="text-xs opacity-75">
                        {type === "DINE" && "Table service in restaurant"}
                        {type === "DELIVERY" && "Food delivered to customer"}
                        {type === "PICKUP" && "Customer picks up order"}
                        {type === "FOODPANDA" && "Rider picks up order"}
                        {type === "FREE FOOD" && "Food Given away for Free"}
                        {type === "MARKETING" && "Food Consumed for marketing Purpose"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            {selectedOrderType && (
              <div className="mb-6 space-y-4">
                <h4 className="text-[#f5f5f5] font-medium text-lg">
                  Customer Information
                </h4>

                {/* Customer Name */}
                <div>
                  <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                    {selectedOrderType === "DINE"
                      ? "Table Number / Customer Name"
                      : "Customer Name"}
                    {selectedOrderType !== "DINE" && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={
                      selectedOrderType === "DINE"
                        ? "Enter table number or customer name"
                        : "Enter customer name"
                    }
                    className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#f6b100] focus:outline-none"
                  />
                </div>

                {/* Phone Number - Required for Delivery and Pickup */}
                {(selectedOrderType === "DELIVERY" ||
                  selectedOrderType === "PICKUP") && (
                  <div>
                    <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#f6b100] focus:outline-none"
                    />
                  </div>
                )}

                {/* Address - Required for Delivery only */}
                {selectedOrderType === "DELIVERY" && (
                  <div>
                    <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                      Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Enter complete delivery address"
                      rows={3}
                      className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#f6b100] focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Delivery Fee Input - Only for DELIVERY orders */}
            {selectedOrderType === "DELIVERY" && (
              <div className="mb-6">
                <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                  Delivery Fee (Rs)
                </label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) =>
                    setDeliveryFee(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter delivery fee"
                  min="0"
                  step="0.01"
                  className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#f6b100] focus:outline-none"
                />
              </div>
            )}

            {/* Instructions Field for all order types */}
            {selectedOrderType && (
              <div className="mb-6">
                <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any special instructions for this order..."
                  rows={3}
                  className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#f6b100] focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Payment Type - Based on Order Type */}
            {/* {selectedOrderType && selectedOrderType !== "DINE" && (
              <div className="mb-6">
                <label className="block text-[#f5f5f5] text-sm font-medium mb-3">
                  Payment Type <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {selectedOrderType === "DELIVERY" && (
                    <>
                      <button
                        onClick={() => setPaymentType("cod")}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          paymentType === "cod"
                            ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                            : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                        }`}
                      >
                        Cash on Delivery (COD)
                      </button>
                      <button
                        onClick={() => {
                          setPaymentType("online");
                          setPaymentMode("online");
                        }}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          paymentType === "online"
                            ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                            : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                        }`}
                      >
                        Online Payment
                      </button>
                    </>
                  )}

                  {selectedOrderType === "PICKUP" && (
                    <>
                      <button
                        onClick={() => setPaymentType("on_arrival")}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          paymentType === "on_arrival"
                            ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                            : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                        }`}
                      >
                        Pay on Arrival
                      </button>
                      <button
                        onClick={() => {
                          setPaymentType("online");
                          setPaymentMode("online");
                        }}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          paymentType === "online"
                            ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                            : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                        }`}
                      >
                        Online Payment
                      </button>
                    </>
                  )}
                </div>
              </div>
            )} */}

            {/* Payment Mode */}
            {selectedOrderType && selectedOrderType !== "DINE" && (
              <div className="mb-6">
                <label className="block text-[#f5f5f5] text-sm font-medium mb-3">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "CASH",
                    "CARD",
                    "ONLINE",
                    "CASH ON DELIVERY",
                    "CASH ON ARRIVAL",
                  ].map((mode) => {
                    const isDisabled =
                      paymentType === "online" && mode !== "online";

                    return (
                      <button
                        key={mode}
                        onClick={() => !isDisabled && setPaymentMode(mode)}
                        disabled={isDisabled}
                        className={`p-3 rounded-lg border transition-colors capitalize ${
                          paymentMode === mode
                            ? "border-[#f6b100] bg-[#f6b100] bg-opacity-20 text-[#f6b100]"
                            : isDisabled
                            ? "border-[#303030] bg-[#1a1a1a] text-[#666666] cursor-not-allowed opacity-50"
                            : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#606060]"
                        }`}
                      >
                        {mode === "online" ? "Online Pay" : mode}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOrderTypeModal(false);
                  setSelectedOrderType("abcdef");
                  setCustomerName("");
                  setCustomerPhone("");
                  setCustomerAddress("");
                  setPaymentType("");
                  setPaymentMode("cash");
                  // Reset instructions when closing modal
                  setInstructions("");
                  // Reset delivery fee when closing modal
                  setDeliveryFee(0);
                }}
                disabled={createOrderMutation.isLoading || isCreatingOrder}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  createOrderMutation.isLoading || isCreatingOrder
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("=== CREATE ORDER BUTTON CLICKED ===");
                  console.log("Current loading states:");
                  console.log("isCreatingOrder:", isCreatingOrder);
                  console.log(
                    "createOrderMutation.isLoading:",
                    createOrderMutation.isLoading
                  );
                  console.log("selectedOrderType:", selectedOrderType);
                  handleCreateOrder();
                }}
                disabled={
                  !selectedOrderType ||
                  createOrderMutation.isLoading ||
                  isCreatingOrder
                }
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !selectedOrderType ||
                  createOrderMutation.isLoading ||
                  isCreatingOrder
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e5a000]"
                }`}
              >
                {(createOrderMutation.isLoading || isCreatingOrder) && (
                  <FaSpinner className="animate-spin" />
                )}
                {createOrderMutation.isLoading || isCreatingOrder
                  ? "Creating Order..."
                  : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <UpdateOrderModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        cartItems={cartData}
        deals={dealsData}
        onSelect={(order) => {
          setSelectedOrder(order);
          console.log("Selected order to update:", order);
          // ⚡ here you can call updateOrder API with order._id + cart data
        }}
        updateOrder={handleUpdateOrder}
      />
      {/* Print Receipts Modal */}
      <PrintReceiptsModal
        isOpen={showPrintReceiptsModal}
        onClose={() => {
          setShowPrintReceiptsModal(false);
          // Reset all order-related states here after printing is done
          setSelectedOrderType("");
          setCustomerName("");
          setCustomerPhone("");
          setCustomerAddress("");
          setPaymentType("");
          setPaymentMode("cash");
          // Reset instructions after printing
          setInstructions("");
          // Reset delivery fee after printing
          setDeliveryFee(0);
        }}
        orderData={orderReceiptData}
        orderType={selectedOrderType}
        customerReceipts={orderReceiptData?.customerReceipts || []}
        kitchenReceipts={orderReceiptData?.kitchenReceipts || []}
        isNewlyAddedOnly={updateOrderMode}
      />

      {/* Loading Overlay */}
      {(createOrderMutation.isLoading || isCreatingOrder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col items-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-[#f6b100]" />
            <p className="text-[#f5f5f5] text-lg font-medium">
              Creating Order...
            </p>
            <p className="text-[#ababab] text-sm text-center">
              Please wait while we process your order
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Bill;
