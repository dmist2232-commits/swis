const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`const fsSync = require('fs');
if (!fsSync.existsSync('./data')) {
  fsSync.mkdirSync('./data');
}`,
`import fsSync from 'fs';
if (!fsSync.existsSync('./data')) {
  fsSync.mkdirSync('./data');
}`
);

fs.writeFileSync('server.ts', code);
