import React, { useRef } from "react";

const ReceiptPrintModal = ({ isOpen, onClose, reportData }) => {
  console.log("report data 2", reportData);
  const printRef = useRef();

  if (!isOpen) return null;

  const formatPrice = (amount) => {
    return amount ? ` ${amount.toFixed(2)}` : " 0.00";
  };

  const handlePrint = () => {
    if (!reportData) return;
    const pad = (text, len, right = false) => {
      text = String(text ?? "");
      if (text.length > len) text = text.slice(0, len);
      return right ? text.padStart(len, " ") : text.padEnd(len, " ");
    };

    const date = new Date(reportData.reportGeneratedDate).toLocaleDateString();
    const time = new Date(reportData.reportGeneratedAt).toLocaleTimeString();
    const paymentBlock = Object.entries(reportData.paymentMethodSummary)
      .map(([status, methods]) => {
        // Create table rows for each payment method
        const rows = Object.entries(methods)
          .map(
            ([method, amount]) =>
              `<tr>
            <td>${method.toUpperCase()}</td>
            <td style="text-align:right;">${amount.toFixed(2)}</td>
          </tr>`
          )
          .join("");

        // Add total per status
        const totalRow = `<tr>
      <td><strong>Total ${status}</strong></td>
      <td style="text-align:right;"><strong>${getTotalByStatus(status).toFixed(
        2
      )}</strong></td>
    </tr>`;

        const deliveryRow = reportData.totalDeliveryFees
          ? `<tr>
           <td><strong>Delivery Fee<strong></td>
           <td style="text-align:right;"><strong>${reportData.totalDeliveryFees.toFixed(
             2
           )}</strong></td>
         </tr>`
          : "";

        return `
      <div class="items-section">
        <strong>${status.toUpperCase()}</strong>
        <table class="receipt-table" style="margin-top:4px;">
          <tbody>
            ${rows}
            ${status.toUpperCase() == "PAID" ? deliveryRow : ""}
            ${totalRow}
          </tbody>
        </table>
      </div>
    `;
      })
      .join("");
const BreakDown = Object.entries(reportData.paymentBreakdownByType)
  .map(([type, statusData]) => {
    // Calculate total for this type
    const typeTotal = Object.values(statusData).reduce(
      (sum, methods) =>
        sum +
        Object.values(methods).reduce((innerSum, val) => innerSum + val, 0),
      0
    );

    // Skip empty data
    if (typeTotal === 0) return "";

    // Loop through PAID / UNPAID
    const statusBlocks = Object.entries(statusData)
      .map(([status, methods]) => {
        // Total per status
        const totalRow = `<tr>
          <td><strong>Total ${status}</strong></td>
          <td style="text-align:right;"><strong>${Object.values(methods)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)}</strong></td>
        </tr>`;

        return `
          <table class="receipt-table" style="margin-top:4px; width:100%; border-collapse: collapse;">
            <tbody>
              ${totalRow}
            </tbody>
          </table>
        `;
      })
      .join("");

    return `
      <div class="payment-type-section" style="margin-bottom:10px;">
        <h3 style="margin-top:6px; margin-bottom:0px; font-weight:bold;">${type}</h3>
        ${statusBlocks}
        <hr style="border-top:1px dashed #ccc; margin-top:6px;"/>
      </div>
    `;
  })
  .join("");


    // Generate table rows
    const itemRows = groupedItems
      .map(
        (item) => `
      <style>
              @media print {
                @page { margin: 0; size: 80mm auto; }
                body { margin: 0; padding: 5mm; }
              }
              
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 11px;
                line-height: 1.3;
                margin: 0;
                padding: 10px;
                max-width: 300px;
                color: #000;
                background: #fff;
              }
              
              .receipt-header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding-bottom: 8px; 
                margin-bottom: 12px; 
              }
              
              .receipt-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 5px;
                text-decoration: underline;
              }
              
              .order-info { 
                margin-bottom: 12px; 
                font-size: 11px;
              }
              
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 2px 0; 
              }
              
              .items-section { f
                padding: 8px 0; 
                margin: 10px 0; 
              }
              
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 3px 0;
                align-items: center;
              }
              
              .item-name { 
                flex: 1; 
                margin-right: 8px;
                word-wrap: break-word;
              }
              
              .item-qty { 
                font-weight: bolder; 
                font-size: 12px;
                min-width: 30px;
                text-align: right;
              }
              
              .item-price { 
                min-width: 60px; 
                text-align: right; 
                font-weight: bold;
                font-size:15px;
              }
              
              .total-section { 
                border-top: 2px solid #000; 
                padding-top: 8px; 
                margin-top: 10px;
                font-weight: bold;
              }
              
              .priority-notice { 
                background-color: #000; 
                color: #fff;
                padding: 6px; 
                text-align: center; 
                font-weight: bold; 
                margin: 8px 0;
                text-transform: uppercase;
              }
              
              .footer { 
                text-align: center; 
                margin-top: 15px; 
                font-size: 9px;
                border-top: 1px dashed #000;
                padding-top: 8px;
              }
              
              .customer-info {
                background: white;
                padding: 6px;
                margin: 8px 0;
                border-left: 3px solid #000;
              }
              
              .item-with-logo {
                display: flex;
                align-items: center;
                flex: 1;
                margin-right: 8px;
              }
              
              .menu-logo {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                border-radius: 2px;
                object-fit: cover;
              }
              
              .instructions {
                background: white;
                border-left: 3px solid #000000ff;
                padding: 6px;
                margin: 8px 0;
                font-size: 12px;
              }
              
              .instructions-label {
                font-weight: bold;
                color: black;
                margin-bottom: 4px;
              }
              
              /* Table styles for customer receipts */
              .receipt-table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
              }
              
              .receipt-table th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding: 4px 2px;
                font-weight: bold;
              }

              .receipt-table tr {
                border-bottom: 1px dashed #000;
              }
              
              .receipt-table td {
                padding: 4px 2px;
                vertical-align: top;
              }
              .item-name-cell {
              font-size : 11px;
              }
              
              .receipt-table .item-name-cell {
                width: 40%;
              }
              
              .receipt-table .qty-cell {
                width: 15%;
                text-align: center;
                font-weight:bold;
                font-size : 11px;
              }
              
              .receipt-table .unit-price-cell {
                width: 20%;
                font-weight:bold;
                text-align: right;
                font-size : 11px;
              }
              
              .receipt-table .price-cell {
                width: 25%;
                text-align: right;
                font-weight: bold;
                font-size : 11px;
              }
                .company-header {
                text-align: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
              }
              
              .company-logo {
                max-width: 100px;
                max-height: 100px;
                margin: 0 auto 5px;
                display: block;
              }
              
             
              
              .receipt-table .item-options {
                font-size: 8px;
font-weight:600;
                color: #000000;
                font-style: italic;
                padding-left: 8px;
              }
              
              .receipt-table .item-notes {
                font-size: 9px;
                color: #000000;
                font-style: italic;
                padding-left: 8px;
              }
              
              .deal-row {
                border-top: 1px dashed #ccc;
                padding-top: 6px;
                margin-top: 6px;
              }
              
              .deal-name {
                font-weight: bold;
                color: #000000ff;
                font-size: 11px;
              }
            </style>
        <tr>
          <td class="item-name-cell">
            <div style="font-weight:bold;">${item.name}</div>
           
          </td>
          <td class="qty-cell">${item.quantity}</td>
          <td class="unit-price-cell">${(item.total / item.quantity).toFixed(
            0
          )}</td>
          <td class="price-cell">${item.total.toFixed(0)}</td>
        </tr>`
      )
      .join("");

    // Generate deals (if any)
    const dealRows = groupedDeals
      .map((deal) => {
        // Main deal row
        let row = `
      <tr style="border-bottom : none;">
        <td class="item-name-cell"><div style="font-weight:bold;">${
          deal.name
        }</div></td>
        <td class="qty-cell">${deal.quantity}</td>
        <td class="unit-price-cell">${(deal.total / deal.quantity).toFixed(
          2
        )}</td>
        <td class="price-cell">${deal.total.toFixed(2)}</td>
      </tr>
    `;

        // Customizations (if any)
        if (deal.customizations && deal.customizations.length > 0) {
          let customizationHtml =
            '<tr style="border-top:none;"><td colspan="4"><div class="mt-1 text-xs text-gray-700">';

          deal.customizations.forEach((cat) => {
            cat.options.forEach((opt) => {
              const optionTotal = (opt.price || 0) * (opt.quantity || 1);
              customizationHtml += `
            <div style="display:flex; justify-content:space-between;">
              <span style="width:40%;">${opt.name}</span>
              <span style="width:20%; text-align:right;">${formatPrice(
                opt.price
              )}</span>
              <span style="width:20%; text-align:right;">${opt.quantity}</span>
              <span style="width:20%; text-align:right;">${formatPrice(
                optionTotal
              )}</span>
            </div>
          `;
            });
          });

          customizationHtml += `
        <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4px; font-size:11px;">
          <span style="width:40%;">Total Amount</span>
          <span style="width:20%; text-align:right;"></span>
          <span style="width:20%; text-align:right;"></span>
          <span style="width:20%; text-align:right;">${deal.wholetotal}</span>
        </div>
      `;

          customizationHtml += "</div></td></tr>";
          row += customizationHtml;
        }

        return row;
      })
      .join("");

    const ExtraRows = groupedExtra
      .map(
        (item) => `
      <style>
              @media print {
                @page { margin: 0; size: 80mm auto; }
                body { margin: 0; padding: 5mm; }
              }
              
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 11px;
                line-height: 1.3;
                margin: 0;
                padding: 10px;
                max-width: 300px;
                color: #000;
                background: #fff;
              }
              
              .receipt-header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding-bottom: 8px; 
                margin-bottom: 12px; 
              }
              
              .receipt-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 5px;
                text-decoration: underline;
              }
              
              .order-info { 
                margin-bottom: 12px; 
                font-size: 11px;
              }
              
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 2px 0; 
              }
              
              .items-section { f
                padding: 8px 0; 
                margin: 10px 0; 
              }
              
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 3px 0;
                align-items: center;
              }
              
              .item-name { 
                flex: 1; 
                margin-right: 8px;
                word-wrap: break-word;
              }
              
              .item-qty { 
                font-weight: bolder; 
                font-size: 12px;
                min-width: 30px;
                text-align: right;
              }
              
              .item-price { 
                min-width: 60px; 
                text-align: right; 
                font-weight: bold;
                font-size:15px;
              }
              
              .total-section { 
                border-top: 2px solid #000; 
                padding-top: 8px; 
                margin-top: 10px;
                font-weight: bold;
              }
              
              .priority-notice { 
                background-color: #000; 
                color: #fff;
                padding: 6px; 
                text-align: center; 
                font-weight: bold; 
                margin: 8px 0;
                text-transform: uppercase;
              }
              
              .footer { 
                text-align: center; 
                margin-top: 15px; 
                font-size: 9px;
                border-top: 1px dashed #000;
                padding-top: 8px;
              }
              
              .customer-info {
                background: white;
                padding: 6px;
                margin: 8px 0;
                border-left: 3px solid #000;
              }
              
              .item-with-logo {
                display: flex;
                align-items: center;
                flex: 1;
                margin-right: 8px;
              }
              
              .menu-logo {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                border-radius: 2px;
                object-fit: cover;
              }
              
              .instructions {
                background: white;
                border-left: 3px solid #000000ff;
                padding: 6px;
                margin: 8px 0;
                font-size: 12px;
              }
              
              .instructions-label {
                font-weight: bold;
                color: black;
                margin-bottom: 4px;
              }
              
              /* Table styles for customer receipts */
              .receipt-table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
              }
              
              .receipt-table th {
                text-align: left;
                border-bottom: 1px solid #000;
                padding: 4px 2px;
                font-weight: bold;
              }

              .receipt-table tr {
                border-bottom: 1px dashed #000;
              }
              
              .receipt-table td {
                padding: 4px 2px;
                vertical-align: top;
              }
              .item-name-cell {
              font-size : 11px;
              }
              
              .receipt-table .item-name-cell {
                width: 40%;
              }
              
              .receipt-table .qty-cell {
                width: 15%;
                text-align: center;
                font-weight:bold;
                font-size : 11px;
              }
              
              .receipt-table .unit-price-cell {
                width: 20%;
                font-weight:bold;
                text-align: right;
                font-size : 11px;
              }
              
              .receipt-table .price-cell {
                width: 25%;
                text-align: right;
                font-weight: bold;
                font-size : 11px;
              }
                .company-header {
                text-align: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
              }
              
              .company-logo {
                max-width: 100px;
                max-height: 100px;
                margin: 0 auto 5px;
                display: block;
              }
              
             
              
              .receipt-table .item-options {
                font-size: 8px;
font-weight:600;
                color: #000000;
                font-style: italic;
                padding-left: 8px;
              }
              
              .receipt-table .item-notes {
                font-size: 9px;
                color: #000000;
                font-style: italic;
                padding-left: 8px;
              }
              
              .deal-row {
                border-top: 1px dashed #ccc;
                padding-top: 6px;
                margin-top: 6px;
              }
              
              .deal-name {
                font-weight: bold;
                color: #000000ff;
                font-size: 11px;
              }
            </style>
        <tr>
          <td class="item-name-cell">
            <div style="font-weight:bold;">${item.name}</div>
           
          </td>
          <td class="qty-cell">${item.quantity}</td>
          <td class="unit-price-cell">${(item.total / item.quantity).toFixed(
            0
          )}</td>
          <td class="price-cell">${item.total.toFixed(0)}</td>
        </tr>`
      )
      .join("");

    const html = `
    <html>
      <head>
        <title>Day End Recipt</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            width: 80mm;
            margin: 0;
            padding: 4px;
            font-family: 'Courier New', monospace;
            font-size: 9px;
            line-height: 1.3;
            color: #000;
          }
          .company-header {
            text-align: center;
            margin-bottom: 4px;
          }
          .company-logo {
            max-width: 60px;
            height: auto;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 4px;
          }
          .receipt-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .order-info, .total-section {
            margin: 6px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 9px;
          }
          th, td {
            text-align: left;
            padding: 2px 0;
          }
          th.qty-cell, th.unit-price-cell, th.price-cell,
          td.qty-cell, td.unit-price-cell, td.price-cell {
            text-align: right;
          }
          .receipt-table thead th {
            border-bottom: 1px dashed #000;
            font-weight: bold;
          }
          .receipt-table tbody td {
            border-bottom: 1px dotted #ccc;
          }
          .item-options {
            font-size: 8px;
            color: #444;
            margin-left: 6px;
          }
          .total-section .info-row span {
            font-size: 9px;
          }
          .footer {
            text-align: center;
            font-size: 8px;
            margin-top: 6px;
            border-top: 1px dashed #000;
            padding-top: 4px;
          }
          @media print {
            html, body { width: 58mm; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="company-header">
          <img src="/src/assets/images/companylogo.png" class="company-logo" />
        </div>

        <div class="receipt-header">
          <div class="receipt-title">DAY CLOSE RECEIPT</div>
          <div style="font-size:10px;">CLOSED AT ${date} - ${time}</div>
        </div>

        
        <div class="items-section">
          <table class="receipt-table">
            <thead>
              <tr>
                <th class="item-name-cell">Item</th>
                <th class="qty-cell">Qty</th>
                <th class="unit-price-cell">Unit Price</th>
                <th class="price-cell">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${dealRows}
              ${ExtraRows}
            </tbody>
          </table>
        </div>
         ${paymentBlock}
          ${BreakDown}

       

        <div class="footer">
          Powered By MiteMinds
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "", "height=600,width=400");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // const handlePrint = () => {
  //   if (!reportData) return;

  //   const pad = (text, len, right = false) => {
  //     text = String(text ?? "");
  //     if (text.length > len) text = text.slice(0, len);
  //     return right ? text.padStart(len, " ") : text.padEnd(len, " ");
  //   };

  //   const date = new Date(reportData.reportGeneratedDate).toLocaleDateString();
  //   const time = new Date(reportData.reportGeneratedAt).toLocaleTimeString();

  //   const itemsBlock = groupedItems
  //     .map((item) => {
  //       const lines = [];
  //       lines.push(
  //         `${pad(item.name, 22)}${pad(
  //           (item.total / item.quantity).toFixed(2),
  //           8,
  //           true
  //         )}${pad(item.quantity, 3, true)}${pad(item.total.toFixed(2), 9, true)}`
  //       );
  //       if (item.options?.length) {
  //         item.options.forEach((opt) => {
  //           lines.push(
  //             `  - ${opt.name}${
  //               opt.price > 0
  //                 ? pad("(" + opt.price.toFixed(2) + ")", 15, true)
  //                 : ""
  //             }`
  //           );
  //         });
  //       }
  //       return lines.join("\n");
  //     })
  //     .join("\n----------------------------------------\n");

  //   const dealsBlock = groupedDeals
  //     .map(
  //       (deal) =>
  //         `${pad(deal.name, 22)}${pad(
  //           (deal.total / deal.quantity).toFixed(2),
  //           8,
  //           true
  //         )}${pad(deal.quantity, 3, true)}${pad(deal.total.toFixed(2), 9, true)}`
  //     )
  //     .join("\n----------------------------------------\n");

  //   const paymentBlock = Object.entries(reportData.paymentMethodSummary)
  //     .map(([status, methods]) => {
  //       const lines = [`\n${status.toUpperCase()}`];
  //       Object.entries(methods).forEach(([method, amount]) =>
  //         lines.push(`${pad(method.toUpperCase(), 15)}${pad(amount.toFixed(2), 10, true)}`)
  //       );
  //       lines.push(`${pad("Total " + status, 15)}${pad(getTotalByStatus(status).toFixed(2), 10, true)}`);
  //       return lines.join("\n");
  //     })
  //     .join("\n----------------------------------------\n");

  //   const html = `
  //     <html>
  //       <head>
  //         <title>Receipt</title>
  //         <style>
  //           @page {
  //             size: 58mm auto;
  //             margin: 0;
  //           }
  //           body {
  //             font-family: 'Courier New', monospace;
  //             font-size: 9px;
  //             line-height: 1.3;
  //             margin: 0;
  //             padding: 4px;
  //             width: 58mm;
  //             white-space: pre;
  //           }
  //           h2 {
  //             text-align: center;
  //             font-size: 11px;
  //             margin: 2px 0;
  //           }
  //           .divider {
  //             border-top: 1px dashed #000;
  //             margin: 2px 0;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <h2>Daily Sales Receipt</h2>
  //         Date: ${date}
  //         Closed At: ${time}
  //         ----------------------------------------
  //         Item                   Price Qty   Total
  //         ----------------------------------------
  // ${itemsBlock}

  // ----------------------------------------
  // ${groupedDeals.length ? "Deals\n----------------------------------------\n" + dealsBlock + "\n----------------------------------------" : ""}
  // Total Delivery Fees: ${reportData.totalDeliveryFees.toFixed(2)}

  // ----------------------------------------
  // Payment Breakdown
  // ----------------------------------------
  // ${paymentBlock}
  // ----------------------------------------
  // Total Paid:     ${getTotalByStatus("PAID").toFixed(2)}
  // Total Unpaid:   ${getTotalByStatus("UNPAID").toFixed(2)}
  // Grand Sales:    ${reportData.totalSalesAmount.toFixed(2)}
  // Tax:            ${reportData.totalTaxCollected.toFixed(2)}
  // Discount:       ${reportData.totalVoucherDiscount.toFixed(2)}
  // ----------------------------------------
  // Thank you for your business!
  //       </body>
  //     </html>
  //   `;

  //   const printWindow = window.open("", "", "height=600,width=400");
  //   printWindow.document.write(html);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  // helper to calculate totals by payment status
  const getTotalByStatus = (status) => {
    if (!reportData?.paymentMethodSummary?.[status]) return 0;
    return Object.values(reportData.paymentMethodSummary[status]).reduce(
      (sum, val) => sum + val,
      0
    );
  };

  // helper to group items by name + options
  const groupByNameWithOptions = (data) => {
    if (!data) return [];

    const grouped = {};
    console.log("huraira", data);

    data.forEach((entry) => {
      const item = entry.completeItem || entry; // handle both shapes
      const name = item.name;

      // Normalize options to a sorted string (so order doesn’t matter)
      const optionKey =
        (item.options || [])
          .map((opt) => opt.name)
          .sort()
          .join(",") || "no-options";

      const groupKey = `${name}__${optionKey}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          name,
          quantity: 1,
          total: entry.totalRevenue || item.price || 0,
          options: item.options || [],
        };
      } else {
        grouped[groupKey].quantity += 1;
        grouped[groupKey].total += entry.totalRevenue || item.price || 0;
      }
    });

    return Object.values(grouped);
  };
  // const groupByNameIgnoreOptions = (data) => {
  //   if (!data) return [];

  //   const grouped = {};

  //   data.forEach((entry) => {
  //     const item = entry.completeItem || entry;
  //     const name = item.name;
  //     const options = item.options || [];

  //     // Calculate total option price
  //     const totalOptionPrice = options.reduce((sum, opt) => sum + (opt.price * opt.quantity), 0);
  //     // Remove option price from main item
  //     const pureItemPrice = (entry.totalRevenue || item.price || 0) - totalOptionPrice;
  //       console.log("pinpoint ",item.name, item.price ,totalOptionPrice , pureItemPrice ,item.options)

  //     if (!grouped[name]) {
  //       grouped[name] = {
  //         name,
  //         quantity: 1,
  //         total: pureItemPrice,
  //         options: [...options],
  //       };
  //     } else {
  //       grouped[name].quantity += 1;
  //       grouped[name].total += pureItemPrice;
  //       grouped[name].options.push(...options);
  //     }
  //   });

  //   // Convert object to array
  //   const abhc  = Object.values(grouped).map((g) => ({
  //     ...g,
  //     label: g.options.length
  //       ? `${g.name} * ${g.quantity} and ${[...new Set(g.options.map((o) => o.name))].join(" and ")}`
  //       : `${g.name} * ${g.quantity}`,
  //   }));
  //     console.log("jahil" ,abhc )

  //  return abhc
  // };

  const groupByNameIgnoreOptions = (data) => {
    if (!data) return [];

    const grouped = {};

    data.forEach((entry) => {
      const item = entry.completeItem || entry;
      const name = item.name;
      const options = item.options || [];

      // Calculate total option price
      const totalOptionPrice = options.reduce(
        (sum, opt) => sum + opt.price * opt.quantity,
        0
      );

      // Remove option price from main item
      const pureItemPrice =
        (entry.totalRevenue || item.price || 0) - totalOptionPrice;

      if (!grouped[name]) {
        grouped[name] = {
          name,
          quantity: 1,
          total: pureItemPrice,
          orginalTotal: item.price,
          options: options.map((opt) => ({ ...opt })), // keep options separately
        };
      } else {
        grouped[name].quantity += 1;
        grouped[name].total += pureItemPrice;
        (grouped[name].orginalTotal += item.price),
          // Multiply existing options’ quantities
          options.forEach((opt) => {
            const existingOpt = grouped[name].options.find(
              (o) => o.name === opt.name
            );
            if (existingOpt) {
              existingOpt.quantity += opt.quantity;
            } else {
              grouped[name].options.push({ ...opt });
            }
          });
      }
    });

    // Convert object to array and multiply options by main item quantity
    const result = Object.values(grouped).map((g) => {
      const multipliedOptions = g.options.map((o) => ({
        ...o,
        quantity: o.quantity, // already aggregated correctly
      }));

      return {
        ...g,
        options: multipliedOptions,
        label: multipliedOptions.length
          ? `${g.name} * ${g.quantity} and ${multipliedOptions
              .map((o) => `${o.name} * ${o.quantity}`)
              .join(" and ")}`
          : `${g.name} * ${g.quantity}`,
      };
    });
    console.log(result);
    return result;
  };

  const groupByNameWithCustomizations = (data, priceKey = "dealPrice") => {
    if (!data || !Array.isArray(data)) return [];

    const grouped = {};
    console.log("deal data gamified", data);
    data.forEach((entry) => {
      const item = entry.completeItem || entry;
      const name = item.name;
      const itemPrice = item[priceKey] || 0;
      console.log("a", itemPrice);
      // Calculate total customization price for this deal
      const customizations = item.customization || {};
      let totalCustomizationPrice = 0;
      Object.values(customizations).forEach((options) => {
        options.forEach((opt) => {
          totalCustomizationPrice += (opt.price || 0) * (opt.quantity || 1);
        });
      });

      // Pure item price excluding customization
      const pureItemPrice = itemPrice - totalCustomizationPrice;
      // Initialize grouping for this deal
      if (!grouped[name]) {
        grouped[name] = {
          name,
          quantity: 1,
          total: pureItemPrice,
          wholetotal: itemPrice,
          customizations: {},
        };
        console.log("me", grouped[name]);
      } else {
        grouped[name].quantity += 1;
        grouped[name].total += pureItemPrice;
        grouped[name].wholetotal += itemPrice;
      }

      // Merge all customization groups (e.g. Flavour, Drink, Fries)
      Object.keys(customizations).forEach((category) => {
        const options = customizations[category] || [];
        if (!grouped[name].customizations[category]) {
          grouped[name].customizations[category] = {};
        }

        options.forEach((opt) => {
          const optName = opt.name;
          const optPrice = opt.price || 0;
          if (!grouped[name].customizations[category][optName]) {
            grouped[name].customizations[category][optName] = {
              name: optName,
              quantity: 1,
              price: optPrice,
            };
          } else {
            grouped[name].customizations[category][optName].quantity += 1;
          }
        });
      });
    });

    // Convert nested maps to arrays for easier UI use
    const result = Object.values(grouped).map((g) => ({
      ...g,
      customizations: Object.keys(g.customizations).map((cat) => ({
        category: cat,
        options: Object.values(g.customizations[cat]),
      })),
    }));

    console.log("Grouped Deals with Customizations:", result);
    return result;
  };

  // // helper to group items/deals by name and calculate total
  // const groupByName = (data, priceKey) => {
  //   console.log("mera 2341", data);
  //   return Object.values(
  //     data.reduce((acc, item) => {
  //       console.log("item name", item);
  //       const name = item?.completeItem?.name;
  //       if (!acc[name]) {
  //         acc[name] = {
  //           name,
  //           quantity: 1,
  //           total: item?.completeItem[priceKey],
  //         };
  //       } else {
  //         acc[name].quantity += 1;
  //         acc[name].total += item?.completeItem?.[priceKey];
  //       }
  //       return acc;
  //     }, {})
  //   );
  // };

  const groupAllExtras = (data) => {
    if (!data) return [];

    const extrasGrouped = {};

    data.forEach((entry) => {
      const item = entry.completeItem || entry;
      const options = item.options || [];

      options.forEach((opt) => {
        const key = opt.name;
        if (!extrasGrouped[key]) {
          extrasGrouped[key] = {
            name: opt.name,
            quantity: opt.quantity,
            price: opt.price,
            total: opt.price * opt.quantity,
          };
        } else {
          extrasGrouped[key].quantity += opt.quantity;
          extrasGrouped[key].total += opt.price * opt.quantity;
        }
      });
    });

    const extrasArray = Object.values(extrasGrouped);

    console.log("All Extras:", extrasArray);
    return extrasArray;
  };

  console.log("report data", reportData);

  // group data once
  const groupedItems = reportData?.itemsSoldSummary
    ? groupByNameIgnoreOptions(reportData.itemsSoldSummary)
    : [];
  const groupedExtra = reportData?.itemsSoldSummary
    ? groupAllExtras(reportData.itemsSoldSummary)
    : [];

  console.log("this is me", groupedExtra);

  const groupedDeals = reportData?.dealsSoldSummary
    ? groupByNameWithCustomizations(reportData.dealsSoldSummary, "dealPrice")
    : [];
  console.log("mera kumi meow", groupedDeals);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold tracking-wide">Receipt Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          ref={printRef}
          className="p-4 overflow-y-auto flex-grow text-sm leading-relaxed"
        >
          {reportData ? (
            <div>
              {/* Title */}
              <h2 className="text-center text-base font-bold mb-1">
                Daily Sales Receipt
              </h2>
              <p className="text-center text-xs text-gray-500 mb-2">
                Date:{" "}
                {new Date(reportData.reportGeneratedDate).toLocaleDateString()}{" "}
                | Closed At:{" "}
                {new Date(reportData.reportGeneratedAt).toLocaleTimeString()}
              </p>

              <div className="line border-t border-dashed border-gray-400 my-2"></div>

              {/* Items Section */}
              {groupedItems.length > 0 && (
                <div>
                  <h3 className="section-title mb-2 font-semibold">Items</h3>

                  {/* Header Row */}
                  <div className="flex justify-between text-xs font-semibold border-b border-dashed border-gray-400 pb-1 mb-1">
                    <span className="w-2/5">Item Name</span>
                    <span className="w-1/5 text-right">Price</span>
                    <span className="w-1/5 text-right">Qty</span>
                    <span className="w-1/5 text-right">Total</span>
                  </div>

                  {/* Items */}
                  {groupedItems.map((item, index) => (
                    <div key={index} className="py-1 text-sm">
                      <div className="flex justify-between">
                        <span className="w-2/5 break-words">{item.name}</span>
                        <span className="w-1/5 text-right">
                          {formatPrice(item.total / item.quantity)}
                        </span>
                        <span className="w-1/5 text-right">
                          {item.quantity}
                        </span>
                        <span className="w-1/5 text-right">
                          {formatPrice(item.total)}
                        </span>
                      </div>

                      {/* Options (if any)
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.options.map((opt, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="w-2/5 break-words">
                                - {opt.name}
                              </span>
                              <span className="w-1/5 text-right">
                                {formatPrice(opt.price)}
                              </span>
                              <span className="w-1/5 text-right">
                                {opt.quantity}
                              </span>
                              <span className="w-1/5 text-right">
                                {formatPrice(opt.price * opt.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )} */}

                      {/* Dashed line after each item */}
                      <div className="border-t border-dashed border-gray-300 my-1"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Deals Section */}
              {groupedDeals.length > 0 && (
                <div className="mt-3">
                  <h3 className="section-title mb-2 font-semibold">Deals</h3>

                  {/* Header Row */}
                  <div className="flex justify-between text-xs font-semibold border-b border-dashed border-gray-400 pb-1 mb-1">
                    <span className="w-2/5">Deal Name</span>
                    <span className="w-1/5 text-right">Price</span>
                    <span className="w-1/5 text-right">Qty</span>
                    <span className="w-1/5 text-right">Total</span>
                  </div>

                  {groupedDeals.map((deal, index) => (
                    <div key={index} className="py-1 text-sm">
                      {/* Main deal row */}
                      <div className="flex justify-between font-medium">
                        <span className="w-2/5 break-words">{deal.name}</span>
                        <span className="w-1/5 text-right">
                          {formatPrice(deal.total / deal.quantity)}
                        </span>
                        <span className="w-1/5 text-right">
                          {deal.quantity}
                        </span>
                        <span className="w-1/5 text-right">
                          {formatPrice(deal.total)}
                        </span>
                      </div>

                      {/* Show customization options with same layout */}
                      {deal.customizations &&
                        deal.customizations.length > 0 && (
                          <div className=" mt-1 text-xs text-gray-700 space-y-0.5">
                            {deal.customizations.map((cat, catIndex) => (
                              <div key={catIndex}>
                                {cat.options.map((opt, optIndex) => {
                                  const optionTotal =
                                    (opt.price || 0) * (opt.quantity || 1);
                                  return (
                                    <div
                                      key={optIndex}
                                      className="flex justify-between "
                                    >
                                      <span className="w-2/5 break-words">
                                        {opt.name}
                                      </span>
                                      <span className="w-1/5 text-right">
                                        {formatPrice(opt.price)}
                                      </span>
                                      <span className="w-1/5 text-right">
                                        {opt.quantity}
                                      </span>
                                      <span className="w-1/5 text-right">
                                        {formatPrice(optionTotal)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-semibold">
                              <span className="w-2/5 break-words">
                                Total Amount
                              </span>
                              <span className="w-1/5 text-right"></span>
                              <span className="w-1/5 text-right"></span>
                              <span className="w-1/5 text-right">
                                {deal.wholetotal}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Dashed line after each deal */}
                      <div className="border-t border-dashed border-gray-300 my-1"></div>
                    </div>
                  ))}
                </div>
              )}

              {groupedExtra.length > 0 && (
                <div>
                  <h3 className="section-title mb-2 font-semibold">Extras</h3>

                  {/* Header Row */}
                  <div className="flex justify-between text-xs font-semibold border-b border-dashed border-gray-400 pb-1 mb-1">
                    <span className="w-2/5">Item Name</span>
                    <span className="w-1/5 text-right">Price</span>
                    <span className="w-1/5 text-right">Qty</span>
                    <span className="w-1/5 text-right">Total</span>
                  </div>

                  {/* Items */}
                  {groupedExtra.map((item, index) => (
                    <div key={index} className="py-1 text-sm">
                      <div className="flex justify-between">
                        <span className="w-2/5 break-words">{item.name}</span>
                        <span className="w-1/5 text-right">
                          {formatPrice(item.total / item.quantity)}
                        </span>
                        <span className="w-1/5 text-right">
                          {item.quantity}
                        </span>
                        <span className="w-1/5 text-right">
                          {formatPrice(item.total)}
                        </span>
                      </div>

                      {/* Options (if any)
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.options.map((opt, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="w-2/5 break-words">
                                - {opt.name}
                              </span>
                              <span className="w-1/5 text-right">
                                {formatPrice(opt.price)}
                              </span>
                              <span className="w-1/5 text-right">
                                {opt.quantity}
                              </span>
                              <span className="w-1/5 text-right">
                                {formatPrice(opt.price * opt.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )} */}

                      {/* Dashed line after each item */}
                      <div className="border-t border-dashed border-gray-300 my-1"></div>
                    </div>
                  ))}

                  {/* Total Delivery Fees */}
                </div>
              )}
              {/* Payment Breakdown */}
              {reportData.paymentMethodSummary && (
                <div className="mt-3">
                  <div className="line border-t border-dashed border-gray-400"></div>
                  <h3 className="section-title font-semibold mt-2">
                    Payment Breakdown
                  </h3>
                  <div className="flex justify-between text-sm mt-2  pt-1">
                    <span>Total Delivery Fees</span>
                    <span>{formatPrice(reportData.totalDeliveryFees)}</span>
                  </div>
                  {Object.entries(reportData.paymentMethodSummary).map(
                    ([status, methods], idx) => (
                      <div key={idx} className="mb-2">
                        <h4 className="text-center font-medium text-gray-600">
                          {status}
                        </h4>
                        {Object.entries(methods).map(([method, amount], i) => (
                          <div
                            key={i}
                            className="flex justify-between py-0.5 text-sm"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{method}</span>
                            <span>{formatPrice(amount)}</span>
                          </div>
                        ))}
                        <div
                          className="flex justify-between font-semibold mt-1"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Total {status}</span>
                          <span>{formatPrice(getTotalByStatus(status))}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {reportData.paymentBreakdownByType && (
                <div className="mt-3">
                  <div className="line border-t border-dashed border-gray-400"></div>
                  <h3 className="section-title font-semibold mt-2">
                    Payment Breakdown by Type
                  </h3>

                  {Object.entries(reportData.paymentBreakdownByType).map(
                    ([type, statusData], idx) => {
                      // Calculate total for this type
                      const typeTotal = Object.values(statusData).reduce(
                        (sum, methods) => {
                          return (
                            sum +
                            Object.values(methods).reduce(
                              (innerSum, val) => innerSum + val,
                              0
                            )
                          );
                        },
                        0
                      );

                      // Skip empty data (optional)
                      if (typeTotal === 0) return null;

                      return (
                        <div key={idx} className="mt-3">
                          {/* Type Header */}
                          <div className="flex justify-between text-sm font-semibold mt-1">
                            <span>{type}</span>
                          </div>

                          {/* Loop through PAID / UNPAID */}
                          {Object.entries(statusData).map(
                            ([status, methods], i) => (
                              <div key={i} className="mt-1">
                                {/* Optional total per status */}
                                <div
                                  className="flex justify-between mt-1 text-xs"
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>Total {status}</span>
                                  <span>
                                    {formatPrice(
                                      Object.values(methods).reduce(
                                        (a, b) => a + b,
                                        0
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          )}

                          <div className="border-b border-dashed border-gray-400 mt-2"></div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              <div className="line border-t border-dashed border-gray-400"></div>

              {/* Totals */}
              <div className="text-sm mt-4">
                <p
                  className="flex justify-between font-semibold"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Total Paid</span>
                  <span>{formatPrice(getTotalByStatus("PAID"))}</span>
                </p>
                <p
                  className="flex justify-between font-semibold"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Total Unpaid</span>
                  <span>{formatPrice(getTotalByStatus("UNPAID"))}</span>
                </p>
                <p
                  className="flex justify-between font-bold text-gray-900"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Grand Sales</span>
                  <span>{formatPrice(reportData.totalSalesAmount)}</span>
                </p>
                <p
                  className="flex justify-between text-gray-600"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Tax</span>
                  <span>{formatPrice(reportData.totalTaxCollected)}</span>
                </p>
                <p
                  className="flex justify-between text-gray-600"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Discount</span>
                  <span>{formatPrice(reportData.totalVoucherDiscount)}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrintModal;
