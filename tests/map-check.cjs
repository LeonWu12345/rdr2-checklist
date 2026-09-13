const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const here = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');
const html = read('map.html');
const css = read('assets/css/shared.css') + read('assets/css/map.css');
const dataSource = read('assets/js/map-data.js');
const appSource = read('assets/js/map.js');
const checklistSource = read('assets/js/checklist.js');

new vm.Script(dataSource, { filename: 'map-data.js' });
new vm.Script(appSource, { filename: 'map.js' });

const sandbox = { window: {} };
vm.createContext(sandbox);
new vm.Script(dataSource).runInContext(sandbox);
const data = sandbox.window.RDR2MapData;

assert(data && data.version === 1, 'Map data version missing');
assert.equal(data.image.src, 'assets/images/rdr2-map.jpg', 'Map image path changed');
assert(fs.existsSync(path.join(here, data.image.src)), 'Map image missing');
assert.equal(data.image.width, 4096, 'Map image width changed');
assert.equal(data.image.height, 3072, 'Map image height changed');
assert(data.markers.length >= 9, 'Initial verified marker set is incomplete');
assert.equal(new Set(data.markers.map((marker) => marker.id)).size, data.markers.length, 'Duplicate map marker ID');
data.markers.forEach((marker) => {
  assert(marker.id && marker.zh && marker.en, `Incomplete marker: ${marker.id || 'unknown'}`);
  assert(marker.x >= 0 && marker.x <= 100 && marker.y >= 0 && marker.y <= 100, `Marker outside map: ${marker.id}`);
});
assert(html.includes('assets/js/map-data.js') && html.includes('assets/js/map.js'), 'Map scripts missing from page');
assert(appSource.includes('rdr2-interactive-map-v1'), 'Map persistence key missing');
assert(appSource.includes('pointerdown') && appSource.includes('wheel'), 'Pan or zoom interaction missing');
assert(appSource.includes('data-status') && appSource.includes('map-search'), 'Map filtering controls missing');
assert(checklistSource.includes('href="map.html"'), 'Checklist map entry missing');
assert(css.includes('prefers-reduced-motion') && css.includes('forced-colors'), 'Map accessibility fallbacks missing');

console.log(`PASS: interactive map shell, ${data.markers.length} verified town markers, local persistence, search, filters, pan, zoom and accessibility fallbacks.`);
