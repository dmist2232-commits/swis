const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`      await pool.query("UPDATE settings SET value = '1000' WHERE key = 'lastOrderNumber'");
    }`,
`      await pool.query("UPDATE settings SET value = '1000' WHERE key = 'lastOrderNumber'");
      await pool.query("DELETE FROM orders WHERE status = 'delivered' OR status = 'cancelled' OR status = 'rejected'");
    }`
);

fs.writeFileSync('server.ts', code);
