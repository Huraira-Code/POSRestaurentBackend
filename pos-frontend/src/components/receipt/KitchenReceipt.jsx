import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaUtensils, FaPrint } from "react-icons/fa";

const KitchenReceipt = ({ receipt, onClose }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Kitchen Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { width: 300px; border: 1px solid #ddd; padding: 15px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 10px; }
            .divider { border-bottom: 1px dashed #333; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .priority { background-color: #fff3cd; padding: 5px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[80vh] overflow-auto">
        {/* Receipt Content for Printing */}
        <div ref={receiptRef} className="p-4">
          {/* Receipt Header */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-orange-500 rounded-full flex items-center justify-center shadow-lg bg-orange-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaUtensils className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Kitchen Order</h2>
          <p className="text-gray-600 text-center mb-4">Order Preparation Instructions</p>

          {/* Menu Details */}
          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p><strong>Order:</strong> {receipt.title || 'Kitchen Order'}</p>
            <p><strong>Order ID:</strong> {receipt._id?.substring(0, 8)}...</p>
            <p><strong>Time:</strong> {new Date(receipt.printedAt).toLocaleString()}</p>
            {receipt.customerInfo && (
              <>
                <p><strong>Customer:</strong> {receipt.customerInfo.name}</p>
                <p><strong>Table:</strong> {receipt.customerInfo.table}</p>
              </>
            )}
          </div>

          <div className="divider"></div>

          {/* Priority Notice */}
          <div className="priority text-center text-sm mb-4">
            ⚡ PREPARE IMMEDIATELY
          </div>

          {/* Items to Prepare */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Items to Prepare</h3>
            {receipt.groupedItems ? (
              // Handle grouped items structure
              Object.values(receipt.groupedItems).map((group, groupIndex) => (
                <div key={groupIndex} className="mb-3">
                  <div className="bg-orange-100 p-2 rounded mb-2">
                    <h4 className="font-semibold text-xs text-orange-800">
                      🍽️ {group.displayName || `${group.groupType}: ${group.groupName}`}
                    </h4>
                  </div>
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="item-row text-sm border-b border-gray-200 pb-2 ml-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.name}</span>
                        {item.notes && <span className="text-gray-500 text-xs">Note: {item.notes}</span>}
                      </div>
                      <span className="font-bold text-lg">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Handle legacy items structure (fallback)
              receipt.items?.map((item, index) => (
                <div key={index} className="item-row text-sm border-b border-gray-200 pb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    {item.notes && <span className="text-gray-500 text-xs">Note: {item.notes}</span>}
                  </div>
                  <span className="font-bold text-lg">x{item.quantity}</span>
                </div>
              ))
            )}
          </div>

          <div className="divider"></div>

          {/* Total Items Count */}
          <div className="text-center text-sm font-bold">
            Total Items: {receipt.totalItems || (receipt.items ? receipt.items.reduce((sum, item) => sum + item.quantity, 0) : 0)}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            <FaPrint /> Print Kitchen Order
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenReceipt;
