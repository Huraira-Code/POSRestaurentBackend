import { FaEdit, FaPlus, FaUserPlus, FaUsers, FaUtensils } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import AdminInsights from "../AdminInsight";


const AllAdminsTab = ({
  // State props
  selectedAdmin,
  setSelectedAdmin,
  isAdminDropdownOpen,
  setIsAdminDropdownOpen,
  allAdmins,
  adminCategories,
  adminItems,
  adminDetailView,
  setAdminDetailView,
  adminOrders,
  searchOrderId,
  setSearchOrderId,
  displayedOrdersCount,
  setDisplayedOrdersCount,
  editingOrder,
  CategoryRow,
  setEditingOrder,
  selectedOrderForDetails,
  MdRestaurantMenu,
  setSelectedOrderForDetails,
  isLoadingOrders,
  ordersError,
  isLoadingCategories,
  categoriesError,
  isLoadingItems,
  itemsError,
  adminMenu,
  isLoadingMenu,
  menuError,
  menuItems,
  isLoadingMenuItems,
  allVouchers,
  isLoadingVouchers,
  vouchersError,
  allDeals,
  isLoadingDeals,
  dealsError,
  analyticsData,
  isLoadingAdmins,
  adminsError,
  isExportingExcel,

  // Function props
  fetchCategoriesForAdmin,
  fetchItemsForAdmin,
  fetchOrdersAndAnalytics,
  fetchMenuForAdmin,
  fetchVouchersForAdmin,
  fetchDealsForAdmin,
  fetchAllAdmins,
  handleEditItemClick,
  handleDeleteItemClick,
  handleEditMenuClick,
  handleDeleteMenuClick,
  handleCreateVoucher,
  handleEditVoucher,
  handleDeleteVoucherClick,
  handleCreateDeal,
  handleEditDeal,
  handleDeleteDeal,
  handleExportToExcel,
  handleExportSingleOrder,

  // Modal state props
  setIsCreateCategoryModalOpen,
  setIsCreateItemModalOpen,
  setIsCreateMenuModalOpen
}) => {
    if (selectedAdmin) {
      return (
        <div className="container mx-auto px-6 md:px-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 bg-[#404040] hover:bg-[#505050] rounded-lg text-[#f5f5f5]"
                >
                  ← Back to All Admins
                </button>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#f5f5f5]">
                      {selectedAdmin.name}
                    </h3>
                    <p className="text-[#a0a0a0]">
                      {selectedAdmin.email} - Admin Dashboard
                    </p>
                  </div>

                  {/* Admin Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsAdminDropdownOpen(!isAdminDropdownOpen)
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-[#262626] hover:bg-[#404040] rounded-lg text-[#f5f5f5] border border-[#404040]"
                    >
                      <span>Switch Admin</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isAdminDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isAdminDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-[#1a1a1a] border border-[#404040] rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 text-sm text-[#a0a0a0] border-b border-[#404040]">
                            Select Admin ({allAdmins.length})
                          </div>

                          {allAdmins.map((admin) => (
                            <button
                              key={admin._id}
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsAdminDropdownOpen(false);
                                // Pre-fetch data for the selected admin
                                fetchCategoriesForAdmin(admin._id);
                                fetchItemsForAdmin(admin._id);
                              }}
                              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                                selectedAdmin._id === admin._id
                                  ? "bg-[#60a5fa] text-white"
                                  : "text-[#f5f5f5] hover:bg-[#262626]"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">
                                    {admin.name}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {admin.email}
                                  </div>
                                </div>
                                {selectedAdmin._id === admin._id && (
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}

                          {allAdmins.length === 0 && (
                            <div className="px-3 py-4 text-center text-[#a0a0a0] text-sm">
                              No admins available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded text-sm bg-green-900 text-green-300">
                Active
              </span>
            </div>

            {/* Admin Information and Statistics */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">
                Admin Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#262626] p-4 rounded-lg">
                  <h4 className="text-[#a0a0a0] text-sm">Total Categories</h4>
                  <p className="text-[#60a5fa] text-2xl font-bold">
                    {adminCategories.length}
                  </p>
                </div>
                <div className="bg-[#262626] p-4 rounded-lg">
                  <h4 className="text-[#a0a0a0] text-sm">Total Menu Items</h4>
                  <p className="text-[#10b981] text-2xl font-bold">
                    {adminItems.length}
                  </p>
                </div>
                <div className="bg-[#262626] p-4 rounded-lg">
                  <h4 className="text-[#a0a0a0] text-sm">Admin Since</h4>
                  <p className="text-[#f59e0b] text-lg font-bold">
                    {selectedAdmin.createdAt
                      ? new Date(selectedAdmin.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mb-6">
              {[
                "Analytics",
                "Categories",
                "Items",
                "Menu",
                "Vouchers",
                "Deals",
                "Settings",
                "Insights",
              ].map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setAdminDetailView(view);
                    // Fetch data when switching to different views
                    if (view === "Analytics") {
                      fetchOrdersAndAnalytics(selectedAdmin._id);
                    } else if (view === "Categories") {
                      fetchCategoriesForAdmin(selectedAdmin._id);
                    } else if (view === "Items") {
                      fetchItemsForAdmin(selectedAdmin._id);
                    } else if (view === "Menu") {
                      fetchMenuForAdmin(selectedAdmin._id);
                    } else if (view === "Vouchers") {
                      fetchVouchersForAdmin(selectedAdmin._id);
                    } else if (view === "Deals") {
                      fetchDealsForAdmin(selectedAdmin._id);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    adminDetailView === view
                      ? "bg-[#60a5fa] text-white"
                      : "bg-[#262626] text-[#f5f5f5] hover:bg-[#404040]"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Content based on selected view */}
            <div className="bg-[#262626] rounded-lg p-6">
              {adminDetailView === "Analytics" && (
                <div>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchOrderId}
                        onChange={(e) => {
                          setSearchOrderId(e.target.value);
                          setDisplayedOrdersCount(5); // Reset pagination when searching
                        }}
                        className="w-full max-w-md px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#a0a0a0] focus:outline-none focus:border-[#60a5fa]"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-[#a0a0a0]"
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
                      {searchOrderId && (
                        <button
                          onClick={() => {
                            setSearchOrderId("");
                            setDisplayedOrdersCount(5);
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a0a0a0] hover:text-[#f5f5f5]"
                        >
                          <svg
                            className="h-5 w-5"
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
                    {searchOrderId && (
                      <p className="text-[#a0a0a0] text-sm mt-2">
                        Searching for Order ID containing: "{searchOrderId}"
                      </p>
                    )}
                  </div>

                  {ordersError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                      <p className="text-red-300 text-sm">{ordersError}</p>
                    </div>
                  )}

                  {/* Orders Table */}
                  {isLoadingOrders ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60a5fa] mx-auto"></div>
                      <p className="text-[#a0a0a0] mt-4">
                        Loading order data...
                      </p>
                    </div>
                  ) : adminOrders && adminOrders.length > 0 ? (
                    (() => {
                      // Filter orders based on search
                      const filteredOrders = searchOrderId
                        ? adminOrders.filter((order) => {
                            const orderId = order._id
                              ? String(order._id).slice(-8).toUpperCase()
                              : `ORD-${adminOrders.indexOf(order) + 1}`;
                            return orderId.includes(
                              searchOrderId.toUpperCase()
                            );
                          })
                        : adminOrders;

                      // Get orders to display (with pagination)
                      const ordersToDisplay = filteredOrders.slice(
                        0,
                        displayedOrdersCount
                      );

                      console.log("my break up", ordersToDisplay);
                      const hasMoreOrders =
                        filteredOrders.length > displayedOrdersCount;

                      return (
                        <div>
                          {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 bg-[#1a1a1a] rounded-lg">
                              <div className="text-4xl mb-4">🔍</div>
                              <h4 className="text-[#f5f5f5] text-lg font-medium mb-2">
                                No Orders Found
                              </h4>
                              <p className="text-[#a0a0a0]">
                                No orders match your search criteria.
                              </p>
                              <p className="text-[#606060] text-sm mt-1">
                                Try searching with a different Order ID.
                              </p>
                            </div>
                          ) : (
                            <>
                              {searchOrderId && (
                                <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#60a5fa] rounded-lg">
                                  <p className="text-[#60a5fa] text-sm">
                                    Found {filteredOrders.length} order
                                    {filteredOrders.length !== 1
                                      ? "s"
                                      : ""}{" "}
                                    matching "{searchOrderId}"
                                    {displayedOrdersCount <
                                      filteredOrders.length &&
                                      ` (showing first ${displayedOrdersCount})`}
                                  </p>
                                </div>
                              )}

                              <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                                <table className="w-full text-left text-[#f5f5f5]">
                                  <thead className="bg-[#1f1f1f] text-[#ababab]">
                                    <tr>
                                      <th className="p-3">Order ID</th>
                                      <th className="p-3">Order Type</th>
                                      <th className="p-3">Status</th>
                                      <th className="p-3">Date & Time</th>
                                      <th className="p-3">Items</th>
                                      <th className="p-3">Deals</th>
                                      <th className="p-3">Base Price</th>
                                      <th className="p-3">Options Price</th>
                                      <th className="p-3">Discount</th>
                                      <th className="p-3">Tax</th>
                                      <th className="p-3">Voucher Discount</th>
                                      <th className="p-3">Deal Amount</th>
                                      <th className="p-3">Deal Tax</th>
                                      <th className="p-3">Delivery Fees</th>
                                      <th className="p-3">Total</th>
                                      <th className="p-3 text-center">
                                        Payment Method
                                      </th>
                                      <th className="p-3 text-center">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ordersToDisplay.map((order, index) => {
                                      // Initialize totals
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
                                          const basePrice =
                                            item.basePrice || item.price || 0;
                                          const optionsPrice = (
                                            item.selectedOptions || []
                                          ).reduce(
                                            (sum, opt) =>
                                              sum + (opt.price || 0),
                                            0
                                          );
                                          const discount = item.discount || 0;
                                          const quantity = item.quantity || 1;

                                          const paymentMethod =
                                            order.paymentMethod || "CASH";
                                          const taxRates = item.tax || {
                                            card: "0",
                                            cash: "0",
                                          };
                                          const taxRate =
                                            paymentMethod === "CARD"
                                              ? parseFloat(taxRates.card || "0")
                                              : parseFloat(
                                                  taxRates.cash || "0"
                                                );

                                          const originalAmount =
                                            basePrice + optionsPrice;
                                          const taxAmount =
                                            (originalAmount * taxRate) / 100;
                                          const finalPrice =
                                            originalAmount -
                                            discount +
                                            taxAmount;

                                          totalBasePrice +=
                                            basePrice * quantity;
                                          totalOptionsPrice +=
                                            optionsPrice * quantity;
                                          totalItemDiscount +=
                                            discount * quantity;
                                          totalTaxAmount +=
                                            taxAmount * quantity;
                                          totalFinalAmount +=
                                            finalPrice * quantity;
                                        });
                                      }

                                      // Process deals
                                      if (order.deals?.length > 0) {
                                        order.deals.forEach((deal) => {
                                          const dealPrice =
                                            parseFloat(deal.dealPrice) || 0;
                                          const dealTax =
                                            parseFloat(deal.dealTax) || 0;
                                          const quantity =
                                            parseInt(deal.quantity) || 1;

                                          totalDealAmount +=
                                            dealPrice * quantity;
                                          totalDealTax +=
                                            ((dealPrice * dealTax) / 100) *
                                            quantity;
                                        });
                                      }

                                      const voucherDiscount =
                                        order.voucherDiscount || 0;
                                      const finalOrderTotal =
                                        totalFinalAmount +
                                        order.deliveryFee +
                                        totalDealAmount +
                                        totalDealTax -
                                        voucherDiscount;

                                      return (
                                        <tr
                                          key={order._id || index}
                                          className="border-b border-gray-600 hover:bg-[#333] cursor-pointer"
                                          onClick={() => setEditingOrder(order)}
                                        >
                                          <td className="p-4">
                                            #
                                            {order._id
                                              ? String(order._id)
                                                  .slice(-8)
                                                  .toUpperCase()
                                              : `ORD-${index + 1}`}
                                          </td>
                                          <td className="p-4">
                                            <span
                                              className={`px-2 py-1 rounded text-xs font-medium ${
                                                order.orderType === "DINE"
                                                  ? "bg-blue-900 text-blue-300"
                                                  : order.orderType ===
                                                    "DELIVERY"
                                                  ? "bg-green-900 text-green-300"
                                                  : order.orderType === "PICKUP"
                                                  ? "bg-orange-900 text-orange-300"
                                                  : "bg-gray-900 text-gray-300"
                                              }`}
                                            >
                                              {order.orderType || "DINE"}
                                            </span>
                                          </td>
                                          <td className="p-4">
                                            <span
                                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                order.orderStatus ===
                                                  "COMPLETED" ||
                                                order.paymentStatus === "PAID"
                                                  ? "bg-green-900 text-green-300"
                                                  : order.orderStatus ===
                                                      "IN_PROGRESS" ||
                                                    order.paymentStatus ===
                                                      "PENDING"
                                                  ? "bg-yellow-900 text-yellow-300"
                                                  : "bg-blue-900 text-blue-300"
                                              }`}
                                            >
                                              {order.orderStatus ||
                                                order.paymentStatus ||
                                                "COMPLETED"}
                                            </span>
                                          </td>
                                          <td className="p-4">
                                            {order.createdAt
                                              ? new Date(
                                                  order.createdAt
                                                ).toLocaleString([], {
                                                  year: "numeric",
                                                  month: "short", // or "2-digit" for 01,02, etc.
                                                  day: "2-digit",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "-"}
                                          </td>

                                          <td className="p-4">
                                            {order.items?.length || 0} Items
                                          </td>
                                          <td className="p-4">
                                            {order.deals?.length || 0} Deals
                                          </td>
                                          <td className="p-4 text-purple-400">
                                            Rs{totalBasePrice.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-blue-400">
                                            Rs{totalOptionsPrice.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-red-400">
                                            Rs{totalItemDiscount.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-green-400">
                                            Rs{totalTaxAmount.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-orange-400">
                                            Rs{voucherDiscount.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-cyan-400">
                                            Rs{totalDealAmount.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-cyan-300">
                                            Rs{totalDealTax.toFixed(2)}
                                          </td>
                                          <td className="p-4 text-cyan-400">
                                            {order.deliveryFee || 0}
                                          </td>
                                          <td className="p-4 font-semibold text-green-400">
                                            Rs{finalOrderTotal.toFixed(2)}
                                          </td>

                                          <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-[#404040] rounded text-xs">
                                              {order.paymentMethod || "CASH"}
                                            </span>
                                          </td>
                                          <td className="p-4 text-center">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOrderForDetails(
                                                  order
                                                );
                                              }}
                                              className="px-3 py-1 bg-[#60a5fa] text-white rounded text-xs hover:bg-[#3b82f6] transition-colors"
                                            >
                                              View Details
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* See More Button */}
                              {hasMoreOrders && (
                                <div className="text-center mt-6">
                                  <button
                                    onClick={() =>
                                      setDisplayedOrdersCount(
                                        (prev) => prev + 5
                                      )
                                    }
                                    className="px-6 py-3 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg font-medium transition-colors"
                                  >
                                    See More Orders (
                                    {filteredOrders.length -
                                      displayedOrdersCount}{" "}
                                    remaining)
                                  </button>
                                </div>
                              )}

                              {/* Show All/Show Less Toggle */}
                              {filteredOrders.length > 5 &&
                                displayedOrdersCount >=
                                  filteredOrders.length && (
                                  <div className="text-center mt-4">
                                    <button
                                      onClick={() => setDisplayedOrdersCount(5)}
                                      className="px-4 py-2 bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] rounded-lg text-sm"
                                    >
                                      Show Less
                                    </button>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-12 bg-[#1a1a1a] rounded-lg">
                      <div className="text-6xl mb-4">📋</div>
                      <h4 className="text-[#f5f5f5] text-lg font-medium mb-2">
                        No Orders Found
                      </h4>
                      <p className="text-[#a0a0a0]">
                        This restaurant hasn't received any orders yet.
                      </p>
                      <p className="text-[#606060] text-sm mt-1">
                        Orders will appear here once customers start placing
                        them.
                      </p>
                    </div>
                  )}

                  {/* Quick Stats Section */}
                  {adminOrders &&
                    adminOrders.length > 0 &&
                    (() => {
                      // Calculate stats based on filtered results if searching
                      const statsOrders = searchOrderId
                        ? adminOrders.filter((order) => {
                            const orderId = order._id
                              ? String(order._id).slice(-8).toUpperCase()
                              : `ORD-${adminOrders.indexOf(order) + 1}`;
                            return orderId.includes(
                              searchOrderId.toUpperCase()
                            );
                          })
                        : adminOrders;

                      return statsOrders.length > 0 ? (
                        <div className="mt-6">
                          {searchOrderId && (
                            <h4 className="text-[#f5f5f5] font-medium mb-3">
                              Statistics for "{searchOrderId}" (
                              {statsOrders.length} orders)
                            </h4>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-[#1a1a1a] p-4 rounded-lg text-center">
                              <h4 className="text-[#60a5fa] text-2xl font-bold">
                                {statsOrders.length}
                              </h4>
                              <p className="text-[#a0a0a0] text-sm">
                                {searchOrderId
                                  ? "Matching Orders"
                                  : "Total Orders"}
                              </p>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-lg text-center">
                              <h4 className="text-[#10b981] text-2xl font-bold">
                                Rs
                                {statsOrders
                                  .reduce((sum, order) => {
                                    let orderTotal = 0;
                                    if (order.items && order.items.length > 0) {
                                      order.items.forEach((item) => {
                                        const basePrice =
                                          item.basePrice ||
                                          item.originalPrice ||
                                          item.price ||
                                          0;
                                        const options = item.options || [];
                                        const optionsPrice = options.reduce(
                                          (sum, opt) => sum + (opt.price || 0),
                                          0
                                        );
                                        const discount =
                                          item.discount ||
                                          item.itemDiscount ||
                                          0;
                                        const quantity = item.quantity || 1;

                                        const paymentMethod =
                                          order.paymentMethod ||
                                          order.paymentType ||
                                          "CASH";
                                        const taxRates = item.tax || {
                                          card: "0",
                                          cash: "0",
                                        };
                                        const taxRate =
                                          paymentMethod === "CARD"
                                            ? parseFloat(taxRates.card || "0")
                                            : parseFloat(taxRates.cash || "0");

                                        const originalAmount =
                                          basePrice + optionsPrice;
                                        const taxAmount =
                                          (originalAmount * taxRate) / 100;
                                        const finalPrice =
                                          originalAmount - discount + taxAmount;

                                        orderTotal += finalPrice * quantity;
                                      });
                                    }
                                    return (
                                      sum +
                                      (orderTotal -
                                        (order.voucherDiscount || 0))
                                    );
                                  }, 0)
                                  .toFixed(2)}
                              </h4>
                              <p className="text-[#a0a0a0] text-sm">
                                Total Revenue
                              </p>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-lg text-center">
                              <h4 className="text-[#f59e0b] text-2xl font-bold">
                                Rs
                                {statsOrders.length > 0
                                  ? (
                                      statsOrders.reduce((sum, order) => {
                                        let orderTotal = 0;
                                        if (
                                          order.items &&
                                          order.items.length > 0
                                        ) {
                                          order.items.forEach((item) => {
                                            const basePrice =
                                              item.basePrice ||
                                              item.originalPrice ||
                                              item.price ||
                                              0;
                                            const options = item.options || [];
                                            const optionsPrice = options.reduce(
                                              (sum, opt) =>
                                                sum + (opt.price || 0),
                                              0
                                            );
                                            const discount =
                                              item.discount ||
                                              item.itemDiscount ||
                                              0;
                                            const quantity = item.quantity || 1;

                                            const paymentMethod =
                                              order.paymentMethod ||
                                              order.paymentType ||
                                              "CASH";
                                            const taxRates = item.tax || {
                                              card: "0",
                                              cash: "0",
                                            };
                                            const taxRate =
                                              paymentMethod === "CARD"
                                                ? parseFloat(
                                                    taxRates.card || "0"
                                                  )
                                                : parseFloat(
                                                    taxRates.cash || "0"
                                                  );

                                            const originalAmount =
                                              basePrice + optionsPrice;
                                            const taxAmount =
                                              (originalAmount * taxRate) / 100;
                                            const finalPrice =
                                              originalAmount -
                                              discount +
                                              taxAmount;

                                            orderTotal += finalPrice * quantity;
                                          });
                                        }
                                        return (
                                          sum +
                                          (orderTotal -
                                            (order.voucherDiscount || 0))
                                        );
                                      }, 0) / statsOrders.length
                                    ).toFixed(2)
                                  : "0.00"}
                              </h4>
                              <p className="text-[#a0a0a0] text-sm">
                                Average Order
                              </p>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-lg text-center">
                              <h4 className="text-[#8b5cf6] text-2xl font-bold">
                                {statsOrders.reduce(
                                  (sum, order) =>
                                    sum + (order.items?.length || 0),
                                  0
                                )}
                              </h4>
                              <p className="text-[#a0a0a0] text-sm">
                                Total Items Sold
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                </div>
              )}

              {adminDetailView === "Categories" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">
                      Categories ({adminCategories.length})
                    </h3>
                    {isLoadingCategories && (
                      <div className="text-[#60a5fa] text-sm">Loading...</div>
                    )}
                  </div>

                  {categoriesError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                      <p className="text-red-300 text-sm">{categoriesError}</p>
                    </div>
                  )}

                  {isLoadingCategories ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60a5fa] mx-auto"></div>
                      <p className="text-[#a0a0a0] mt-2">
                        Loading categories...
                      </p>
                    </div>
                  ) : adminCategories.length > 0 ? (
                    <div className="space-y-3">
                      {adminCategories.map((category) => (
                        <CategoryRow key={category._id} category={category} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#a0a0a0]">
                        No categories found for this admin
                      </p>
                      <button
                        onClick={() => setIsCreateCategoryModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg"
                      >
                        Create First Category
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adminDetailView === "Items" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">
                      Menu Items ({adminItems.length})
                    </h3>
                    {isLoadingItems && (
                      <div className="text-[#60a5fa] text-sm">Loading...</div>
                    )}
                  </div>

                  {itemsError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                      <p className="text-red-300 text-sm">{itemsError}</p>
                    </div>
                  )}

                  {isLoadingItems ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60a5fa] mx-auto"></div>
                      <p className="text-[#a0a0a0] mt-2">
                        Loading menu items...
                      </p>
                    </div>
                  ) : adminItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminItems.map((item) => (
                        <div
                          key={item._id}
                          className="bg-[#1a1a1a] p-4 rounded-lg"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={
                                item.pictureURL ||
                                "https://img.freepik.com/premium-psd/beautiful-food-menu-design-template_1150977-218.jpg?w=360"
                              }
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="text-[#f5f5f5] font-semibold">
                                  {item.name}
                                </h4>
                                <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                                  Available
                                </span>
                              </div>
                              <p className="text-[#a0a0a0] text-sm">
                                Category: {item.categoryId?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <p className="text-[#60a5fa] font-bold mb-3">
                            Rs{item.price}
                          </p>

                          {/* Display Options */}
                          {item.options && item.options.length > 0 && (
                            <div className="mb-3 p-2 bg-[#262626] rounded border border-[#404040]">
                              <h5 className="text-[#f5f5f5] text-xs font-medium mb-2">
                                Options ({item.options.length})
                              </h5>
                              <div className="space-y-1">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center text-xs"
                                  >
                                    <span className="text-[#a0a0a0]">
                                      {option.name}
                                    </span>
                                    {option.option === true ? (
                                      <span className="ml-2 px-1 bg-green-900 text-green-300 text-xs rounded">
                                        Option
                                      </span>
                                    ) : (
                                      <span className="ml-2 px-1 bg-blue-900 text-blue-300 text-xs rounded">
                                        Addon
                                      </span>
                                    )}
                                    <span className="text-[#10b981] font-medium">
                                      +Rs{option.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItemClick(item)}
                              className="flex-1 py-2 bg-[#404040] hover:bg-[#505050] rounded text-[#f5f5f5] text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItemClick(item)}
                              className="flex-1 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded text-white text-sm transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#a0a0a0]">
                        No menu items found for this admin
                      </p>
                      <button
                        onClick={() => setIsCreateItemModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg"
                      >
                        Create First Item
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adminDetailView === "Menu" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">
                      Restaurant Menu
                    </h3>
                    {isLoadingMenu && (
                      <div className="text-[#60a5fa] text-sm">
                        Loading menu...
                      </div>
                    )}
                  </div>

                  {menuError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                      <p className="text-red-300 text-sm">{menuError}</p>
                    </div>
                  )}

                  {isLoadingMenu ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60a5fa] mx-auto"></div>
                      <p className="text-[#a0a0a0] mt-2">Loading menu...</p>
                    </div>
                  ) : adminMenu ? (
                    <div className="space-y-6">
                      {/* Multiple Menus Display */}
                      {Array.isArray(adminMenu) ? (
                        adminMenu.map((menu, menuIndex) => (
                          <div
                            key={menu._id}
                            className="bg-[#1a1a1a] p-6 rounded-lg border border-[#404040]"
                          >
                            {/* Menu Header */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 bg-[#404040] rounded-lg flex items-center justify-center overflow-hidden">
                                {menu.logo ? (
                                  <img
                                    src={menu.logo}
                                    alt={menu.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <MdRestaurantMenu className="text-[#60a5fa] text-2xl" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-[#f5f5f5] font-bold text-xl">
                                      {menu.name}
                                    </h4>
                                    <p className="text-[#a0a0a0] text-sm">
                                      Created:{" "}
                                      {new Date(
                                        menu.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                    <p className="text-[#60a5fa] text-sm">
                                      {menu.itemsID?.length || 0} items in this
                                      menu
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                                      Menu #{menuIndex + 1}
                                    </span>
                                    <button
                                      onClick={() => handleEditMenuClick(menu)}
                                      className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#10b981] transition-colors"
                                      title="Edit Menu"
                                    >
                                      <FaEdit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMenuClick(menu)
                                      }
                                      className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#ef4444] transition-colors"
                                      title="Delete Menu"
                                    >
                                      <FaTrash size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items for this specific menu */}
                            <div>
                              <h6 className="text-[#f5f5f5] font-medium mb-3">
                                Items in "{menu.name}" (
                                {menu.itemsID?.length || 0})
                              </h6>

                              {menu.itemsID && menu.itemsID.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {menu.itemsID.map((item) => {
                                    // Find the processed item with category info
                                    const processedItem =
                                      menuItems.find(
                                        (mi) => mi._id === item._id
                                      ) || item;
                                    return (
                                      <div
                                        key={item._id}
                                        className="bg-[#262626] p-3 rounded-lg border border-[#505050]"
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <img
                                            src={
                                              item.pictureURL ||
                                              "https://img.freepik.com/premium-psd/beautiful-food-menu-design-template_1150977-218.jpg?w=360"
                                            }
                                            alt={item.name}
                                            className="w-10 h-10 rounded object-cover"
                                          />
                                          <div className="flex-1">
                                            <h6 className="text-[#f5f5f5] font-medium text-sm">
                                              {item.name}
                                            </h6>
                                            <p className="text-[#a0a0a0] text-xs">
                                              Category:{" "}
                                              {processedItem.categoryId?.name ||
                                                "N/A"}
                                            </p>
                                          </div>
                                          <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-300">
                                            Rs{item.price}
                                          </span>
                                        </div>

                                        {/* Display Options */}
                                        {item.options &&
                                          item.options.length > 0 && (
                                            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border border-[#404040]">
                                              <h6 className="text-[#f5f5f5] text-xs font-medium mb-1">
                                                Options ({item.options.length})
                                              </h6>
                                              <div className="space-y-1">
                                                {item.options.map(
                                                  (option, optionIndex) => (
                                                    <div
                                                      key={optionIndex}
                                                      className="flex justify-between items-center text-xs"
                                                    >
                                                      <span className="text-[#a0a0a0]">
                                                        {option.name}
                                                      </span>
                                                      <span className="text-[#10b981] font-medium">
                                                        +Rs{option.price}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-4 bg-[#262626] rounded-lg">
                                  <p className="text-[#a0a0a0] text-sm">
                                    No items in this menu
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Single Menu Display (fallback) */
                        <div className="bg-[#1a1a1a] p-6 rounded-lg">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-[#404040] rounded-lg flex items-center justify-center overflow-hidden">
                              {adminMenu.logo ? (
                                <img
                                  src={adminMenu.logo}
                                  alt={adminMenu.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <MdRestaurantMenu className="text-[#60a5fa] text-2xl" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-[#f5f5f5] font-bold text-xl">
                                    {adminMenu.name}
                                  </h4>
                                  <p className="text-[#a0a0a0] text-sm">
                                    Created:{" "}
                                    {new Date(
                                      adminMenu.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-[#60a5fa] text-sm">
                                    {menuItems.length} items in menu
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditMenuClick(adminMenu)
                                    }
                                    className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#10b981] transition-colors"
                                    title="Edit Menu"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteMenuClick(adminMenu)
                                    }
                                    className="p-2 bg-[#404040] hover:bg-[#505050] rounded text-[#ef4444] transition-colors"
                                    title="Delete Menu"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary Section */}
                      <div className="bg-[#1a1a1a] p-4 rounded-lg">
                        <h5 className="text-[#f5f5f5] font-semibold mb-3">
                          Summary - All Menu Items ({menuItems.length} total)
                        </h5>

                        {isLoadingMenuItems ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#60a5fa] mx-auto"></div>
                            <p className="text-[#a0a0a0] mt-2 text-sm">
                              Loading menu items...
                            </p>
                          </div>
                        ) : menuItems.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                              <div
                                key={item._id}
                                className="bg-[#262626] p-4 rounded-lg border border-[#505050]"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <img
                                    src={
                                      item.pictureURL ||
                                      "https://img.freepik.com/premium-psd/beautiful-food-menu-design-template_1150977-218.jpg?w=360"
                                    }
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h6 className="text-[#f5f5f5] font-semibold">
                                        {item.name}
                                      </h6>
                                      <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                                        In Menu
                                      </span>
                                    </div>
                                    <p className="text-[#a0a0a0] text-sm">
                                      Category: {item.categoryId?.name || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-[#60a5fa] font-bold mb-2">
                                  Rs{item.price}
                                </p>

                                {/* Display Options */}
                                {item.options && item.options.length > 0 && (
                                  <div className="mb-2 p-2 bg-[#1a1a1a] rounded border border-[#404040]">
                                    <h6 className="text-[#f5f5f5] text-xs font-medium mb-1">
                                      Options ({item.options.length})
                                    </h6>
                                    <div className="space-y-1">
                                      {item.options.map(
                                        (option, optionIndex) => (
                                          <div
                                            key={optionIndex}
                                            className="flex justify-between items-center text-xs"
                                          >
                                            <span className="text-[#a0a0a0]">
                                              {option.name}
                                            </span>
                                            <span className="text-[#10b981] font-medium">
                                              +Rs{option.price}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {item.description && (
                                  <p className="text-[#a0a0a0] text-sm mb-3 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-[#262626] rounded-lg">
                            <MdRestaurantMenu className="text-[#404040] text-2xl mx-auto mb-2" />
                            <p className="text-[#a0a0a0] text-sm">
                              No items found across all menus
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#1a1a1a] rounded-lg">
                      <MdRestaurantMenu className="text-[#404040] text-4xl mx-auto mb-3" />
                      <p className="text-[#a0a0a0] mb-4">
                        No menu created for this admin yet
                      </p>
                      <button
                        onClick={() => setIsCreateMenuModalOpen(true)}
                        className="px-6 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg"
                      >
                        Create Menu
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adminDetailView === "Vouchers" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">
                      Voucher Management
                    </h3>
                    <button
                      onClick={handleCreateVoucher}
                      className="px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg font-medium"
                    >
                      + Create Voucher
                    </button>
                  </div>

                  {vouchersError && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
                      <p className="text-red-100 text-sm">{vouchersError}</p>
                    </div>
                  )}

                  {isLoadingVouchers ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60a5fa]"></div>
                    </div>
                  ) : allVouchers.length > 0 ? (
                    <div className="grid gap-4">
                      {allVouchers.map((voucher) => (
                        <div
                          key={voucher._id}
                          className="bg-[#1a1a1a] p-4 rounded-lg border border-[#404040]"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-[#f5f5f5] font-medium">
                                  Voucher Code: #{voucher.code}
                                </h4>
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                  Rs{voucher.voucherPrice}
                                </span>
                              </div>
                              <p className="text-[#a0a0a0] text-sm mb-2">
                                Menu: {voucher.menuId?.name || "Unknown Menu"}
                              </p>
                              <p className="text-[#606060] text-xs">
                                Created:{" "}
                                {new Date(
                                  voucher.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditVoucher(voucher)}
                                className="p-2 text-[#60a5fa] hover:bg-[#262626] rounded"
                                title="Edit Voucher"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteVoucherClick(voucher)
                                }
                                className="p-2 text-red-500 hover:bg-[#262626] rounded"
                                title="Delete Voucher"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#1a1a1a] rounded-lg">
                      <div className="text-[#404040] text-4xl mx-auto mb-3">
                        🎟️
                      </div>
                      <p className="text-[#a0a0a0] mb-4">
                        No vouchers created yet
                      </p>
                      <button
                        onClick={handleCreateVoucher}
                        className="px-6 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg"
                      >
                        Create First Voucher
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adminDetailView === "Deals" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">
                      Deal Management
                    </h3>
                    <button
                      onClick={handleCreateDeal}
                      className="px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg font-medium"
                    >
                      + Create Deal
                    </button>
                  </div>

                  {dealsError && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
                      <p className="text-red-100 text-sm">{dealsError}</p>
                    </div>
                  )}

                  {isLoadingDeals ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60a5fa]"></div>
                    </div>
                  ) : allDeals.length > 0 ? (
                    <div className="grid gap-4">
                      {allDeals.map((deal) => (
                        <div
                          key={deal._id}
                          className="bg-[#1a1a1a] p-4 rounded-lg border border-[#404040]"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-[#f5f5f5] font-medium">
                                  {deal.name}
                                </h4>
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                  Rs{deal.dealPrice}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    deal.isActive
                                      ? "bg-green-900 text-green-300"
                                      : "bg-red-900 text-red-300"
                                  }`}
                                >
                                  {deal.isActive ? "Active" : "Inactive"}
                                </span>
                                {deal.savings > 0 && (
                                  <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                                    Save Rs{deal.savings}
                                  </span>
                                )}
                              </div>
                              {deal.description && (
                                <p className="text-[#a0a0a0] text-sm mb-2">
                                  {deal.description}
                                </p>
                              )}
                              <div className="text-[#a0a0a0] text-sm mb-2">
                                Items: {deal.items?.length || 0} items included
                              </div>
                              <div className="flex gap-4 text-xs text-[#606060]">
                                <span>Original: Rs{deal.originalPrice}</span>
                                <span>
                                  Created:{" "}
                                  {new Date(
                                    deal.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {deal.validUntil && (
                                  <span>
                                    Expires:{" "}
                                    {new Date(
                                      deal.validUntil
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditDeal(deal)}
                                className="p-2 text-[#60a5fa] hover:bg-[#262626] rounded"
                                title="Edit Deal"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteDeal(deal)}
                                className="p-2 text-red-500 hover:bg-[#262626] rounded"
                                title="Delete Deal"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {/* Deal Items Display */}
                          {deal.items && deal.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#404040]">
                              <h5 className="text-[#f5f5f5] text-sm font-medium mb-2">
                                Included Items:
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {deal.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-[#a0a0a0] bg-[#262626] p-2 rounded"
                                  >
                                    {item.itemId?.name || "Unknown Item"} ×{" "}
                                    {item.quantity}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Section for Customizations */}
                          {deal.customizations &&
                            deal.customizations.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#404040]">
                                <h5 className="text-[#f5f5f5] text-sm font-medium mb-2">
                                  Customizations:
                                </h5>
                                <div className="space-y-2">
                                  {deal.customizations.map(
                                    (customization, custIndex) => (
                                      <div
                                        key={custIndex}
                                        className="bg-[#262626] p-3 rounded"
                                      >
                                        <p className="text-[#f5f5f5] text-sm font-semibold">
                                          {customization.name}
                                          <span className="ml-2 text-xs text-[#a0a0a0]">
                                            ({customization.minSelect}-
                                            {customization.maxSelect}{" "}
                                            selections)
                                          </span>
                                        </p>
                                        {customization.options &&
                                          customization.options.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {customization.options.map(
                                                (option, optIndex) => (
                                                  <span
                                                    key={optIndex}
                                                    className="px-2 py-1 text-xs text-white bg-[#404040] rounded-full flex items-center gap-1"
                                                  >
                                                    {option.name}
                                                    {option.price > 0 && (
                                                      <span className="text-green-300">
                                                        +Rs{option.price}
                                                      </span>
                                                    )}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#1a1a1a] rounded-lg">
                      <div className="text-[#404040] text-4xl mx-auto mb-3">
                        🎯
                      </div>
                      <p className="text-[#a0a0a0] mb-4">
                        No deals created yet
                      </p>
                      <button
                        onClick={handleCreateDeal}
                        className="px-6 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-lg"
                      >
                        Create First Deal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adminDetailView === "Settings" && (
                <div>
                  <h3 className="text-lg font-bold text-[#f5f5f5] mb-4">
                    Admin Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-[#f5f5f5] font-medium">
                          Account Status
                        </h4>
                        <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                          Active
                        </span>
                      </div>
                      <p className="text-[#a0a0a0] text-sm mb-2">
                        Admin account is active and operational
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button className="px-4 py-2 bg-[#404040] hover:bg-[#505050] rounded text-[#f5f5f5] text-sm">
                          Edit Profile
                        </button>
                        <button className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded text-white text-sm">
                          Suspend Account
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <h4 className="text-[#f5f5f5] font-medium mb-2">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => setIsCreateCategoryModalOpen(true)}
                          className="p-3 bg-[#262626] hover:bg-[#404040] rounded text-center"
                        >
                          <FaUserPlus className="text-[#60a5fa] mx-auto mb-1" />
                          <p className="text-[#f5f5f5] text-sm">Add Category</p>
                        </button>
                        <button
                          onClick={() => setIsCreateItemModalOpen(true)}
                          className="p-3 bg-[#262626] hover:bg-[#404040] rounded text-center"
                        >
                          <FaUtensils className="text-[#10b981] mx-auto mb-1" />
                          <p className="text-[#f5f5f5] text-sm">Add Item</p>
                        </button>
                        <button
                          onClick={() => setIsCreateMenuModalOpen(true)}
                          className="p-3 bg-[#262626] hover:bg-[#404040] rounded text-center"
                        >
                          <MdRestaurantMenu className="text-[#f59e0b] mx-auto mb-1" />
                          <p className="text-[#f5f5f5] text-sm">Create Menu</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminDetailView === "Insights" && (
                <AdminInsights
                  selectedAdmin={selectedAdmin}
                  adminOrders={adminOrders}
                  analyticsData={analyticsData}
                  isLoadingOrders={isLoadingOrders}
                  isAdminLoading={isLoadingAdmins} // Add this line
                  isExportingExcel={isExportingExcel}
                  ordersError={ordersError}
                  onExportToExcel={handleExportToExcel}
                  onExportSingleOrder={handleExportSingleOrder}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-6 md:px-4">
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#f5f5f5]">
              All Admins ({allAdmins.length})
            </h3>
            <div className="flex items-center gap-3">
              {isLoadingAdmins && (
                <div className="text-[#60a5fa] text-sm">Loading...</div>
              )}
              <button
                onClick={fetchAllAdmins}
                disabled={isLoadingAdmins}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLoadingAdmins
                    ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                    : "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                }`}
              >
                {isLoadingAdmins ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {adminsError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{adminsError}</p>
            </div>
          )}

          {isLoadingAdmins ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60a5fa] mx-auto"></div>
              <p className="text-[#a0a0a0] mt-4">Loading administrators...</p>
            </div>
          ) : allAdmins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="bg-[#262626] p-6 rounded-lg cursor-pointer hover:bg-[#404040] transition-colors border border-[#404040] hover:border-[#60a5fa]"
                  onClick={() => {
                    setSelectedAdmin(admin);
                    // Pre-fetch data for the selected admin
                    fetchCategoriesForAdmin(admin._id);
                    fetchItemsForAdmin(admin._id);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[#f5f5f5] font-bold text-lg">
                        {admin.name}
                      </h4>
                      <p className="text-[#a0a0a0] text-sm">{admin.email}</p>
                      <p className="text-[#60a5fa] text-sm">
                        {admin.role || "Admin"}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0] text-sm">Phone:</span>
                      <span className="text-[#f5f5f5] text-sm">
                        {admin.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0] text-sm">Admin ID:</span>
                      <span className="text-[#f5f5f5] text-sm text-xs">
                        {admin._id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0] text-sm">Joined:</span>
                      <span className="text-[#60a5fa] text-sm font-medium">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="w-full py-2 bg-[#60a5fa] hover:bg-[#3b82f6] rounded text-white text-sm font-medium">
                      View Details
                    </button>
                  </div>

                  <p className="text-[#606060] text-xs mt-3 text-center">
                    Click to view categories and menu items
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUsers className="text-[#404040] text-6xl mx-auto mb-4" />
              <p className="text-[#a0a0a0] text-lg">No administrators found</p>
              <p className="text-[#606060] text-sm mt-2">
                Create your first admin user in the Setup Wizard
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };


  export default AllAdminsTab