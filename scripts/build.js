const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const output = path.join(__dirname, '..', 'public');
for (const file of ['index.html', 'styles.css', 'data.js', 'app.js', 'images/unmta-logo.png']) {
  if (!fs.existsSync(path.join(output, file))) {
    throw new Error(`Required static site file is missing: public/${file}`);
  }
}

for (const file of ['data.js', 'app.js']) {
  try {
    new vm.Script(fs.readFileSync(path.join(output, file), 'utf8'), { filename: `public/${file}` });
  } catch (error) {
    throw new Error(`JavaScript in public/${file} is invalid: ${error.message}`);
  }
}

const siteWindow = {};
vm.runInNewContext(fs.readFileSync(path.join(output, 'data.js'), 'utf8'), { window: siteWindow });
const data = siteWindow.UNMTA_DATA;
const requiredLists = ['heroImages', 'activities', 'collaborations', 'leadership', 'programs', 'benefits', 'gallery'];
if (!data || requiredLists.some((key) => !Array.isArray(data[key]) || data[key].length === 0)) {
  throw new Error(`public/data.js must define non-empty lists: ${requiredLists.join(', ')}`);
}
if (!data.whatsappNumber || !data.whatsappCommunity || !data.socials?.linkedin || !data.socials?.instagram) {
  throw new Error('public/data.js must define WhatsApp and social contact links.');
}

const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(match[1])) throw new Error(`Page link points to a missing section: #${match[1]}`);
}
for (const match of fs.readFileSync(path.join(output, 'app.js'), 'utf8').matchAll(/\$\('#([^']+)'\)/g)) {
  if (!ids.has(match[1])) throw new Error(`public/app.js expects a missing page element: #${match[1]}`);
}
for (const [key, items] of Object.entries({
  heroImages: data.heroImages,
  activities: data.activities,
  gallery: data.gallery
})) {
  for (const item of items) {
    if (!item.src && !item.image) throw new Error(`An item in public/data.js ${key} is missing its image path.`);
    const imagePath = item.src || item.image;
    if (imagePath.startsWith('/images/') && !fs.existsSync(path.join(output, imagePath.slice(1)))) {
      throw new Error(`Image referenced in public/data.js does not exist: ${imagePath}`);
    }
  }
}

console.log('Static site is ready in public/.');
