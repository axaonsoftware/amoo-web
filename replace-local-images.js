const fs = require('fs');
const path = require('path');
const glob = require('glob');

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'cloudinary-map.json'), 'utf8'));

// Files to scan (only frontend and backend seed.js)
const patterns = [
  'amoo-web/app/**/*.{tsx,jsx,ts,js}',
  'amoo-backend/src/seed.js',
];

let totalReplacements = 0;
const changedFiles = new Set();

for (const pattern of patterns) {
  const files = glob.sync(pattern, { cwd: __dirname, nodir: true });
  for (const relFile of files) {
    const filePath = path.join(__dirname, relFile);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [localPath, cloudUrl] of Object.entries(mapping)) {
      // Match the local path as it appears in source (with / prefix)
      const searchStr = '/' + localPath.replace(/\\/g, '/');
      // Escape special regex chars
      const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      content = content.replace(regex, cloudUrl);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      const count = (original.match(/\//g) || []).length - (content.match(/\//g) || []).length;
      changedFiles.add(relFile);
      totalReplacements++;
      console.log(`Updated: ${relFile}`);
    }
  }
}

console.log(`\nDone! ${totalReplacements} files updated.`);
console.log('Changed files:');
for (const f of changedFiles) {
  console.log(`  - ${f}`);
}