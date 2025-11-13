import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  getOrders,
  updateOrder,
  completeOrder,
  getPayment,
  generateCustomerReceipts,
  printDailySalesReportAndCloseDay,
  deleteOrders, // 🆕 Import the new function
} from "../../https/index";

import EditOrderModal from "./EditOrderModal";
import PrintReceiptsModal from "../receipt/PrintReceiptsModal";
import DailySalesReportModal from "./DailySalesReportModal"; // 🆕 Import the new modal

const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrintReceiptsModal, setShowPrintReceiptsModal] = useState(false);
const [selectedDate, setSelectedDate] = useState("");

  const [displayedOrdersCount, setDisplayedOrdersCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFullModal, setIsFullModal] = useState(true);
  const [receiptData, setReceiptData] = useState(null);
  const [isPrintingCustomerReceipts, setIsPrintingCustomerReceipts] =
    useState(false);

  const [page, setPage] = useState(1);
  // 🆕 States for Daily Sales Report
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [dailyReportData, setDailyReportData] = useState(null);

  const queryClient = useQueryClient();

  // 🆕 New mutation for Daily Sales Report and Close Day
  const closeDayMutation = useMutation({
    mutationFn: printDailySalesReportAndCloseDay,
    onMutate: () => {
      enqueueSnackbar("Generating daily report and closing day...", {
        variant: "info",
        persist: true, // Keep it until success/error
      });
    },
    onSuccess: (response) => {
      const report = response?.data?.report;
      console.log("mra shfja", response.data);
      if (report) {
        setDailyReportData(report);
        setShowDailyReportModal(true); // Show the report modal
      }
      enqueueSnackbar("Day closed and sales report generated successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries(["orders"]); // Invalidate orders to reflect 'isEndOfDayClosed' changes
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to close day and generate report.",
        {
          variant: "error",
        }
      );
    },
    onSettled: () => {
      // Dismiss the info snackbar
      enqueueSnackbar("dismiss", { key: "info" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, paymentStatus }) => {
      const response = await updateOrder({
        orderId: orderId,
        paymentStatus: paymentStatus,
      });

      return response;
    },
    onSuccess: (response) => {
      enqueueSnackbar("Payment status updated successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Failed to update payment status", {
        variant: "error",
      });
    },
  });

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
        // Use the order data we already set in receiptData
        setReceiptData((prev) => ({
          ...prev,
          customerReceipts: data.customerReceipts,
          kitchenReceipts: data.kitchenReceipts, // Also include kitchen receipts if available
        }));
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

  const ORDERS_PER_PAGE = 10;

  // Fetch orders
  const {
    data: ordersResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrders({ page, limit: ORDERS_PER_PAGE }),
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  // Extract paginated data
  const orders = ordersResponse?.data?.data || []; // actual orders
  const totalPages = ordersResponse?.data?.totalPages || 1;
  const totalOrders = ordersResponse?.data?.totalOrders || 0;

  console.log("mera orders", orders);
  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    let tabMatch = true;
    if (activeTab === "In Progress")
      tabMatch = order.orderStatus === "IN_PROGRESS";
    if (activeTab === "Completed")
      tabMatch =
        order.orderStatus === "COMPLETED" && order.paymentStatus !== "PAID";
    if (activeTab === "Paid") tabMatch = order.paymentStatus === "PAID";

    // Search filter - search by order ID (last 6 characters)
    let searchMatch = true;
    if (searchQuery.trim()) {
      const orderId = order._id?.slice(-6) || "";
      searchMatch = orderId.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return tabMatch && searchMatch;
  });

  // Get orders to display based on pagination
  const displayedOrders = filteredOrders.slice(0, displayedOrdersCount);
  const hasMoreOrders = filteredOrders.length > displayedOrdersCount;
  console.log("displayedOrders", displayedOrders);
  // Reset pagination when filters change
  React.useEffect(() => {
    setDisplayedOrdersCount(ORDERS_PER_PAGE);
  }, [activeTab, searchQuery]);

  // Load more orders function
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedOrdersCount((prev) => prev + ORDERS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  // Complete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      // Pass { id: orderId } since backend expects id
      const response = await deleteOrders({ id: orderId });
      return response;
    },
    onSuccess: () => {
      enqueueSnackbar("Order deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]); // refresh orders
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete order",
        { variant: "error" }
      );
    },
  });

  const printReceiptMutation = useMutation({
    mutationFn: getPayment,
    onSuccess: (response) => {
      enqueueSnackbar("Receipt generated successfully!", {
        variant: "success",
      });
      console.log("Receipt data:", response.data);
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to generate receipt",
        {
          variant: "error",
        }
      );
    },
  });

  // Add these handler functions
  const handlePrintReceipt = (order) => {
    printReceiptMutation.mutate({
      orderId: order._id,
      paymentType: order.paymentMethod || "CASH",
      paymentMode: (order.paymentMethod || "CASH").toLowerCase(),
    });
  };

  const handleChangeToPaid = (orderId) => {
    updateOrderStatusMutation.mutate({
      orderId,
      paymentStatus: "PAID",
    });
  };

  const handleCompleteOrder = (orderId) => {
    completeOrderMutation.mutate({ orderId });
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setIsFullModal(true); // Set to true for full modal
  };

  const handleCompleteOrderModal = (order) => {
    setEditingOrder(order);
    setIsFullModal(false); // Set to true for full modal
  };

  // 🆕 Handler for "Close Day" button
  const handleCloseDay = () => {
    closeDayMutation.mutate(); // Trigger the mutation
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "DINE":
        return "bg-blue-100 text-blue-800";
      case "DELIVERY":
        return "bg-green-100 text-green-800";
      case "PICKUP":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatOrderId = (id) => {
    return id ? `#${id.slice(-6).toUpperCase()}` : "N/A";
  };

  const formatPrice = (amount) => {
    return amount ? `Rs${amount.toFixed(2)}` : "Rs0.00";
  };

  const getTabCount = (tabName) => {
    const searchFilteredOrders = orders.filter((order) => {
      if (!searchQuery.trim()) return true;
      const orderId = order._id?.slice(-6) || "";
      return orderId.toLowerCase().includes(searchQuery.toLowerCase());
    });

    switch (tabName) {
      case "All Orders":
        return searchFilteredOrders.length;
      case "In Progress":
        return searchFilteredOrders.filter(
          (o) => o.orderStatus === "IN_PROGRESS"
        ).length;
      case "Completed":
        return searchFilteredOrders.filter(
          (o) => o.orderStatus === "COMPLETED" && o.paymentStatus !== "PAID"
        ).length;
      case "Paid":
        return searchFilteredOrders.filter((o) => o.paymentStatus === "PAID")
          .length;
      default:
        return 0;
    }
  };

  if (error) {
    console.error("Error fetching orders:", error);
    enqueueSnackbar("Failed to load orders", { variant: "error" });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6b100]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen font-inter">
      <h1 className="text-2xl font-bold text-[#f5f5f5] mb-6">
        Orders Management
      </h1>

      {/* Search, Tabs, and Close Day Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-[#606060]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-[#2a2a2a] rounded-lg bg-[#1a1a1a] text-[#f5f5f5] placeholder-[#606060] focus:outline-none focus:ring-2 focus:ring-[#f6b100] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-[#606060] hover:text-[#f5f5f5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg">
          {["All Orders", "In Progress", "Completed", "Paid"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#f6b100] text-[#1f1f1f]"
                  : "text-[#f5f5f5] hover:bg-[#262626]"
              }`}
            >
              {tab}
              <span className="ml-1 text-xs">({getTabCount(tab)})</span>
            </button>
          ))}
        </div>

        {/* 🆕 Close Day Button */}
        <button
          onClick={handleCloseDay}
          disabled={closeDayMutation.isLoading}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            closeDayMutation.isLoading
              ? "bg-[#2a2a2a] text-[#606060] cursor-not-allowed"
              : "bg-[#f6b100] hover:bg-[#e8a600] text-black"
          }`}
        >
          {closeDayMutation.isLoading ? "Closing Day..." : "Close Day & Report"}
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#606060] text-lg">No orders found</div>
            <div className="text-[#404040] text-sm mt-1">
              {searchQuery ? (
                <>
                  No orders found matching "
                  <span className="text-[#f6b100]">{searchQuery}</span>"
                  <div className="mt-2">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[#f6b100] hover:text-[#e8a600] underline"
                    >
                      Clear search
                    </button>
                  </div>
                </>
              ) : activeTab === "All Orders" ? (
                "No orders have been created yet"
              ) : activeTab === "In Progress" ? (
                "No orders are currently in progress"
              ) : activeTab === "Completed" ? (
                "No orders have been completed yet"
              ) : activeTab === "Paid" ? (
                "No orders have been paid yet"
              ) : (
                "No orders found"
              )}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-[#2a2a2a]">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Order No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Day Closed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-[#f5f5f5] uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1a1a1a] divide-y divide-[#2a2a2a]">
                {displayedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#222222]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#f5f5f5]">
                        {formatOrderId(order._id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#f5f5f5]">
                        {order.orderNumber || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isEndOfDayClosed ? (
                        <span className="text-green-500 text-lg">✔</span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getOrderTypeColor(
                          order.orderType || "DINE"
                        )}`}
                      >
                        {order.orderType || "DINE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#a0a0a0] max-w-lg ">
                        {order.items && order.items.length > 0
                          ? [
                              ...order.items.map((item) => {
                                const itemName = item.name || "Unknown Item";
                                const quantity = item.quantity || 1;
                                return `${itemName} (${quantity})`;
                              }),
                              ...(order.deals && order.deals.length > 0
                                ? order.deals.map(
                                    (deal) => deal.name || "Unnamed Deal"
                                  )
                                : []),
                            ].join(", ")
                          : order.deals && order.deals.length > 0
                          ? order.deals
                              .map((deal) => deal.name || "Unnamed Deal")
                              .join(", ")
                          : "No items"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#f5f5f5]">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          order.orderStatus || "IN_PROGRESS"
                        )}`}
                      >
                        {(order.orderStatus || "IN_PROGRESS").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.paymentStatus && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#a0a0a0]">
                        {formatDate(order.createdAt || order.printedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-[#60a5fa] hover:text-[#3b82f6]"
                        >
                          Edit
                        </button>

                        {/* Print Receipt Button - Show for all non-DINE orders or completed DINE orders */}
                        {(order.orderType !== "DININF" ||
                          order.orderStatus === "COMPLETED") && (
                          <button
                            onClick={() => {
                              generateCustomerReceiptsMutation.mutate({
                                orderId: order._id,
                              });
                              // Pass the current order to receiptData
                              setReceiptData(order);
                            }}
                            className="text-[#8b5cf6] hover:text-[#7c3aed]"
                            disabled={isPrintingCustomerReceipts}
                          >
                            {isPrintingCustomerReceipts
                              ? "Printing..."
                              : "Print"}
                          </button>
                        )}
                        {/* Change to Paid Button - Show only for unpaid completed orders */}
                        {order.orderStatus === "COMPLETED" &&
                          order.paymentStatus !== "PAID" && (
                            <button
                              onClick={() => handleChangeToPaid(order._id)}
                              className="text-[#10b981] hover:text-[#059669]"
                            >
                              {updateOrderStatusMutation.isLoading
                                ? "Processing..."
                                : "Paid"}
                            </button>
                          )}

                        {/* Complete Button - Show only for in-progress orders */}
                        {order.orderStatus !== "COMPLETED" && (
                          <button
                            onClick={() => handleCompleteOrderModal(order)}
                            className="text-[#f6b100] hover:text-[#e5a000]"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this order?"
                              )
                            ) {
                              deleteOrderMutation.mutate({
                                orderId: order._id,
                              });
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-6 py-4 border-t border-[#2a2a2a]">
              <span className="text-sm text-[#909090]">
                Page {page} of {totalPages} (Total Orders: {totalOrders})
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || isFetching}
                  className="px-3 py-1 bg-[#2a2a2a] text-white rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || isFetching}
                  className="px-3 py-1 bg-[#f6b100] text-black rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={() => {
            queryClient.invalidateQueries(["orders"]);
            setEditingOrder(null);
          }}
          isFullModal={isFullModal}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {/* Print Receipts Modal (for individual order receipts) */}
      {showPrintReceiptsModal && (
        <PrintReceiptsModal
          isOpen={showPrintReceiptsModal}
          onClose={() => setShowPrintReceiptsModal(false)}
          orderData={receiptData}
          orderType={receiptData?.orderType || "DINE"}
          customerReceipts={receiptData?.customerReceipts || []}
          kitchenReceipts={receiptData?.kitchenReceipts || []}
        />
      )}

      {/* 🆕 Daily Sales Report Modal */}
      <DailySalesReportModal
        isOpen={showDailyReportModal}
        onClose={() => setShowDailyReportModal(false)}
        reportData={dailyReportData}
      />
    </div>
  );
};

export default OrdersManagement;
