import React from "react";
import { orders } from "../../constants";
import { GrUpdate } from "react-icons/gr";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  // Note: Order status updates are now handled through the new order management system
  const handleStatusChange = ({orderId, orderStatus}) => {
    console.log("Order status change requested:", orderId, orderStatus);
    enqueueSnackbar("Order status updates are handled in the new Orders Management section", { variant: "info" });
  };

  // const orderStatusUpdateMutation = useMutation({
  //   mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
  //   onSuccess: (data) => {
  //     enqueueSnackbar("Order status updated successfully!", { variant: "success" });
  //     queryClient.invalidateQueries(["orders"]); // Refresh order list
  //   },
  //   onError: () => {
  //     enqueueSnackbar("Failed to update order status!", { variant: "error" });
  //   }
  // })

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  console.log(resData?.data);

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Order Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {resData?.data?.map((order, index) => (
              <tr
                key={index}
                className="border-b border-gray-600 hover:bg-[#333]"
              >
                <td className="p-4">#{order._id.slice(-6)}</td>
                <td className="p-4">{order.customerInfo?.name || 'Guest'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.orderType === 'DINE' ? 'bg-blue-500' : 
                    order.orderType === 'DELIVERY' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {order.orderType}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.orderStatus === "COMPLETED"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-black"
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-4">{formatDateAndTime(order.printedAt)}</td>
                <td className="p-4">{order.items.length} Items</td>
                <td className="p-4">Rs{order.totalAmount}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.paymentStatus === "PAID" 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
