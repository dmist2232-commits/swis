const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf8');

code = code.replace(
`  const updateFeeOrRider = async (id: number, field: string, value: string|number) => {`,
`  const clearOldOrders = async () => {
    if(confirm("Are you sure you want to clear all completed and cancelled orders?")) {
      await fetch('/api/orders/clear', { method: 'DELETE' });
      toast.success("Old orders cleared!");
    }
  };

  const printBill = (order: any) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if(!printWindow) return;
    printWindow.document.write(\`
      <html>
        <head>
          <title>Bill - Order #\${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 300px; margin: 0 auto; color: black; }
            h1 { text-align: center; margin: 0 0 10px 0; font-size: 24px; }
            .divider { border-bottom: 1px dashed black; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .item { font-size: 14px; }
            .bold { font-weight: bold; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h1>GRAND SPICY</h1>
          <div class="center">5335+H5H, Veyangoda 11100</div>
          <div class="center">Tel: 0112345678</div>
          <div class="divider"></div>
          <div>Order #: \${order.orderNumber}</div>
          <div>Date: \${new Date(order.createdAt).toLocaleString()}</div>
          <div>Customer: \${order.customerName}</div>
          <div>Phone: \${order.phone}</div>
          <div class="divider"></div>
          \${order.items.map((i:any) => \`
            <div class="flex item">
              <span>\${i.name} \${i.quantity ? 'x'+i.quantity : ''}</span>
              <span>Rs. \${i.price}</span>
            </div>
          \`).join('')}
          <div class="divider"></div>
          <div class="flex item">
            <span>Subtotal:</span>
            <span>Rs. \${order.total - order.deliveryCharge}</span>
          </div>
          <div class="flex item">
            <span>Delivery:</span>
            <span>Rs. \${order.deliveryCharge}</span>
          </div>
          \${order.extraFee ? \`<div class="flex item text-red-500"><span>Extra Fee:</span><span>Rs. \${order.extraFee}</span></div>\` : ''}
          <div class="divider"></div>
          <div class="flex bold" style="font-size:18px;">
            <span>TOTAL:</span>
            <span>Rs. \${order.total + (order.extraFee || 0)}</span>
          </div>
          <div class="divider"></div>
          <div class="center item">Payment: \${order.paymentMethod.toUpperCase()}</div>
          <div class="center" style="margin-top:20px;">Thank You!</div>
          <script>window.print(); setTimeout(()=>window.close(), 500);</script>
        </body>
      </html>
    \`);
    printWindow.document.close();
  };

  const updateFeeOrRider = async (id: number, field: string, value: string|number) => {`
);

code = code.replace(
`<h1 className="text-3xl font-bold text-stone-800">Live Orders</h1>`,
`<h1 className="text-3xl font-bold text-stone-800">Live Orders</h1>
        <button onClick={clearOldOrders} className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-200 transition">
          <Trash2 size={16} /> Clear Old Orders
        </button>`
);

code = code.replace(
`<div className="text-right">
                  <span className={\`px-3 py-1 rounded-full text-sm font-bold capitalize border`,
`<div className="text-right flex items-center gap-3">
                  <button onClick={() => printBill(order)} className="text-stone-500 hover:text-[#3E1111] transition"><Printer size={20}/></button>
                  <span className={\`px-3 py-1 rounded-full text-sm font-bold capitalize border`
);

fs.writeFileSync('src/AdminApp.tsx', code);
