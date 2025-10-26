import React, { useEffect, useState } from "react";
import { getOrders, updateOrder } from "../../https/index";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";

// Helper functions for pricing (reused from your original code)
const getItemPrice = (item) => item.price;
const getItemFinalPrice = (item) =>
  getItemPrice(item) - (item.itemDiscount || 0);

const UpdateOrderModal = ({
  isOpen,
  onClose,
  updateOrder,
  cartItems,
  deals,
  onSelect,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Get data directly from your Redux store, this is the data to be added

  console.log("meralogbhai log", cartItems, deals);
  // States for handling kitchen receipts
  const [newKitchenReceipts, setNewKitchenReceipts] = useState([]);
  const [autoPrintNewItems, setAutoPrintNewItems] = useState(true);
  const [showNewKitchenReceiptsModal, setShowNewKitchenReceiptsModal] =
    useState(false);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getOrders()
        .then((res) => {
          const inProgressOrders = res.data.data.filter(
            (order) =>
              order.orderStatus &&
              order.orderStatus.toLowerCase() === "in_progress"
          );
          setOrders(inProgressOrders);
          console.log("In progress orders:", inProgressOrders);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6">
        {selectedOrder ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Update Order #
              {selectedOrder.orderNumber || selectedOrder._id.slice(-4)}
            </h2>

            {/* Display the items and deals FROM THE REDUX CART */}
            <div className="my-4 p-4 border rounded max-h-60 overflow-y-auto">
              <h3 className="font-medium">Items to Add</h3>
              {cartItems.length === 0 && deals.length === 0 ? (
                <p>
                  Your cart is empty. Please add items to update this order.
                </p>
              ) : (
                <ul>
                  {cartItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center my-2"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                    </li>
                  ))}
                  {deals.map((deal) => (
                    <li
                      key={deal.uniqueId}
                      className="flex justify-between items-center my-2"
                    >
                      <span>
                        {deal.name} × {deal.quantity} (Deal)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Back to Orders
              </button>
              <button
                onClick={updateOrder}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={
                  isUpdatingOrder ||
                  (cartItems.length === 0 && deals.length === 0)
                }
              >
                {isUpdatingOrder ? "Updating..." : "Update Order"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Orders In Progress</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders in progress.</p>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto border rounded">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm">
                      <th className="p-2 border">Order #</th>
                      <th className="p-2 border">Customer</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Type</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 text-sm">
                        <td className="p-2 border">
                          #{order.orderNumber || order._id.slice(-4)}
                        </td>
                        <td className="p-2 border">
                          {order.customerInfo?.name || "Walk-in"}
                        </td>
                        <td className="p-2 border">Rs {order.totalAmount}</td>
                        <td className="p-2 border">{order.orderStatus}</td>
                        <td className="p-2 border">{order.orderType}</td>
                        <td className="p-2 border">
                          <button
                            onClick={() => {
                              setSelectedOrder(order); // modal’s own state update
                              if (onSelect) onSelect(order); // parent callback
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateOrderModal;
