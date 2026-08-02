const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fallbackCode = `
// Fallback In-Memory State for Preview Environment
let inMemoryState = {
  settings: {
    adminPassword: '200732503140',
    hostPassword: '132333435363',
    currentEvent: '',
    perKmRate: '100',
    firstKmRate: '150',
    shopPhone: '0112345678',
    payHereId: '',
    hostLat: '7.1652',
    hostLng: '80.0573',
    lastOrderNumber: '1000',
    banners: '[]',
    lastOrderDate: new Date().toISOString().split('T')[0]
  },
  menu_items: [],
  orders: [],
  feedbacks: []
};
let isDbConnected = false;
`;

code = code.replace('// Simple Schema Setup', fallbackCode + '\n// Simple Schema Setup');

const initDbRepl = `
const initDb = async (retries = 1) => {
  while (retries) {
    try {
      await pool.query('SELECT 1'); // Test connection
      isDbConnected = true;
`;
code = code.replace('const initDb = async (retries = 1) => {\n  while (retries) {\n    try {\n      await pool.query(\'SELECT 1\'); // Test connection', initDbRepl);

fs.writeFileSync('server.ts', code);
