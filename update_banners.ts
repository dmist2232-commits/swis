import fs from 'fs';
const content = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

const bannersView = `
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
`;

const updatedContent = content.replace('export default function AdminApp', bannersView + '\nexport default function AdminApp');
fs.writeFileSync('src/AdminApp.tsx', updatedContent);
