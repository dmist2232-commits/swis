const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`const pool = {
  query: async (text, params = []) => {
    // Replace $1, $2 with ?
    const sqliteText = text.replace(/\\$\\d+/g, '?');
    
    // SQLite doesn't support SERIAL, replace it with INTEGER PRIMARY KEY AUTOINCREMENT
    // Only replacing in CREATE TABLE statements implicitly if needed, but better to do it directly in text
    let modifiedText = sqliteText.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    
    try {
      if (modifiedText.trim().toUpperCase().startsWith('SELECT') || modifiedText.trim().toUpperCase().startsWith('PRAGMA')) {
        const rows = db.prepare(modifiedText).all(...params);
        return { rows };
      } else {
        const result = db.prepare(modifiedText).run(...params);
        return { rows: [], rowCount: result.changes };
      }
    } catch (e) {
      console.error("DB Error:", e);
      throw e;
    }
  },
  on: () => {}
};`,
`const pool = {
  query: async (text, params = []) => {
    const sqliteText = text.replace(/\\$\\d+/g, '?');
    let modifiedText = sqliteText.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    
    try {
      if (params.length === 0 && modifiedText.includes(';\\n')) {
        db.exec(modifiedText);
        return { rows: [], rowCount: 0 };
      }
      
      if (modifiedText.trim().toUpperCase().startsWith('SELECT') || modifiedText.trim().toUpperCase().startsWith('PRAGMA')) {
        const rows = db.prepare(modifiedText).all(...params);
        return { rows };
      } else {
        const result = db.prepare(modifiedText).run(...params);
        return { rows: [], rowCount: result.changes };
      }
    } catch (e) {
      console.error("DB Error with query:", text, e);
      throw e;
    }
  },
  on: () => {}
};`
);

fs.writeFileSync('server.ts', code);
