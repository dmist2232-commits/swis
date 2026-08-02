const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf8');

code = code.replace(
`                  {order.lat && order.lng ? (
                    <a href={\`https://www.google.com/maps?q=\${order.lat},\${order.lng}\`} target="_blank" rel="noreferrer" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md whitespace-nowrap flex items-center gap-2 hover:bg-blue-700 transition transform hover:scale-105 animate-bounce">
                      <MapPin size={16} /> View on Map
                    </a>
                  ) : null}`,
`                  {order.lat && order.lng ? (
                    <div className="flex gap-2">
                      <a href={\`https://www.google.com/maps?q=\${order.lat},\${order.lng}\`} target="_blank" rel="noreferrer" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md whitespace-nowrap flex items-center gap-2 hover:bg-blue-700 transition transform hover:scale-105">
                        <MapPin size={16} /> View on Map
                      </a>
                      <a href={\`https://wa.me/?text=\${encodeURIComponent('Order location: https://www.google.com/maps?q=' + order.lat + ',' + order.lng)}\`} target="_blank" rel="noreferrer" className="text-sm bg-green-500 text-white px-4 py-2 rounded-xl shadow-md whitespace-nowrap flex items-center gap-2 hover:bg-green-600 transition transform hover:scale-105">
                        <MessageSquare size={16} /> WhatsApp
                      </a>
                    </div>
                  ) : null}`
);

fs.writeFileSync('src/AdminApp.tsx', code);
