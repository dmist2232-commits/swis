const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`const db = new Database('database.sqlite');`,
`const fsSync = require('fs');
if (!fsSync.existsSync('./data')) {
  fsSync.mkdirSync('./data');
}
const db = new Database('./data/database.sqlite');`
);

fs.writeFileSync('server.ts', code);
