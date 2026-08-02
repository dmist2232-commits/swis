const fs = require('fs');
let code = fs.readFileSync('src/CustomerApp.tsx', 'utf8');

code = code.replace(
  'const { settings } = useStore();',
  'const { settings, orders } = useStore();\n  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);\n  const [placedOrderNumber, setPlacedOrderNumber] = useState<number | null>(null);\n  const [countdown, setCountdown] = useState(300);'
);

code = code.replace(
  `  const handleCheckout = () => {
    if (!name || !phone || !address) {
      toast.error("Please fill all details");
      return;
    }
    
    if (paymentMethod === 'card') {
      setShowPaymentModal(true);
      setPaymentStep(1);
    } else {
      placeOrder();
    }
  };`,
  `  const handleCheckout = () => {
    if (!name || !phone || !address) {
      toast.error("Please fill all details");
      return;
    }
    placeOrder();
  };

  useEffect(() => {
    if (waitingForConfirmation && placedOrderNumber !== null) {
      const placedOrder = orders.find(o => o.orderNumber === placedOrderNumber);
      if (placedOrder) {
        if (placedOrder.status === 'accepted' || placedOrder.status === 'cooking' || placedOrder.status === 'onway') {
          setWaitingForConfirmation(false);
          setShowPaymentModal(true);
          setPaymentStep(1);
        } else if (placedOrder.status === 'cancelled' || placedOrder.status === 'rejected') {
          setWaitingForConfirmation(false);
          toast.error("Shop cancelled the order. No charges were made.");
          navigate('/my-orders');
        }
      }
    }
  }, [orders, waitingForConfirmation, placedOrderNumber]);

  useEffect(() => {
    if (waitingForConfirmation && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (waitingForConfirmation && countdown === 0) {
      setWaitingForConfirmation(false);
      toast.error("Shop did not respond in time. Order timeout.");
      navigate('/my-orders');
    }
  }, [waitingForConfirmation, countdown]);`
);

code = code.replace(
  `      toast.success("Order Placed successfully!");
      setShowPaymentModal(false);
      navigate('/my-orders');`,
  `      if (paymentMethod === 'card') {
        toast.success("Order sent! Waiting for shop to confirm...");
        setPlacedOrderNumber(data.orderNumber);
        setWaitingForConfirmation(true);
        setCountdown(300);
      } else {
        toast.success("Order Placed successfully!");
        setShowPaymentModal(false);
        navigate('/my-orders');
      }`
);

code = code.replace(
  `  const processPayment = () => {
    toast.loading("Verifying OTP...", { id: 'otp' });
    setTimeout(() => {
      toast.success("Payment Successful!", { id: 'otp' });
      placeOrder();
    }, 1500);
  };`,
  `  const processPayment = () => {
    toast.loading("Verifying OTP...", { id: 'otp' });
    setTimeout(() => {
      toast.success("Payment Successful!", { id: 'otp' });
      setShowPaymentModal(false);
      navigate('/my-orders');
    }, 1500);
  };`
);

// We need to add the Waiting modal JSX. We can append it just before the return in Checkout? No, the return is the JSX.
// We can find `{/* Fake PayHere Modal */}` and add the waiting modal above it.
code = code.replace(
  `{/* Fake PayHere Modal */}`,
  `{/* Waiting for Confirmation Modal */}
      <AnimatePresence>
        {waitingForConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Shop</h2>
              <p className="text-gray-500 mb-6">Please wait while the shop confirms your order. Don't leave this page until timeout.</p>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-400">Timeout in {countdown} seconds</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fake PayHere Modal */}`
);

fs.writeFileSync('src/CustomerApp.tsx', code);
