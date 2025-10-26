import React, { useState } from "react";
import { useSelector } from "react-redux";
import CustomerReceipt from "./CustomerReceipt";
import KitchenReceipt from "./KitchenReceipt";
import { FaReceipt, FaUtensils, FaTimes, FaPrint } from "react-icons/fa";

const ReceiptManager = ({ onClose }) => {
  const { customerReceipts, kitchenReceipts } = useSelector((state) => state.receipt);
  const [selectedCustomerReceipt, setSelectedCustomerReceipt] = useState(null);
  const [selectedKitchenReceipt, setSelectedKitchenReceipt] = useState(null);

  // Function to print all receipts at once in one consolidated document optimized for thermal printer
  const handlePrintAllReceipts = () => {
    console.log('🖨️ Print All Receipts clicked - Creating thermal printer optimized document');
    console.log('📋 Customer receipts count:', customerReceipts.length);
    console.log('🍽️ Kitchen receipts count:', kitchenReceipts.length);
    
    if (customerReceipts.length === 0 && kitchenReceipts.length === 0) {
      console.log('❌ No receipts to print');
      return;
    }
    
    try {
      const printWindow = window.open("", "_blank", "width=300,height=800,scrollbars=yes");
      
      if (!printWindow) {
        console.error('❌ Failed to open print window - popup might be blocked');
        alert('Please allow popups for printing receipts');
        return;
      }
      
      // Start building the thermal printer optimized HTML document
      let consolidatedHTML = `
        <html>
          <head>
            <title>Thermal Receipt - Order Summary</title>
            <style>
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 2mm;
                }
              }
              
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 10px;
                line-height: 1.2;
                margin: 0;
                padding: 2mm;
                width: 76mm;
                max-width: 76mm;
                color: #000;
                background: #fff;
              }
              
              .main-header {
                text-align: center;
                border-bottom: 1px solid #000;
                padding-bottom: 4px;
                margin-bottom: 6px;
                font-size: 12px;
                font-weight: bold;
              }
              
              .receipt-section {
                border-bottom: 1px dashed #000;
                margin-bottom: 8px;
                padding-bottom: 8px;
              }
              
              .receipt-header { 
                text-align: center; 
                border-bottom: 1px solid #000; 
                padding-bottom: 3px; 
                margin-bottom: 4px;
                font-size: 11px;
                font-weight: bold;
              }
              
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 1px 0;
                font-size: 9px;
              }
              
              .info-row span {
                word-wrap: break-word;
              }
              
              .items { 
                border-top: 1px dashed #000; 
                border-bottom: 1px dashed #000; 
                padding: 3px 0; 
                margin: 4px 0; 
              }
              
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 1px 0;
                font-size: 9px;
              }
              
              .item-name {
                flex: 1;
                margin-right: 4px;
                word-wrap: break-word;
              }
              
              .item-qty {
                white-space: nowrap;
              }
              
              .total-section { 
                border-top: 1px solid #000; 
                padding-top: 3px; 
                font-weight: bold;
                font-size: 10px;
              }
              
              .priority { 
                background-color: #000; 
                color: #fff;
                padding: 2px; 
                text-align: center; 
                font-weight: bold; 
                margin: 3px 0;
                font-size: 10px;
              }
              
              .footer { 
                text-align: center; 
                margin-top: 4px; 
                font-size: 8px;
                border-top: 1px dashed #000;
                padding-top: 3px;
              }
              
              .separator {
                text-align: center;
                font-size: 8px;
                margin: 4px 0;
              }
              
              .menu-header {
                background-color: #000;
                color: #fff;
                text-align: center;
                padding: 2px;
                font-size: 9px;
                font-weight: bold;
                margin: 2px 0;
              }
              
              .cut-line {
                text-align: center;
                font-size: 8px;
                margin: 6px 0;
                border-top: 1px dashed #000;
                padding-top: 2px;
              }
            </style>
          </head>
          <body>
            <div class="main-header">
              COMPLETE ORDER<br>
              ALL RECEIPTS
            </div>
            
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span>Time:</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>`;

      // Add all customer receipts
      if (customerReceipts.length > 0) {
        consolidatedHTML += `<div class="separator">═══ CUSTOMER RECEIPTS ═══</div>`;
        customerReceipts.forEach((receipt, index) => {
          consolidatedHTML += generateThermalReceiptHTML(receipt, 'customer', index);
        });
      }

      // Add all kitchen receipts  
      if (kitchenReceipts.length > 0) {
        consolidatedHTML += `<div class="separator">═══ KITCHEN ORDERS ═══</div>`;
        kitchenReceipts.forEach((receipt, index) => {
          consolidatedHTML += generateThermalReceiptHTML(receipt, 'kitchen', index);
        });
      }

      consolidatedHTML += `
            <div class="cut-line">
              ✂ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✂
            </div>
          </body>
        </html>`;

      printWindow.document.write(consolidatedHTML);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
      
      console.log(`✅ Thermal receipt document created with ${customerReceipts.length + kitchenReceipts.length} receipts`);
      
    } catch (error) {
      console.error('❌ Error creating thermal receipt document:', error);
      alert('Failed to print receipts. Please try again.');
    }
  };

  // Helper function to generate thermal printer optimized HTML for individual receipts
  const generateThermalReceiptHTML = (receipt, type, index) => {
    const isKitchen = type === 'kitchen';
    
    return `
      <div class="receipt-section">
        <div class="receipt-header">
          ${isKitchen ? 'KITCHEN ORDER' : 'CUSTOMER RECEIPT'}<br>
          ${receipt.menuName || 'General'}
        </div>
        
        <div class="info-row">
          <span>Order#:</span>
          <span>${receipt._id ? receipt._id.toString().slice(-6) : 'N/A'}</span>
        </div>
        
        ${receipt.customerInfo ? `
          <div class="info-row">
            <span>Customer:</span>
            <span>${receipt.customerInfo.name}</span>
          </div>
          <div class="info-row">
            <span>Table:</span>
            <span>${receipt.customerInfo.table}</span>
          </div>
          ${receipt.customerInfo.phone !== 'N/A' ? `
            <div class="info-row">
              <span>Phone:</span>
              <span>${receipt.customerInfo.phone}</span>
            </div>
          ` : ''}
        ` : ''}
        
        ${isKitchen ? '<div class="priority">URGENT - PREPARE NOW</div>' : ''}
        
        <div class="items">
          <div style="font-weight: bold; margin-bottom: 2px; font-size: 9px;">
            ${isKitchen ? 'PREPARE:' : 'ITEMS:'}
          </div>
          
          ${receipt.groupedItems ? 
            Object.values(receipt.groupedItems).map(group => `
              ${group.items.map(item => `
                <div class="item-row">
                  <span class="item-name">${item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</span>
                  <span class="item-qty">x${item.quantity}</span>
                </div>
                ${!isKitchen && item.price ? `
                  <div class="info-row" style="margin-left: 4px; font-size: 8px;">
                    <span>@ Rs${(item.price / item.quantity).toFixed(2)}</span>
                    <span>Rs${item.price.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${item.notes ? `<div style="font-size: 8px; margin-left: 4px; color: #000000;">Note: ${item.notes}</div>` : ''}
              `).join('')}
            `).join('')
            :
            receipt.items?.map(item => `
              <div class="item-row">
                <span class="item-name">${item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</span>
                <span class="item-qty">x${item.quantity}</span>
              </div>
              ${!isKitchen && item.price ? `
                <div class="info-row" style="margin-left: 4px; font-size: 8px;">
                  <span>@ Rs${(item.price / item.quantity).toFixed(2)}</span>
                  <span>Rs${item.price.toFixed(2)}</span>
                </div>
              ` : ''}
              ${item.notes ? `<div style="font-size: 8px; margin-left: 4px;">Note: ${item.notes}</div>` : ''}
            `).join('') || ''
          }
        </div>
        
        ${isKitchen ? `
          <div style="text-align: center; font-weight: bold;">
            TOTAL ITEMS: ${receipt.totalItems || (receipt.items ? receipt.items.reduce((sum, item) => sum + item.quantity, 0) : 0)}
          </div>
        ` : `
          <div class="total-section">
            ${receipt.discount && receipt.discount > 0 ? `
              <div class="info-row">
                <span>Subtotal:</span>
                <span>Rs${receipt.originalAmount.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>Discount:</span>
                <span>-Rs${receipt.discount.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>TOTAL:</span>
                <span>Rs${receipt.totalAmount.toFixed(2)}</span>
              </div>
            ` : `
              <div class="info-row">
                <span>TOTAL:</span>
                <span>Rs${receipt.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            `}
          </div>
        `}
        
        <div class="footer">
          ${isKitchen ? 'Kitchen Copy' : 'Customer Copy'}
        </div>
      </div>
    `;
  };

  const printReceipt = (receipt, type) => {
    console.log(`🖨️ Opening print window for ${type} receipt:`, receipt.title || receipt.menuName);
    
    try {
      const printWindow = window.open("", "_blank", "width=400,height=600,scrollbars=yes");
      
      if (!printWindow) {
        console.error('❌ Failed to open print window - popup might be blocked');
        alert('Please allow popups for printing receipts');
        return;
      }
      
      const isKitchen = type === 'kitchen';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${isKitchen ? 'Kitchen Order' : 'Customer Receipt'}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10px; 
              margin: 0;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 15px; 
            }
            .title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
            }
            .items { 
              border-top: 1px dashed #000; 
              border-bottom: 1px dashed #000; 
              padding: 10px 0; 
              margin: 10px 0; 
            }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0; 
            }
            .total-section { 
              border-top: 2px solid #000; 
              padding-top: 10px; 
              font-weight: bold; 
            }
            .priority { 
              background-color: #ffeb3b; 
              padding: 8px; 
              text-align: center; 
              font-weight: bold; 
              border: 2px solid #000; 
              margin: 10px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 10px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${isKitchen ? '🍽️ KITCHEN ORDER' : '🧾 CUSTOMER RECEIPT'}</div>
            <div>${isKitchen ? 'PREPARE IMMEDIATELY' : 'Thank you for your order!'}</div>
          </div>
          
          <div class="info-row">
            <span><strong>Order ID:</strong></span>
            <span>${receipt._id?.substring(0, 8)}...</span>
          </div>
          
          <div class="info-row">
            <span><strong>Date:</strong></span>
            <span>${new Date(receipt.printedAt).toLocaleDateString()}</span>
          </div>
          
          <div class="info-row">
            <span><strong>Time:</strong></span>
            <span>${new Date(receipt.printedAt).toLocaleTimeString()}</span>
          </div>
          
          ${receipt.customerInfo ? `
            <div class="info-row">
              <span><strong>Customer:</strong></span>
              <span>${receipt.customerInfo.name}</span>
            </div>
            
            <div class="info-row">
              <span><strong>Table:</strong></span>
              <span>${receipt.customerInfo.table}</span>
            </div>
            
            ${receipt.customerInfo.phone !== 'N/A' ? `
              <div class="info-row">
                <span><strong>Phone:</strong></span>
                <span>${receipt.customerInfo.phone}</span>
              </div>
            ` : ''}
          ` : ''}
          
          ${isKitchen ? '<div class="priority">⚡ URGENT - PREPARE NOW ⚡</div>' : ''}
          
          <div class="items">
            <div style="font-weight: bold; margin-bottom: 10px;">
              ${isKitchen ? 'ITEMS TO PREPARE:' : 'ITEMS ORDERED:'}
            </div>
            
            ${receipt.groupedItems ? 
              // Handle grouped items structure
              Object.values(receipt.groupedItems).map(group => `
                <div style="background-color: #f5f5f5; padding: 5px; margin: 5px 0; border-left: 3px solid #333;">
                  <div style="font-weight: bold; font-size: 11px;">
                    📋 ${group.displayName || `${group.groupType}: ${group.groupName}`}
                  </div>
                </div>
                ${group.items.map(item => `
                  <div class="item-row" style="margin-left: 10px;">
                    <span>${item.name} ${isKitchen ? '' : '@ Rs' + item.price}</span>
                    <span><strong>x${item.quantity}</strong></span>
                  </div>
                  ${item.notes ? `<div style="font-size: 10px; color: #000000; margin-left: 20px;">Note: ${item.notes}</div>` : ''}
                `).join('')}
              `).join('')
              :
              // Handle legacy items structure (fallback)
              receipt.items?.map(item => `
                <div class="item-row">
                  <span>${item.name} ${isKitchen ? '' : '@ Rs' + item.price}</span>
                  <span><strong>x${item.quantity}</strong></span>
                </div>
                ${item.notes ? `<div style="font-size: 10px; color: #000000; margin-left: 10px;">Note: ${item.notes}</div>` : ''}
              `).join('') || ''
            }
          </div>
          
          ${isKitchen ? `
            <div style="text-align: center; font-weight: bold; font-size: 14px;">
              TOTAL ITEMS: ${receipt.totalItems || (receipt.items ? receipt.items.reduce((sum, item) => sum + item.quantity, 0) : 0)}
            </div>
          ` : `
            <div class="total-section">
              ${receipt.subtotalAmount && receipt.subtotalAmount !== receipt.totalAmount ? `
                <div class="info-row">
                  <span>SUBTOTAL:</span>
                  <span>Rs${receipt.subtotalAmount.toFixed(2)}</span>
                </div>
                <div class="info-row" style="color: #28a745;">
                  <span>DISCOUNT:</span>
                  <span>-Rs${(receipt.discountAmount || 0).toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="info-row">
                <span>TOTAL AMOUNT:</span>
                <span>Rs${receipt.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          `}
          
          <div class="footer">
            ${isKitchen ? 
              'Kitchen Copy - Prepare all items listed above' : 
              'Customer Copy - Please keep this receipt for your records'
            }
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    console.log(`✅ Print job completed for ${type} receipt`);
    
    } catch (error) {
      console.error('❌ Error printing receipt:', error);
      alert('Failed to print receipt. Please try again.');
    }
  };

  if (customerReceipts.length === 0 && kitchenReceipts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No receipts available</p>
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
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Consolidated Receipts</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Print All Button */}
          {customerReceipts.length > 0 && kitchenReceipts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">Quick Print</h3>
                  <p className="text-sm text-blue-600">Print all customer and kitchen receipts ({customerReceipts.length + kitchenReceipts.length} total)</p>
                </div>
                <button
                  onClick={handlePrintAllReceipts}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  <FaPrint /> Print All Receipts
                </button>
              </div>
            </div>
          )}

          {/* Customer Receipts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaReceipt className="text-green-500" />
              Customer Receipt ({customerReceipts.length})
            </h3>
            <div className="grid gap-2">
              {customerReceipts.map((receipt, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCustomerReceipt(receipt)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{receipt.title || 'Order Receipt'}</p>
                      <p className="text-sm text-gray-600">
                        {receipt.totalItems || 0} items • Rs{receipt.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      {receipt.groupedItems && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.values(receipt.groupedItems).map((group, idx) => (
                            <span key={idx} className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded">
                              {group.displayName || `${group.groupType}: ${group.groupName}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {receipt.customerInfo && (
                        <p className="text-xs text-gray-500">
                          {receipt.customerInfo.name} • Table {receipt.customerInfo.table}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(receipt.printedAt).toLocaleTimeString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printReceipt(receipt, 'customer');
                        }}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded mt-1 hover:bg-green-600"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen Receipts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaUtensils className="text-orange-500" />
              Kitchen Order ({kitchenReceipts.length})
            </h3>
            <div className="grid gap-2">
              {kitchenReceipts.map((receipt, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedKitchenReceipt(receipt)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{receipt.title || 'Kitchen Order'}</p>
                      <p className="text-sm text-gray-600">
                        {receipt.totalItems || 0} items to prepare
                      </p>
                      {receipt.groupedItems && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.values(receipt.groupedItems).map((group, idx) => (
                            <span key={idx} className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded">
                              {group.displayName || `${group.groupType}: ${group.groupName}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {receipt.customerInfo && (
                        <p className="text-xs text-gray-500">
                          {receipt.customerInfo.name} • Table {receipt.customerInfo.table}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(receipt.printedAt).toLocaleTimeString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printReceipt(receipt, 'kitchen');
                        }}
                        className="text-xs bg-orange-500 text-white px-2 py-1 rounded mt-1 hover:bg-orange-600"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Close All
            </button>
          </div>
        </div>
      </div>

      {/* Individual Receipt Modals */}
      {selectedCustomerReceipt && (
        <CustomerReceipt
          receipt={selectedCustomerReceipt}
          onClose={() => setSelectedCustomerReceipt(null)}
        />
      )}

      {selectedKitchenReceipt && (
        <KitchenReceipt
          receipt={selectedKitchenReceipt}
          onClose={() => setSelectedKitchenReceipt(null)}
        />
      )}
    </>
  );
};

export default ReceiptManager;
