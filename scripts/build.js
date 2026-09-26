const fs = require('node:fs');
const path = require('node:path');

const output = path.join(__dirname, '..', 'public');
for (const file of ['index.html', 'styles.css', 'data.js', 'app.js', 'images/unmta-logo.png']) {
  if (!fs.existsSync(path.join(output, file))) {
    throw new Error(`Required static site file is missing: public/${file}`);
  }
}
console.log('Static site is ready in public/.');
