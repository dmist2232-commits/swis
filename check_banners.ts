import Database from 'better-sqlite3';
const db = new Database('database.sqlite');
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('banners', '[]')").run();
console.log('banners setting ensured');
