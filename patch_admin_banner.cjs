const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf8');

code = code.replace(
`placeholder="Image URL"`,
`placeholder="Image or Video URL"`
);

fs.writeFileSync('src/AdminApp.tsx', code);
