const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf8');

const importStr = "import { LayoutDashboard, Users, ShoppingBag, Settings as SettingsIcon, LogOut, Bell, CheckCircle2, XCircle, Search, Edit2, MessageSquare, MapPin, Image as ImageIcon, Printer, Trash2 } from 'lucide-react';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\nimport { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';";

code = code.replace("import { LayoutDashboard, Users, ShoppingBag, Settings as SettingsIcon, LogOut, Bell, CheckCircle2, XCircle, Search, Edit2, MessageSquare, MapPin, Image as ImageIcon } from 'lucide-react';", importStr);

const hostDashboardStr = `function HostDashboard() {
  const { settings, orders } = useStore();
  
  const updateSetting = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ key, value })
    });
    toast.success(\`Settings updated\`);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected');
  
  const todayOrders = activeOrders.filter(o => o.createdAt.startsWith(todayStr));
  const todaySales = todayOrders.reduce((acc, curr) => acc + curr.total + curr.extraFee, 0);

  const thisWeekOrders = activeOrders.filter(o => isWithinInterval(parseISO(o.createdAt), { start: startOfWeek(today), end: endOfWeek(today) }));
  const weekSales = thisWeekOrders.reduce((acc, curr) => acc + curr.total + curr.extraFee, 0);

  const thisMonthOrders = activeOrders.filter(o => isWithinInterval(parseISO(o.createdAt), { start: startOfMonth(today), end: endOfMonth(today) }));
  const monthSales = thisMonthOrders.reduce((acc, curr) => acc + curr.total + curr.extraFee, 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayOrders = activeOrders.filter(o => o.createdAt.startsWith(dStr));
    const daySales = dayOrders.reduce((acc, curr) => acc + curr.total + curr.extraFee, 0);
    return { name: format(d, 'MMM dd'), sales: daySales };
  }).reverse();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-stone-800">Host Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="text-white/80 font-bold mb-2">Today's Sales</h3>
          <p className="text-4xl font-bold">Rs. {todaySales}</p>
          <p className="text-sm mt-2">{todayOrders.length} Orders</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="text-white/80 font-bold mb-2">This Week</h3>
          <p className="text-4xl font-bold">Rs. {weekSales}</p>
          <p className="text-sm mt-2">{thisWeekOrders.length} Orders</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="text-white/80 font-bold mb-2">This Month</h3>
          <p className="text-4xl font-bold">Rs. {monthSales}</p>
          <p className="text-sm mt-2">{thisMonthOrders.length} Orders</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h3 className="font-bold text-stone-600 mb-6">Last 7 Days Sales Analysis</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => \`Rs.\${value}\`} />
              <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="sales" fill="#3E1111" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
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
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-stone-600 border-b pb-2">Location</h3>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Host Latitude</label>
              <input type="text" defaultValue={settings?.hostLat} onBlur={(e)=>updateSetting('hostLat', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Host Longitude</label>
              <input type="text" defaultValue={settings?.hostLng} onBlur={(e)=>updateSetting('hostLng', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(/function HostDashboard\(\) \{[\s\S]*?return \([\s\S]*?\}\);?\n\}/, hostDashboardStr);

fs.writeFileSync('src/AdminApp.tsx', code);
