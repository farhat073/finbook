import fs from 'fs';
fs.writeFileSync('public/version.json', JSON.stringify({ version: Date.now() }));
console.log('Generated version.json');
