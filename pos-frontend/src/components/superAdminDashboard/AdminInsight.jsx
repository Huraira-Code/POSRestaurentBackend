import React, { useState, useEffect, useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import * as XLSX from "xlsx";
import DateFilter from "./DateFilters";

const AdminInsights = ({
  selectedAdmin,
  isLoadingAnalytics,
  adminInsightOrders,
  analyticsData,
  isLoadingOrders,
  isExportingExcel,
  ordersError,
  onExportToExcel,
  onExportSingleOrder,
}) => {
  const [searchOrderId, setSearchOrderId] = useState("");
  const [displayedOrdersCount, setDisplayedOrdersCount] = useState(5);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [isExportingSingleOrder, setIsExportingSingleOrder] = useState(false);
  // Helper function to calculate order total
  console.log("admin Orders", adminInsightOrders);
  console.log("analytics Data", analyticsData);
  // Show loading state when orders are loading
  
  const calculateOrderTotal = (order) => {
    console.log("order", order.totalAmount);
    let total = 0;

    // // Process items
    // if (order.items && order.items.length > 0) {
    //   order.items.forEach((item) => {
    //     const basePrice =
    //       item.basePrice || item.originalPrice || item.price || 0;
    //     const options = item.options || [];
    //     const optionsPrice = options.reduce(
    //       (sum, opt) => sum + (opt.price || 0),
    //       0
    //     );
    //     const discount = item.discount || item.itemDiscount || 0;
    //     const quantity = item.quantity || 1;

    //     const paymentMethod =
    //       order.paymentMethod || order.paymentType || "CASH";
    //     const taxRates = item.tax || { card: "0", cash: "0" };
    //     const taxRate =
    //       paymentMethod === "CARD"
    //         ? parseFloat(taxRates.card || "0")
    //         : parseFloat(taxRates.cash || "0");

    //     const originalAmount = basePrice + optionsPrice;
    //     const taxAmount = (originalAmount * taxRate) / 100;
    //     const finalPrice = originalAmount - discount + taxAmount;

    //     total += finalPrice * quantity;
    //   });
    // }
    // // Process deals
    // if (order.deals?.length > 0) {
    //   order.deals.forEach((deal) => {
    //     const dealPrice = parseFloat(deal.dealPrice) || 0;
    //     const dealTax = parseFloat(deal.dealTax) || 0;
    //     const quantity = parseInt(deal.quantity) || 1;

    //     total += dealPrice * quantity;
    //     total += ((dealPrice * dealTax) / 100) * quantity;
    //   });
    // }

    // Apply voucher discount
    total = order.totalAmount; // this include delivery fees
    const voucherDiscount = order.voucherDiscount || 0;
    total -= voucherDiscount;

    return total;
  };

  // Date filter states
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: null,
    endDate: null,
    selectedMonth: "",
    selectedYear: new Date().getFullYear(),
  });

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (!adminInsightOrders) return [];

    let orders = [...adminInsightOrders];

    // Always filter only completed, EOD closed, and paid
    orders = orders.filter(
      (order) =>
        order.orderStatus === "COMPLETED" &&
        order.isEndOfDayClosed === true &&
        order.paymentStatus === "PAID"
    );

    // Apply date filter
    if (dateFilter.startDate && dateFilter.endDate) {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate >= dateFilter.startDate && orderDate <= dateFilter.endDate
        );
      });
    }

    return orders;
  }, [adminInsightOrders, dateFilter]);

  console.log("filtered Orders now", filteredOrders);

    // Calculate analytics from filtered orders
    const filteredData = useMemo(() => {
      if (!analyticsData || !filteredOrders) return null;

      // Helper: filter orders by dateFilter
      const isWithinDateFilter = (dateStr) => {
        if (!dateFilter.startDate || !dateFilter.endDate) return true;
        const date = new Date(dateStr);
        return date >= dateFilter.startDate && date <= dateFilter.endDate;
      };

      // ✅ Step 1: use `isEndOfDayClosedDate` if available, otherwise `createdAt`
      const getOrderDate = (order) =>
        order.isEndOfDayClosedDate || order.createdAt;

      // ✅ Step 2: Filter orders using getOrderDate
      const ordersInRange = filteredOrders.filter((order) => {
        const dateToCheck = getOrderDate(order);
        return dateToCheck && isWithinDateFilter(dateToCheck);
      });

      // Calculate sales by date
      const salesByDateMap = {};
      ordersInRange.forEach((order) => {
        const orderDate = new Date(getOrderDate(order))
          .toISOString()
          .split("T")[0];
        const orderTotal = calculateOrderTotal(order);

        if (!salesByDateMap[orderDate]) {
          salesByDateMap[orderDate] = { date: orderDate, sales: 0, orders: 0 };
        }

        salesByDateMap[orderDate].sales += orderTotal;
        salesByDateMap[orderDate].orders += 1;
      });

      const filteredSalesByDate = Object.values(salesByDateMap).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Total sales and orders
      const totalSales = filteredSalesByDate.reduce(
        (sum, item) => sum + item.sales,
        0
      );
      const totalOrders = filteredSalesByDate.reduce(
        (sum, item) => sum + item.orders,
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      console.log("order in range", ordersInRange);

      // Top-selling items
      const itemSalesMap = {};
      ordersInRange.forEach((order) => {
        order.items?.forEach((item) => {
          const itemName = item.name;
          const quantity = item.quantity || 1;
          const basePrice = item.basePrice || item.price || 0;
          const optionsPrice = (item.selectedOptions || []).reduce(
            (sum, opt) => sum + (opt.price || 0),
            0
          );
          const discount = item.discount || 0;

          const totalItemPrice = (basePrice + optionsPrice - discount) * quantity;

          if (!itemSalesMap[itemName]) {
            itemSalesMap[itemName] = {
              name: itemName,
              quantity: 0,
              totalRevenue: 0,
            };
          }

          itemSalesMap[itemName].quantity += quantity;
          itemSalesMap[itemName].totalRevenue += totalItemPrice;
        });

        order.deals?.forEach((deal) => {
          const dealName = deal.name;
          const quantity = deal.quantity || 1;
          const dealPrice = parseFloat(deal.dealPrice) || 0;
          const totalDealPrice = dealPrice * quantity;

          if (!itemSalesMap[dealName]) {
            itemSalesMap[dealName] = {
              name: dealName,
              quantity: 0,
              totalRevenue: 0,
            };
          }

          itemSalesMap[dealName].quantity += quantity;
          itemSalesMap[dealName].totalRevenue += totalDealPrice;
        });
      });

      console.log("order in range 2", itemSalesMap);

      const topSellingItems = Object.values(itemSalesMap).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      console.log("topSellingItems", topSellingItems);

      // Deal metrics
      const dealMetricsMap = {};
      let totalDealsSold = 0;
      let totalDealRevenue = 0;
      let totalDealsSavings = 0;

      ordersInRange.forEach((order) => {
        order.deals?.forEach((deal) => {
          const dealName = deal.name;
          const quantity = deal.quantity || 1;
          const dealPrice = parseFloat(deal.dealPrice) || 0;
          const savings = deal.savings || 0;

          totalDealsSold += quantity;
          totalDealRevenue += dealPrice * quantity;
          totalDealsSavings += savings * quantity;

          if (!dealMetricsMap[dealName]) {
            dealMetricsMap[dealName] = {
              name: dealName,
              quantity: 0,
              totalRevenue: 0,
              totalSavings: 0,
            };
          }

          dealMetricsMap[dealName].quantity += quantity;
          dealMetricsMap[dealName].totalRevenue += dealPrice * quantity;
          dealMetricsMap[dealName].totalSavings += savings * quantity;
        });
      });

      const topDeals = Object.values(dealMetricsMap).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );

      const dealPercentageOfSales =
        totalSales > 0 ? (totalDealRevenue / totalSales) * 100 : 0;

      // Filter recent transactions
      const filteredRecentTransactions = (
        analyticsData.recentTransactions || []
      ).filter(
        (transaction) =>
          !dateFilter.startDate ||
          !dateFilter.endDate ||
          isWithinDateFilter(transaction.date)
      );

      return {
        ...analyticsData,
        totalSales,
        totalOrders,
        averageOrderValue,
        salesByDate: filteredSalesByDate,
        recentTransactions: filteredRecentTransactions,
        topSellingItems,
        dealMetrics: {
          totalDealRevenue,
          totalDealsSold,
          totalDealsSavings,
          dealPercentageOfSales,
          topDeals,
        },
        _isFiltered: dateFilter.type !== "all",
        _originalTotalSales: analyticsData.totalSales,
        _originalTotalOrders: analyticsData.totalOrders,
      };
    }, [analyticsData, filteredOrders, dateFilter]);

    // Filter orders based on search
    const searchedOrders = useMemo(() => {
      if (!searchOrderId) return filteredOrders;

      return filteredOrders.filter((order) => {
        const orderId = order._id
          ? String(order._id).slice(-8).toUpperCase()
          : "";
        return orderId.includes(searchOrderId.toUpperCase());
      });
    }, [filteredOrders, searchOrderId]);

    const handleDateFilterChange = (filterConfig) => {
      setDateFilter(filterConfig);
      // Reset displayed orders count when filter changes
      setDisplayedOrdersCount(5);
    };

  const handleExportFilteredData = async (filterType, filterDetails) => {
    console.log("Exporting filtered data:", { filterType, filterDetails });
    await onExportToExcel(selectedAdmin._id, {
      filterType,
      ...filterDetails,
      ...dateFilter,
    });
  };

  // Calculate order totals for display
  const calculateOrderTotals = (order) => {
    let totalBasePrice = 0;
    let totalOptionsPrice = 0;
    let totalItemDiscount = 0;
    let totalTaxAmount = 0;
    let totalFinalAmount = 0;
    let totalDealAmount = 0;
    let totalDealTax = 0;

    // Process items
    if (order.items?.length > 0) {
      order.items.forEach((item) => {
        const basePrice = item.basePrice || item.price || 0;
        const optionsPrice = (item.selectedOptions || []).reduce(
          (sum, opt) => sum + (opt.price || 0),
          0
        );
        const discount = item.discount || 0;
        const quantity = item.quantity || 1;

        const paymentMethod = order.paymentMethod || "CASH";
        const taxRates = item.tax || { card: "0", cash: "0" };
        const taxRate =
          paymentMethod === "CARD"
            ? parseFloat(taxRates.card || "0")
            : parseFloat(taxRates.cash || "0");

        const originalAmount = basePrice + optionsPrice;
        const taxAmount = (originalAmount * taxRate) / 100;
        const finalPrice = originalAmount - discount + taxAmount;

        totalBasePrice += basePrice * quantity;
        totalOptionsPrice += optionsPrice * quantity;
        totalItemDiscount += discount * quantity;
        totalTaxAmount += taxAmount * quantity;
        totalFinalAmount += finalPrice * quantity;
      });
    }

    // Process deals
    if (order.deals?.length > 0) {
      order.deals.forEach((deal) => {
        const dealPrice = parseFloat(deal.dealPrice) || 0;
        const dealTax = parseFloat(deal.dealTax) || 0;
        const quantity = parseInt(deal.quantity) || 1;

        totalDealAmount += dealPrice * quantity;
        totalDealTax += ((dealPrice * dealTax) / 100) * quantity;
      });
    }

    const voucherDiscount = order.voucherDiscount || 0;
    const finalOrderTotal =
      totalFinalAmount + totalDealAmount + totalDealTax - voucherDiscount;

    return {
      totalBasePrice,
      totalOptionsPrice,
      totalItemDiscount,
      totalTaxAmount,
      totalFinalAmount,
      totalDealAmount,
      totalDealTax,
      voucherDiscount,
      finalOrderTotal,
    };
  };

  // Get orders to display (with pagination)
  const ordersToDisplay = searchedOrders.slice(0, displayedOrdersCount);
  const hasMoreOrders = searchedOrders.length > displayedOrdersCount;

  // Handle Excel export for a single order
  const handleExportSingleOrder = async (order) => {
    setIsExportingSingleOrder(true);
    try {
      await onExportSingleOrder(order);
    } catch (error) {
      console.error("Error exporting single order:", error);
    } finally {
      setIsExportingSingleOrder(false);
    }
  };

  if (!filteredData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60a5fa] mx-auto"></div>
          <p className="text-[#a0a0a0] mt-4">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (isLoadingAnalytics) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
        <p className="text-[#a0a0a0]">Loading analytics data...</p>
        <p className="text-[#606060] text-sm mt-2">
          Crunching the numbers for insights
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[#f5f5f5] text-xl font-semibold">
            Admin Insights
          </h3>
          <p className="text-sm text-[#ababab]">
            Analytics and orders for {selectedAdmin.email}'s restaurant
            {dateFilter.type !== "all" && (
              <span className="text-[#60a5fa] ml-2">(Filtered View)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isLoadingOrders && (
            <div className="text-[#60a5fa] text-sm">Loading orders...</div>
          )}
          {!isLoadingOrders && adminInsightOrders && adminInsightOrders.length > 0 && (
            <button
              onClick={() => onExportToExcel(selectedAdmin._id)}
              disabled={isExportingExcel}
              className={`px-4 py-2 ${
                isExportingExcel
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
            >
              {isExportingExcel ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Generating Excel...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export All Data
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Date Filter Component */}
      <DateFilter
        onDateFilterChange={handleDateFilterChange}
        onExportFilteredData={handleExportFilteredData}
      />

      {/* Analytics Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a0a0a0] text-sm font-medium">
                Total Money Generated
              </p>
              <p className="text-[#f5f5f5] text-2xl font-bold">
                Rs{filteredData.totalSales.toFixed(2)}
              </p>
              {filteredData._isFiltered && (
                <p className="text-[#60a5fa] text-xs mt-1">
                  Filtered from Rs{filteredData._originalTotalSales.toFixed(2)}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-600/20 rounded-full">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a0a0a0] text-sm font-medium">Total Orders</p>
              <p className="text-[#f5f5f5] text-2xl font-bold">
                {filteredData.totalOrders}
              </p>
              {filteredData._isFiltered && (
                <p className="text-[#60a5fa] text-xs mt-1">
                  Filtered from {filteredData._originalTotalOrders}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-600/20 rounded-full">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a0a0a0] text-sm font-medium">
                Avg Order Value
              </p>
              <p className="text-[#f5f5f5] text-2xl font-bold">
                Rs{filteredData.averageOrderValue.toFixed(2)}
              </p>
              {filteredData._isFiltered && (
                <p className="text-[#60a5fa] text-xs mt-1">
                  Based on filtered data
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-600/20 rounded-full">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Deal Metrics */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a0a0a0] text-sm font-medium">Deal Revenue</p>
              <p className="text-[#f5f5f5] text-2xl font-bold">
                Rs{filteredData?.dealMetrics?.totalDealRevenue.toFixed(2)}
              </p>
              <p className="text-[#f6b100] text-xs">
                {filteredData?.dealMetrics?.dealPercentageOfSales.toFixed(1)}%
                of total sales
              </p>
              {filteredData._isFiltered && (
                <p className="text-[#60a5fa] text-xs mt-1">
                  Based on filtered data
                </p>
              )}
            </div>
            <div className="p-3 bg-[#f6b100]/20 rounded-full">
              <svg
                className="w-6 h-6 text-[#f6b100]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Items and Deals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Deals Section - Left Side */}
        <div className="lg:col-span-1 space-y-6">
          {/* Deal Performance Summary */}

          {/* Top Performing Deals */}
          {filteredData?.dealMetrics?.topDeals?.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
              <h4 className="text-[#f5f5f5] text-lg font-semibold mb-4">
                Top Performing Deals
              </h4>
              <div className="space-y-3">
                {filteredData.dealMetrics.topDeals.map((deal, index) => (
                  <div
                    key={deal.name}
                    className="flex items-center justify-between p-3 bg-[#262626] rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-[#f6b100] text-[#1f1f1f] rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-[#f5f5f5] font-medium">
                          {deal.name}
                        </p>
                        <p className="text-[#a0a0a0] text-sm">
                          {deal.quantity} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#f6b100] font-semibold">
                        Rs{deal.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-green-400 text-sm">
                        Save Rs{Math.abs(deal.totalSavings).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Items Section - Right Side */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[#f5f5f5] text-lg font-semibold">
                All Menu Items Performance
              </h4>
              <p className="text-[#a0a0a0] text-sm">
                {filteredData.topSellingItems.length} items total
                {filteredData._isFiltered && (
                  <span className="text-[#60a5fa] ml-2">(Filtered)</span>
                )}
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredData.topSellingItems.length > 0 ? (
                filteredData.topSellingItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-[#262626] rounded-lg hover:bg-[#2d2d2d] transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <span className="w-8 h-8 bg-[#60a5fa] text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h5 className="text-[#f5f5f5] font-medium text-sm">
                          {item.name}
                        </h5>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[#a0a0a0] text-xs">
                            {item.quantity} sold
                          </span>
                          <span className="text-[#f6b100] text-xs font-medium">
                            Rs{item.totalRevenue.toFixed(2)} revenue
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[#10b981] font-bold text-sm">
                        Rs{(item.totalRevenue / item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[#a0a0a0] text-xs">avg per item</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-[#a0a0a0]">
                    No item data available for selected period
                  </p>
                </div>
              )}
            </div>

            {/* Performance Summary */}
            {filteredData.topSellingItems.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#404040]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-[#a0a0a0]">Total Items Sold</p>
                    <p className="text-[#f5f5f5] font-bold text-lg">
                      {filteredData.topSellingItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#a0a0a0]">Total Items Revenue</p>
                    <p className="text-[#10b981] font-bold text-lg">
                      Rs{filteredData.totalSales.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* ... (Search and Orders Table sections remain unchanged) ... */}
    </div>
  );
};

// OrderDetailsModal component remains exactly the same
const OrderDetailsModal = ({ order, onClose, onExport, isExporting }) => {
  // ... (existing OrderDetailsModal code) ...
};

export default AdminInsights;
