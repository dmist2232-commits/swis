import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import toast from 'react-hot-toast';
import { LayoutDashboard, Users, ShoppingBag, Settings as SettingsIcon, LogOut, Bell, CheckCircle2, XCircle, Search, Edit2, MessageSquare, MapPin, Image as ImageIcon } from 'lucide-react';

function AdminLogin({ onLogin }: { onLogin: (role: 'admin'|'host') => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const settings = useStore(state => state.settings);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = settings?.adminPassword || '200732503140';
    const hostPass = settings?.hostPassword || '132333435363';

    if (username === 'ADMINSISARA112@' && password === adminPass) {
      onLogin('admin');
      toast.success('Admin Logged In');
    } else if (username === 'SISARAHOST232' && password === hostPass) {
      onLogin('host');
      toast.success('Host Logged In');
    } else {
      toast.error('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
      <div className="bg-stone-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-stone-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">GRAND SPICY</h1>
          <p className="text-stone-400">Management Portal</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Username</label>
            <input 
              type="text" 
              value={username} onChange={e=>setUsername(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl p-3 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Password</label>
            <input 
              type="password" 
              value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl p-3 outline-none focus:border-amber-500"
            />
          </div>
          <button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-3 rounded-xl transition mt-4">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminLayout({ children, role, setRole }: { children: React.ReactNode, role: 'admin'|'host', setRole: (r: null)=>void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-100 flex hidden md:flex">
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <h2 className="font-serif font-bold text-xl text-[#3E1111]">GRAND SPICY</h2>
          <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === '/admin' ? 'bg-[#3E1111] text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <LayoutDashboard size={20} /> Orders
          </Link>
          <Link to="/admin/menu" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === '/admin/menu' ? 'bg-[#3E1111] text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <ShoppingBag size={20} /> Menu
          </Link>
          <Link to="/admin/banners" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === '/admin/banners' ? 'bg-[#3E1111] text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <ImageIcon size={20} /> Banners
          </Link>
          <Link to="/admin/reviews" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === '/admin/reviews' ? 'bg-[#3E1111] text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            <MessageSquare size={20} /> Reviews
          </Link>
          {role === 'host' && (
            <Link to="/admin/host" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === '/admin/host' ? 'bg-amber-500 text-stone-900' : 'text-stone-600 hover:bg-stone-100'}`}>
              <SettingsIcon size={20} /> Host Dashboard
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-stone-200">
          <button onClick={()=>setRole(null)} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function OrdersView() {
  const { orders } = useStore();
  const [filter, setFilter] = useState('all');
  
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status })
    });
    toast.success(`Order status updated to ${status}`);
  };

  const updateFeeOrRider = async (id: number, field: string, value: string|number) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ [field]: value })
    });
    toast.success(`Updated order #${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-stone-800">Live Orders</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'cooking', 'onway', 'delivered', 'cancelled'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${filter === f ? 'bg-[#3E1111] text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">Order #{order.orderNumber}</h3>
                  <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize border
                    ${order.status === 'pending' ? 'bg-stone-100 text-stone-700' : 
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div><span className="text-stone-500">Customer:</span> <span className="font-bold">{order.customerName}</span></div>
                <div><span className="text-stone-500">Phone:</span> <span className="font-bold">{order.phone}</span></div>
                <div className="col-span-2 flex items-start justify-between">
                  <div><span className="text-stone-500">Address:</span> <span className="font-bold">{order.location}</span></div>
                  {order.lat && order.lng ? (
                    <a href={`https://www.google.com/maps?q=${order.lat},${order.lng}`} target="_blank" rel="noreferrer" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md whitespace-nowrap flex items-center gap-2 hover:bg-blue-700 transition transform hover:scale-105 animate-bounce">
                      <MapPin size={16} /> View on Map
                    </a>
                  ) : null}
                </div>
                <div className="col-span-2"><span className="text-stone-500">Notes:</span> <span className="font-bold text-amber-700">{order.extraNotes || 'None'}</span></div>
              </div>

              <div>
                <h4 className="font-bold mb-2 text-sm text-stone-500 uppercase">Items</h4>
                <div className="space-y-1">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>Rs. {item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full xl:w-72 bg-stone-50 p-4 rounded-xl border border-stone-100 flex flex-col justify-between">
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span> <span>Rs. {order.total - order.deliveryCharge}</span></div>
                <div className="flex justify-between"><span>Delivery:</span> <span>Rs. {order.deliveryCharge}</span></div>
                <div className="flex justify-between items-center text-amber-600">
                  <span>Extra Fee:</span> 
                  <input type="number" defaultValue={order.extraFee} onBlur={(e) => updateFeeOrRider(order.id, 'extraFee', parseFloat(e.target.value))} className="w-20 p-1 rounded border border-amber-200 text-right"/>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-200">
                  <span>Total:</span> <span>Rs. {order.total + order.extraFee}</span>
                </div>
                <div className="flex justify-between"><span>Payment:</span> <span className="uppercase font-bold text-stone-500">{order.paymentMethod}</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-500 uppercase">Rider Number</label>
                  <input 
                    type="text" placeholder="Enter phone" defaultValue={order.deliveryGuyNumber}
                    onBlur={(e) => updateFeeOrRider(order.id, 'deliveryGuyNumber', e.target.value)}
                    className="p-2 border border-stone-300 rounded-lg text-sm w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {order.status === 'pending' && (
                    <>
                      <button onClick={()=>updateStatus(order.id, 'accepted')} className="bg-blue-600 text-white p-2 rounded-lg text-sm font-bold">Accept</button>
                      <button onClick={()=>updateStatus(order.id, 'cancelled')} className="bg-red-100 text-red-600 p-2 rounded-lg text-sm font-bold">Cancel</button>
                    </>
                  )}
                  {order.status === 'accepted' && <button onClick={()=>updateStatus(order.id, 'cooking')} className="col-span-2 bg-orange-500 text-white p-2 rounded-lg text-sm font-bold">Start Cooking</button>}
                  {order.status === 'cooking' && <button onClick={()=>updateStatus(order.id, 'onway')} className="col-span-2 bg-amber-500 text-white p-2 rounded-lg text-sm font-bold">Send to Delivery</button>}
                  {order.status === 'onway' && <button onClick={()=>updateStatus(order.id, 'delivered')} className="col-span-2 bg-green-500 text-white p-2 rounded-lg text-sm font-bold">Mark Delivered</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && <p className="text-stone-500 p-8 text-center bg-white rounded-2xl border border-stone-200">No orders found.</p>}
      </div>
    </div>
  );
}

function MenuView() {
  const { menu } = useStore();
  const [newMenu, setNewMenu] = useState({ category: 'rice', name: '', description: '', price: '', image: '' });

  const addMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/menu', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newMenu)
    });
    setNewMenu({ category: 'rice', name: '', description: '', price: '', image: '' });
    toast.success("Menu item added");
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    toast.success("Item deleted");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 sticky top-8">
          <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
          <form onSubmit={addMenuItem} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Category</label>
              <select value={newMenu.category} onChange={e=>setNewMenu({...newMenu, category: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl mt-1">
                <option value="rice">Rice</option>
                <option value="kottu">Kottu</option>
                <option value="biriyani">Biriyani</option>
                <option value="noodles">Noodles</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Name</label>
              <input required type="text" value={newMenu.name} onChange={e=>setNewMenu({...newMenu, name: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Description</label>
              <textarea value={newMenu.description} onChange={e=>setNewMenu({...newMenu, description: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl mt-1"></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Price (Rs)</label>
              <input required type="number" value={newMenu.price} onChange={e=>setNewMenu({...newMenu, price: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Image URL (optional)</label>
              <input type="text" value={newMenu.image} onChange={e=>setNewMenu({...newMenu, image: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl mt-1" />
            </div>
            <button className="w-full bg-[#3E1111] text-white font-bold p-3 rounded-xl hover:bg-[#2a0b0b] transition">
              Add Item
            </button>
          </form>
        </div>
      </div>
      
      <div className="xl:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold">Current Menu</h2>
        <div className="grid grid-cols-2 gap-4">
          {menu.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-200 flex gap-4">
              {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />}
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold">{item.name}</h3>
                  <span className="text-sm font-bold text-amber-600">Rs. {item.price}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs uppercase bg-stone-100 px-2 py-1 rounded">{item.category}</span>
                  <button onClick={() => deleteItem(item.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HostDashboard() {
  const { settings, orders } = useStore();
  
  const updateSetting = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ key, value })
    });
    toast.success(`Settings updated`);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today) && o.status !== 'cancelled');
  const todaySales = todayOrders.reduce((acc, curr) => acc + curr.total + curr.extraFee, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-stone-800">Host Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="text-white/80 font-bold mb-2">Today's Sales</h3>
          <p className="text-4xl font-bold">Rs. {todaySales}</p>
          <p className="text-sm mt-2">{todayOrders.length} Completed/Active Orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm md:col-span-2">
          <h3 className="text-stone-500 font-bold mb-4 uppercase text-xs">Email Statements</h3>
          <p className="text-sm text-stone-600 mb-4">
            Daily, weekly, and monthly statements can be sent to the configured host email address. (Requires backend cron setup).
          </p>
          <div className="flex gap-4">
            <input type="email" placeholder="Host Email Address" className="p-3 border border-stone-200 rounded-xl flex-1" />
            <button className="bg-[#3E1111] text-white px-6 py-3 rounded-xl font-bold">Save Email</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold mb-6">Global Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-stone-600 border-b pb-2">Delivery Charges</h3>
            <div>
              <label className="text-sm text-stone-500 block mb-1">First KM Rate (Rs)</label>
              <input type="number" defaultValue={settings?.firstKmRate} onBlur={(e)=>updateSetting('firstKmRate', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Per KM Rate (Rs)</label>
              <input type="number" defaultValue={settings?.perKmRate} onBlur={(e)=>updateSetting('perKmRate', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div className="pt-2">
              <label className="text-sm text-stone-500 block mb-1">Host Location (Lat, Lng)</label>
              <div className="flex gap-2">
                <input type="text" defaultValue={settings?.hostLat} onBlur={(e)=>updateSetting('hostLat', e.target.value)} placeholder="Lat" className="w-1/2 p-3 border border-stone-200 rounded-xl"/>
                <input type="text" defaultValue={settings?.hostLng} onBlur={(e)=>updateSetting('hostLng', e.target.value)} placeholder="Lng" className="w-1/2 p-3 border border-stone-200 rounded-xl"/>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-stone-600 border-b pb-2">Business Details</h3>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Shop Hotline Number</label>
              <input type="text" defaultValue={settings?.shopPhone} onBlur={(e)=>updateSetting('shopPhone', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">PayHere Merchant ID</label>
              <input type="text" defaultValue={settings?.payHereId} onBlur={(e)=>updateSetting('payHereId', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Current Event / Announcement</label>
              <input type="text" defaultValue={settings?.currentEvent} onBlur={(e)=>updateSetting('currentEvent', e.target.value)} placeholder="e.g. 20% Off on Weekend!" className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-stone-600 border-b pb-2">Access Control</h3>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Admin Password</label>
              <input type="text" defaultValue={settings?.adminPassword || '200732503140'} onBlur={(e)=>updateSetting('adminPassword', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Host Password</label>
              <input type="text" defaultValue={settings?.hostPassword || '132333435363'} onBlur={(e)=>updateSetting('hostPassword', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsView() {
  const { feedbacks } = useStore();

  const togglePin = async (id: number, currentPinned: boolean) => {
    try {
      await fetch(`/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ pinned: !currentPinned })
      });
      toast.success(currentPinned ? 'Review Unpinned' : 'Review Pinned');
    } catch (e) {
      toast.error('Failed to pin review');
    }
  };

  const deleteReview = async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      toast.success('Review Deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-800">Customer Reviews</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.map(fb => (
          <div key={fb.id} className={`p-4 rounded-xl border ${fb.pinned ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-stone-800">{fb.customerName}</h3>
                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => togglePin(fb.id, !!fb.pinned)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${fb.pinned ? 'bg-amber-200 text-amber-800' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {fb.pinned ? 'Unpin' : 'Pin to Top'}
                </button>
                <button onClick={() => deleteReview(fb.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <XCircle size={18} />
                </button>
              </div>
            </div>
            <p className="text-stone-600 mt-2">{fb.comment}</p>
            <p className="text-xs text-stone-400 mt-2">{new Date(fb.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {feedbacks.length === 0 && <p className="text-stone-500 col-span-2">No reviews yet.</p>}
      </div>
    </div>
  );
}


function BannersView() {
  const { settings } = useStore();
  const [newBanner, setNewBanner] = useState('');

  let banners: string[] = [];
  try {
    banners = JSON.parse(settings?.banners || '[]');
  } catch (e) {
    banners = [];
  }

  const updateSetting = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ key, value })
    });
    toast.success('Banners updated');
  };

  const addBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner) return;
    const updated = [...banners, newBanner];
    updateSetting('banners', JSON.stringify(updated));
    setNewBanner('');
  };

  const removeBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    updateSetting('banners', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-stone-800">Manage Banners</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <form onSubmit={addBanner} className="flex gap-4 mb-6">
          <input 
            type="url" 
            placeholder="Image URL" 
            value={newBanner} 
            onChange={(e) => setNewBanner(e.target.value)} 
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl"
            required
          />
          <button type="submit" className="px-6 py-3 bg-[#3E1111] text-white rounded-xl font-bold hover:bg-stone-800 transition">
            Add Banner
          </button>
        </form>

        <div className="space-y-4">
          {banners.length === 0 ? (
            <p className="text-stone-500">No banners added yet.</p>
          ) : (
            banners.map((url, index) => (
              <div key={index} className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <img src={url} alt="Banner" className="w-32 h-16 object-cover rounded-lg" />
                <div className="flex-1 truncate">{url}</div>
                <button onClick={() => removeBanner(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition">
                  <XCircle size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [role, setRole] = useState<'admin'|'host'|null>(null);

  if (!role) {
    return <AdminLogin onLogin={setRole} />;
  }

  return (
    <AdminLayout role={role} setRole={setRole}>
      {/* Mobile blocker */}
      <div className="md:hidden fixed inset-0 bg-stone-900 text-white flex flex-col items-center justify-center p-8 text-center z-50">
        <h1 className="text-2xl font-bold mb-4">Desktop Mode Required</h1>
        <p className="text-stone-400">The administration panel is only accessible on desktop devices. Please switch to a larger screen.</p>
      </div>

      <Routes>
        <Route path="/" element={<OrdersView />} />
        <Route path="/menu" element={<MenuView />} />
        <Route path="/banners" element={<BannersView />} />
        <Route path="/reviews" element={<ReviewsView />} />
        {role === 'host' && <Route path="/host" element={<HostDashboard />} />}
      </Routes>
    </AdminLayout>
  );
}
