import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, Star, User, LogOut, Clock, ArrowRight, Search, Plus, Minus, Home as HomeIcon, Bike } from 'lucide-react';
import { useStore } from './store/useStore';
import toast from 'react-hot-toast';

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate('/home'), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div 
      className="fixed inset-0 bg-red-600 flex items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center relative"
      >
        <h1 className="text-5xl font-bold text-white tracking-wider mb-2 font-serif">GRAND SPICY</h1>
        <motion.h2 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5, duration: 1 }}
          className="text-4xl text-amber-300 font-bold font-serif mb-12"
        >
          සිසාරා
        </motion.h2>

        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 200, opacity: [0, 1, 1, 0] }}
          transition={{ delay: 1.5, duration: 2.5, ease: "easeInOut" }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white flex items-center gap-2"
        >
          <div className="relative">
            <motion.div 
              animate={{ y: [-2, 2, -2] }} 
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              <Bike size={48} className="text-amber-400" />
            </motion.div>
            <motion.div 
              className="absolute top-1/2 -left-6 w-4 h-1 bg-white/50 rounded-full"
              animate={{ x: [-10, 0, -10], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            />
          </div>
          <span className="font-bold italic text-amber-200">On the way...</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Home() {
  const { menu, settings } = useStore();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('rice');
  const [search, setSearch] = useState('');

  const addToCart = (item: any) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const categories = ['rice', 'kottu', 'biriyani', 'noodles', 'drinks'];

  let parsedBanners: string[] = [];
  try {
    parsedBanners = JSON.parse(settings?.banners || '[]');
  } catch (e) {
    parsedBanners = [];
  }
  
  const filteredMenu = menu.filter(item => 
    (activeCategory === 'all' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-spicy-pattern text-gray-900 flex flex-col md:flex-row relative">
      {/* Announcement Banner */}
      {settings?.currentEvent && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-bold shadow-md z-50 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-pulse">📢 {settings.currentEvent}</div>
        </div>
      )}

      {/* Mobile Header */}
      <header className={`md:hidden bg-white p-4 shadow-sm sticky z-20 flex justify-between items-center ${settings?.currentEvent ? 'top-8' : 'top-0'}`}>
        <div>
          <h1 className="text-xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> Veyangoda</p>
        </div>
        <Link to="/profile" className="p-2 bg-gray-100 rounded-full text-gray-600">
          <User size={20} />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 p-4 md:p-8 flex flex-col h-screen overflow-y-auto pb-32 md:pb-8 ${settings?.currentEvent ? 'pt-12 md:pt-16' : ''}`}>
        
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={16}/> 5335+H5H, Veyangoda 11100</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Find Product..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 outline-none focus:border-red-500 transition"
              />
            </div>
            <Link to="/admin" className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition">
              Admin Portal
            </Link>
            <Link to="/profile" className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50">
              <User size={20} />
            </Link>
          </div>
        </div>

        
        {/* Banners Area */}
        {parsedBanners.length > 0 && (
          <div className="mb-6 overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide pb-2">
            {parsedBanners.map((url, idx) => (
              <img key={idx} src={url} alt={`Banner ${idx + 1}`} className="w-full md:w-[600px] h-48 md:h-64 object-cover rounded-2xl shadow-sm flex-shrink-0 snap-center" />
            ))}
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-10 pr-4 outline-none focus:border-red-500 transition shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide snap-x">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition snap-start ${activeCategory === 'all' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm capitalize transition snap-start ${activeCategory === category ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredMenu.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition">
              <div className="relative mb-4 flex-1">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-700 shadow-sm capitalize">
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3 flex-1">{item.description}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                <span className="font-bold text-xl text-gray-900">Rs. {item.price}</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="bg-gray-100 text-gray-900 hover:bg-red-600 hover:text-white p-2 rounded-xl transition flex items-center justify-center w-10 h-10"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No items found.
            </div>
          )}
        </div>
        
        {/* Customer Reviews Section */}
        <div className="mt-16">
          <CustomerReviews />
        </div>
      </main>

      {/* Desktop Cart Sidebar */}
      <aside className="hidden lg:flex flex-col w-96 bg-white border-l border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">MY ORDER</h2>
          <p className="text-sm text-gray-500 mt-1">{cart.length} items</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item, idx) => (
            <div key={item.cartId} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              {item.image ? (
                <img src={item.image} className="w-16 h-16 rounded-lg object-cover" alt="" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-red-600 text-sm">Rs. {item.price}</span>
                  <button onClick={() => removeFromCart(item.cartId)} className="text-gray-400 hover:text-red-500 p-1 bg-white rounded shadow-sm">
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-4 text-gray-600">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900 text-xl">Rs. {cartTotal}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => navigate('/checkout', { state: { cart } })}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            Confirm Order
          </button>
        </div>
      </aside>

      {/* Mobile Floating Cart button if items exist */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="lg:hidden fixed bottom-20 left-4 right-4 z-40"
        >
          <button 
            onClick={() => navigate('/checkout', { state: { cart } })}
            className="w-full bg-green-500 text-white py-4 rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-between px-6 transition active:scale-95"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs text-white/80 font-medium">Total: Rs. {cartTotal}</span>
              <span className="font-bold">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            </div>
            <span className="flex items-center gap-2 font-bold">Checkout <ArrowRight size={20} /></span>
          </button>
        </motion.div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-30">
        <Link to="/home" className="flex flex-col items-center text-red-600">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </Link>
        <Link to="/my-orders" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <Clock size={24} />
          <span className="text-[10px] font-medium mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <User size={24} />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

// Distance helper
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function CustomerReviews() {
  const { feedbacks } = useStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) {
      toast.error('Please provide a name and comment');
      return;
    }
    try {
      await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, rating, comment })
      });
      toast.success('Thank you for your review!');
      setComment('');
      setName('');
      setRating(5);
    } catch (e) {
      toast.error('Failed to submit review');
    }
  };

  // Sort feedbacks: pinned first, then by date (assuming id is auto-incrementing so higher id = newer)
  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.id - a.id;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">What our customers say</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={submitReview} className="space-y-4">
            <h3 className="font-bold text-gray-700">Write a Review</h3>
            <div>
              <input 
                type="text" placeholder="Your Name" 
                value={name} onChange={e=>setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                {[1,2,3,4,5].map(star => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="text-2xl">
                    <span className={star <= rating ? 'text-amber-500' : 'text-gray-300'}>★</span>
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="How was your food?" 
                value={comment} onChange={e=>setComment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 transition h-24"
              />
            </div>
            <button type="submit" className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition shadow-md">
              Submit Review
            </button>
          </form>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {sortedFeedbacks.map(fb => (
            <div key={fb.id} className={`p-4 rounded-xl border ${fb.pinned ? 'border-amber-200 bg-amber-50 shadow-sm' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800">{fb.customerName} {fb.pinned && <span className="ml-2 text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Pinned</span>}</h4>
                <div className="text-amber-500 text-sm flex gap-0.5">
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{fb.comment}</p>
            </div>
          ))}
          {sortedFeedbacks.length === 0 && (
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { settings } = useStore();
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const state = (window.history.state as any)?.usr?.cart;
      return state || [];
    } catch {
      return [];
    }
  });
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'>('cash');
  const [distance, setDistance] = useState(0);
  const [userLat, setUserLat] = useState(0);
  const [userLng, setUserLng] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [otp, setOtp] = useState('');

  const totalItems = cart.reduce((acc, curr) => acc + curr.price, 0);
  
  let deliveryFee = 0;
  if (distance > 0 && settings) {
    const firstKm = parseFloat(settings.firstKmRate || '150');
    const perKm = parseFloat(settings.perKmRate || '100');
    if (distance <= 1) {
      deliveryFee = firstKm;
    } else {
      deliveryFee = firstKm + Math.ceil(distance - 1) * perKm;
    }
  }

  const grandTotal = totalItems + deliveryFee;

  const getLoc = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        if (settings?.hostLat && settings?.hostLng) {
          const d = calcDistance(
            pos.coords.latitude, 
            pos.coords.longitude, 
            parseFloat(settings.hostLat), 
            parseFloat(settings.hostLng)
          );
          setDistance(d);
          toast.success(`Location found! Distance: ${d.toFixed(1)} km`);
        }
      }, () => {
        toast.error("Please enable location services or type manual distance.");
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleCheckout = () => {
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
  };

  const placeOrder = async () => {
    const payload = {
      customerName: name,
      phone,
      location: address,
      lat: userLat,
      lng: userLng,
      items: cart,
      extraNotes: notes,
      deliveryCharge: deliveryFee,
      total: grandTotal,
      paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      myOrders.push(data.orderNumber);
      localStorage.setItem('myOrders', JSON.stringify(myOrders));
      
      toast.success("Order Placed successfully!");
      setShowPaymentModal(false);
      navigate('/my-orders');
    } catch (e) {
      toast.error("Failed to place order.");
    }
  };

  const processPayment = () => {
    toast.loading("Verifying OTP...", { id: 'otp' });
    setTimeout(() => {
      toast.success("Payment Successful!", { id: 'otp' });
      placeOrder();
    }, 1500);
  };

  if (cart.length === 0) return <div className="p-8 text-center"><p>Cart is empty</p><button onClick={()=>navigate('/')} className="mt-4 text-red-600">Go Back</button></div>;

  return (
    <div className="min-h-screen bg-spicy-pattern pb-24 text-gray-900">
      {/* Fake PayHere Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">P</div>
                  <span className="font-bold tracking-wider">PAYHERE SECURE</span>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm">Paying GRAND SPICY</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">Rs. {grandTotal}</p>
                </div>

                {paymentStep === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label>
                      <input 
                        type="text" placeholder="0000 0000 0000 0000" 
                        value={cardDetails.number} onChange={e=>setCardDetails({...cardDetails, number: e.target.value})}
                        className="w-full border border-gray-300 p-3 rounded-lg font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label>
                        <input 
                          type="text" placeholder="MM/YY" 
                          value={cardDetails.expiry} onChange={e=>setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="w-full border border-gray-300 p-3 rounded-lg font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVC</label>
                        <input 
                          type="text" placeholder="123" 
                          value={cardDetails.cvc} onChange={e=>setCardDetails({...cardDetails, cvc: e.target.value})}
                          className="w-full border border-gray-300 p-3 rounded-lg font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if(cardDetails.number.length > 10) setPaymentStep(2);
                        else toast.error("Enter a valid card number");
                      }}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-2"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-gray-600 mb-4">An OTP has been sent to your registered mobile number ending in **45.</p>
                    <div>
                      <input 
                        type="text" placeholder="Enter OTP" 
                        value={otp} onChange={e=>setOtp(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg font-mono text-center tracking-widest text-lg outline-none focus:border-blue-500"
                      />
                    </div>
                    <button 
                      onClick={processPayment}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-2"
                    >
                      Verify & Pay
                    </button>
                    <button onClick={() => setPaymentStep(1)} className="text-blue-600 text-sm font-bold mt-4">Back to Card Details</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full"><ChevronRight className="rotate-180" /></button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><MapPin className="text-red-600"/> Delivery Details</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 transition"/>
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 transition"/>
            <div className="flex gap-2">
              <input type="text" placeholder="Delivery Address" value={address} onChange={e=>setAddress(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 transition"/>
              <button onClick={getLoc} className="bg-gray-100 p-3 rounded-xl text-gray-600 hover:bg-gray-200 transition"><MapPin size={24}/></button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><ShoppingBag className="text-red-600"/> Order Items</h2>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center mb-3 text-sm pb-3 border-b border-gray-50">
              <span className="font-medium">{item.name}</span>
              <span className="font-bold text-gray-900">Rs. {item.price}</span>
            </div>
          ))}
          <input 
            type="text" 
            placeholder="Extra notes (e.g. extra cheese, more spicy...)" 
            value={notes} onChange={e=>setNotes(e.target.value)} 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 outline-none focus:border-red-500 text-sm"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><CreditCard className="text-red-600"/> Payment Method</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'cash' ? 'border-red-600 bg-red-50 text-red-900 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <CreditCard size={24} className={paymentMethod === 'cash' ? 'text-red-600' : ''} />
              <span className="font-bold text-sm">Cash on Delivery</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'card' ? 'border-red-600 bg-red-50 text-red-900 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <CreditCard size={24} className={paymentMethod === 'card' ? 'text-red-600' : ''} />
              <span className="font-bold text-sm">Card (PayHere)</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3 text-gray-500 text-sm">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">Rs. {totalItems}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-500 text-sm">
            <span>Delivery Fee ({distance > 0 ? distance.toFixed(1) + 'km' : 'calc...'})</span>
            <span className="font-medium text-gray-900">Rs. {deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t border-gray-100 pt-4 text-gray-900">
            <span>Total</span>
            <span className="text-red-600">Rs. {grandTotal}</span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition active:scale-95 text-lg"
        >
          Confirm Order
        </button>
      </main>
    </div>
  );
}

function MyOrders() {
  const { orders } = useStore();
  const navigate = useNavigate();
  const myOrderNumbers = JSON.parse(localStorage.getItem('myOrders') || '[]');
  
  const myOrders = orders.filter(o => myOrderNumbers.includes(o.orderNumber));

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    cooking: 'bg-orange-50 text-orange-700 border-orange-200',
    onway: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="min-h-screen bg-spicy-pattern text-gray-900 pb-20 lg:pb-0">
      <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/home')} className="p-2 bg-gray-100 rounded-full"><ChevronRight className="rotate-180" /></button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4">
        {myOrders.length === 0 ? (
          <div className="text-center py-20">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No orders placed yet.</p>
          </div>
        ) : (
          myOrders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="font-bold text-gray-900">Rs. {item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between font-bold text-sm border-t border-gray-100 pt-4">
                <span className="text-gray-500 uppercase text-xs tracking-wider">Total Amount</span>
                <span className="text-lg text-red-600">Rs. {order.total + (order.extraFee || 0)}</span>
              </div>
              {order.extraFee > 0 && (
                <p className="text-xs text-orange-600 text-right mt-1 font-medium">+ Rs. {order.extraFee} extra fee added</p>
              )}
              {order.deliveryGuyNumber && (
                <div className="mt-4 bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-200">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Delivery Rider</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{order.deliveryGuyNumber}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-30">
        <Link to="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <HomeIcon size={24} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link to="/my-orders" className="flex flex-col items-center text-red-600">
          <Clock size={24} />
          <span className="text-[10px] font-bold mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <User size={24} />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mockUser') || 'null'));

  const handleLogin = () => {
    const u = { name: 'Customer User', email: 'customer@gmail.com' };
    localStorage.setItem('mockUser', JSON.stringify(u));
    setUser(u);
    toast.success("Logged in with Google (Mock)");
  };

  return (
    <div className="min-h-screen bg-spicy-pattern text-gray-900 pb-20 lg:pb-0">
      <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/home')} className="p-2 bg-gray-100 rounded-full"><ChevronRight className="rotate-180" /></button>
        <h1 className="text-lg font-bold">Profile</h1>
      </header>

      <main className="p-6 text-center max-w-md mx-auto">
        {!user ? (
          <div className="mt-20">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm border border-gray-100">
              <User size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
            <p className="text-gray-500 mb-8">Sign in to save your orders and preferences.</p>
            <button 
              onClick={handleLogin}
              className="bg-white border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold w-full hover:bg-gray-50 shadow-sm transition flex items-center justify-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <div className="mt-8 text-sm text-gray-400 text-left space-y-2">
              <p className="font-medium text-gray-500 border-b pb-1">Shop Details</p>
              <p>Hotline: 0112345678</p>
              <p>Address: 5335+H5H, Veyangoda 11100</p>
              <p className="mt-4 pt-4 border-t italic text-xs">Developed by Dinuka Kasun & FB-THE CREATER</p>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-sm">
              <span className="text-3xl font-bold text-red-600">C</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-gray-500 mb-8">{user.email}</p>
            
            <div className="space-y-4 text-left">
              <button onClick={() => navigate('/my-orders')} className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition">
                <span className="flex items-center gap-3 font-bold text-gray-700"><Clock className="text-red-500"/> My Orders</span>
                <ChevronRight className="text-gray-400" />
              </button>
              <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition">
                <span className="flex items-center gap-3 font-bold text-gray-700"><Star className="text-yellow-400"/> Leave Feedback</span>
                <ChevronRight className="text-gray-400" />
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('mockUser');
                  setUser(null);
                }}
                className="w-full bg-white text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-8 border border-gray-200 shadow-sm hover:bg-red-50 transition"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-30">
        <Link to="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <HomeIcon size={24} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link to="/my-orders" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <Clock size={24} />
          <span className="text-[10px] font-medium mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-red-600">
          <User size={24} />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default function CustomerApp() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AnimatePresence>
  );
}

