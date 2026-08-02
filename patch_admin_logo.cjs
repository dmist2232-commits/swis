const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf8');

code = code.replace(
`            <div>
              <label className="text-sm text-stone-500 block mb-1">PayHere Merchant ID</label>
              <input type="text" defaultValue={settings?.payHereId} onBlur={(e)=>updateSetting('payHereId', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>`,
`            <div>
              <label className="text-sm text-stone-500 block mb-1">PayHere Merchant ID</label>
              <input type="text" defaultValue={settings?.payHereId} onBlur={(e)=>updateSetting('payHereId', e.target.value)} className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">Custom Logo URL (optional)</label>
              <input type="text" defaultValue={settings?.logoUrl} onBlur={(e)=>updateSetting('logoUrl', e.target.value)} placeholder="https://..." className="w-full p-3 border border-stone-200 rounded-xl"/>
            </div>`
);

fs.writeFileSync('src/AdminApp.tsx', code);
