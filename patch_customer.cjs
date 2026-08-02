const fs = require('fs');
let code = fs.readFileSync('src/CustomerApp.tsx', 'utf8');

code = code.replace(
`  const processPayment = () => {
    toast.loading("Verifying OTP...", { id: 'otp' });
    setTimeout(() => {
      toast.success("Payment Successful!", { id: 'otp' });
      setShowPaymentModal(false);
      navigate('/my-orders');
    }, 1500);
  };`,
`  const processPayment = async () => {
    toast.loading("Verifying OTP...", { id: 'otp' });
    setTimeout(async () => {
      if (placedOrderNumber) {
        await fetch('/api/orders/' + placedOrderNumber, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ extraNotes: 'Payment Successful (Card)' })
        });
      }
      toast.success("Payment Successful!", { id: 'otp' });
      setShowPaymentModal(false);
      navigate('/my-orders');
    }, 1500);
  };

  const handlePaymentCancel = async () => {
    if (placedOrderNumber) {
        await fetch('/api/orders/' + placedOrderNumber, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ status: 'cancelled', extraNotes: 'Payment Failed (Card)' })
        });
    }
    toast.error("Payment Cancelled / Failed");
    setShowPaymentModal(false);
    navigate('/my-orders');
  };`
);

code = code.replace(
`<button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">✕</button>`,
`<button onClick={handlePaymentCancel} className="text-gray-400 hover:text-white">✕</button>`
);

fs.writeFileSync('src/CustomerApp.tsx', code);
