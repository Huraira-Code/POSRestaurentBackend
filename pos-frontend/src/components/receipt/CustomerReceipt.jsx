import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPrint } from "react-icons/fa";

const CustomerReceipt = ({ receipt, onClose }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Customer Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { width: 300px; border: 1px solid #ddd; padding: 15px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 10px; }
            .divider { border-bottom: 1px dashed #333; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { font-weight: bold; border-top: 1px solid #333; padding-top: 5px; }
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
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaCheck className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Customer Receipt</h2>
          <p className="text-gray-600 text-center mb-4">Thank you for your order!</p>

          {/* Menu Details */}
          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p><strong>Order:</strong> {receipt.title || 'Customer Receipt'}</p>
            <p><strong>Receipt ID:</strong> {receipt._id?.substring(0, 8)}...</p>
            <p><strong>Printed At:</strong> {new Date(receipt.printedAt).toLocaleString()}</p>
            {receipt.customerInfo && (
              <>
                <p><strong>Customer:</strong> {receipt.customerInfo.name}</p>
                <p><strong>Table:</strong> {receipt.customerInfo.table}</p>
                {receipt.customerInfo.phone !== 'N/A' && (
                  <p><strong>Phone:</strong> {receipt.customerInfo.phone}</p>
                )}
              </>
            )}
          </div>

          <div className="divider"></div>

          {/* Items Summary */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Items Ordered</h3>
            {receipt.groupedItems ? (
              // Handle grouped items structure
              Object.values(receipt.groupedItems).map((group, groupIndex) => (
                <div key={groupIndex} className="mb-3">
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="font-semibold text-xs text-gray-800">
                      📋 {group.displayName || `${group.groupType}: ${group.groupName}`}
                    </h4>
                  </div>
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="item-row text-sm ml-2">
                      <div className="flex-1">
                        <span>{item.name} x{item.quantity}</span>
                        {item.notes && <div className="text-xs text-gray-500 italic">Note: {item.notes}</div>}
                      </div>
                      <span>Rs{item.totalPrice?.toFixed(2) || (item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Handle legacy items structure (fallback)
              receipt.items?.map((item, index) => (
                <div key={index} className="item-row text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>RYs{item.price?.toFixed(2) || '0.00'}</span>
                </div>
              ))
            )}
          </div>

          <div className="divider"></div>

          {/* Total */}
          <div className="total-row text-sm">
            <div className="flex justify-between">
              <span><strong>Total Items:</strong></span>
              <span><strong>{receipt.totalItems || 0}</strong></span>
            </div>
            {receipt.subtotalAmount && receipt.subtotalAmount !== receipt.totalAmount && (
              <>
                <div className="flex justify-between">
                  <span><strong>Subtotal:</strong></span>
                  <span><strong>Rs{receipt.subtotalAmount.toFixed(2)}</strong></span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span><strong>Discount:</strong></span>
                  <span><strong>-Rs{(receipt.discountAmount || 0).toFixed(2)}</strong></span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span><strong>Total Amount:</strong></span>
              <span><strong>Rs{receipt.totalAmount?.toFixed(2) || '0.00'}</strong></span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <FaPrint /> Print Receipt
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

export default CustomerReceipt;
