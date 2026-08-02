const fs = require('fs');
let code = fs.readFileSync('src/CustomerApp.tsx', 'utf8');

code = code.replace(
`<h1 className="text-xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>`,
`{settings?.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" /> : <h1 className="text-xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>}`
);

code = code.replace(
`<h1 className="text-3xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>`,
`{settings?.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" /> : <h1 className="text-3xl font-bold text-red-600">GRAND SPICY සිසාරා</h1>}`
);

fs.writeFileSync('src/CustomerApp.tsx', code);
