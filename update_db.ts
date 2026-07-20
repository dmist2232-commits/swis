import Database from 'better-sqlite3';
const db = new Database('database.sqlite');
db.prepare("UPDATE settings SET value = '200732503140' WHERE key = 'adminPassword'").run();
db.prepare("UPDATE settings SET value = '132333435363' WHERE key = 'hostPassword'").run();
console.log('updated');
