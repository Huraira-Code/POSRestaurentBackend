import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import OrdersManagement from "../components/orders/OrdersManagement";

const Orders = () => {
  useEffect(() => {
    document.title = "POS | Orders"
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-xl font-semibold text-[#f5f5f5]">Orders</h1>
            </div>
          </div>
        </div>
      </div>

      <OrdersManagement />
      
      <BottomNav />
    </div>
  );
};

export default Orders;
