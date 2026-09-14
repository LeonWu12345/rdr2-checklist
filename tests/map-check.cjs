const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const here = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');
const html = read('map.html');
const css = read('assets/css/shared.css') + read('assets/css/map.css');
const dataSource = read('assets/js/map-data.js');
const markersSource = read('assets/js/map-markers.js');
const appSource = read('assets/js/map.js');
const rendererSource = read('assets/js/map-renderer.js');
const checklistSource = read('assets/js/checklist.js');
const checklistHtml = read('index.html');

new vm.Script(dataSource, { filename: 'map-data.js' });
new vm.Script(markersSource, { filename: 'map-markers.js' });
new vm.Script(appSource, { filename: 'map.js' });
new vm.Script(rendererSource, { filename: 'map-renderer.js' });

const sandbox = { window: {} };
vm.createContext(sandbox);
new vm.Script(markersSource).runInContext(sandbox);
new vm.Script(dataSource).runInContext(sandbox);
const data = sandbox.window.RDR2MapData;

assert(data && data.version === 5, 'Map data version missing');
assert.equal(data.image.width, 21617, 'Map image width changed');
assert.equal(data.image.height, 16785, 'Map image height changed');
assert.equal(data.image.overview, 'assets/images/rdr2-map-overview.jpg', 'Map overview path changed');
assert(fs.existsSync(path.join(here, data.image.overview)), 'Map overview image missing');
assert(data.image.tiles && data.image.tiles.tileSize === 1024, 'Map tile metadata missing');
assert.equal(data.image.tiles.detailMinZoom, 3, 'Safe detail tile threshold changed');
assert.equal(data.image.tiles.maxZoom, 5, 'Map tile pyramid depth changed');
const tileRoot = path.join(here, data.image.tiles.root);
assert(fs.existsSync(tileRoot), 'Map tile directory missing');
let expectedTiles = 0;
for (let zoom = data.image.tiles.minZoom; zoom <= data.image.tiles.maxZoom; zoom += 1) {
  const span = data.image.tiles.tileSize * (2 ** (data.image.tiles.maxZoom - zoom));
  const columns = Math.ceil(data.image.width / span);
  const rows = Math.ceil(data.image.height / span);
  expectedTiles += columns * rows;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      assert(fs.existsSync(path.join(tileRoot, String(zoom), String(y), `${x}.${data.image.tiles.extension}`)), `Missing map tile ${zoom}/${y}/${x}`);
    }
  }
}
const tileFiles = fs.readdirSync(tileRoot, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.jpg'));
assert.equal(tileFiles.length, expectedTiles, 'Unexpected map tile count');
assert.equal(data.markers.length, 151, 'Verified marker count changed');
assert.equal(data.categories.length, 10, 'Verified marker category count changed');
assert.equal(new Set(data.markers.map((marker) => marker.id)).size, data.markers.length, 'Duplicate map marker ID');
data.markers.forEach((marker) => {
  assert(marker.id && marker.zh && marker.en, `Incomplete marker: ${marker.id || 'unknown'}`);
  assert(marker.x >= 0 && marker.x <= 100 && marker.y >= 0 && marker.y <= 100, `Marker outside map: ${marker.id}`);
});
assert.equal(data.markers.filter((marker) => (marker.sourceIds || []).includes('tk22')).length, 1, 'Crow Beak Trinket must link only to the Elemental Trail endpoint');
assert(html.includes('assets/js/map-markers.js') && html.includes('assets/js/map-data.js') && html.includes('assets/js/map.js'), 'Map scripts missing from page');
assert(html.indexOf('assets/js/map-markers.js') < html.indexOf('assets/js/map-data.js'), 'Verified markers must load before map metadata');
assert(!appSource.includes('rdr2-interactive-map-v1'), 'Map must not create a separate progress store');
assert(appSource.includes('var CHECKLIST_KEY = "rdr2-full-checklist-v2"') && appSource.includes('data-checklist-marker'), 'Map checklist must share the main checklist progress store');
assert(appSource.includes('var COMPENDIUM_KEY = "rdr2-compendium-v1"') && appSource.includes('COMPENDIUM_LINKS'), 'Compendium-backed map items must share the Compendium source of truth');
assert(appSource.includes('pointerdown') && appSource.includes('wheel'), 'Pan or zoom interaction missing');
assert(html.indexOf('assets/js/map-renderer.js') < html.indexOf('assets/js/map.js') && html.includes('assets/js/map-renderer.js'), 'Renderer must load before app');
assert(appSource.includes('<canvas class="map-canvas"') && !appSource.includes('translate3d('), 'World-sized transformed map must not return');
assert(!read('assets/css/map.css').includes('will-change:transform'), 'Map must not force an oversized GPU layer');
assert(rendererSource.includes('?v=" + version'), 'Map tile cache version missing');
assert(appSource.includes('map-search') && appSource.includes('data-category'), 'Map search or category filtering missing');
assert(checklistSource.includes('href="map.html"'), 'Checklist map entry missing');
assert(checklistSource.includes('id="map-preview-expand"'), 'Checklist map preview expansion control missing');
assert(checklistSource.includes("'collapse' : 'expand'") && checklistSource.includes('-50.png'), 'State-aware Icons8 map expansion assets missing from control');
assert(fs.existsSync(path.join(here, 'assets/images/icons8-expand-50.png')), 'Icons8 map expansion asset file missing');
assert(fs.existsSync(path.join(here, 'assets/images/icons8-collapse-50.png')), 'Icons8 map collapse asset file missing');
assert(!checklistSource.includes('位置辅助') && !checklistSource.includes('Location Guide'), 'Obsolete map preview badge remains');
assert(checklistSource.includes('src="map.html?embed=1&amp;compact=1"'), 'Checklist compact embedded map source missing');
assert(checklistSource.includes('rdr2-map-layout') && checklistSource.includes('rdr2-map-focus'), 'Checklist map preview messaging hooks missing');
assert(checklistHtml.includes('assets/js/map-markers.js') && checklistHtml.indexOf('assets/js/map-markers.js') < checklistHtml.indexOf('assets/js/checklist.js'), 'Checklist marker source index must load before checklist interactions');
assert(checklistSource.includes('data-map-marker=') && checklistSource.includes('hasMapMarker(sourceId)'), 'Verified checklist locations must be clickable map targets');
assert(checklistSource.includes("L('地图', 'Map')") && checklistSource.includes("L('在清单中查找地点', 'Locate checklist activities')"), 'Compact map title or description copy is stale');
assert(checklistSource.includes("L('进入地图页', 'Open Map Page')"), 'Map page button copy is stale');
assert(checklistSource.includes('animateMapPreview') && checklistSource.includes('prefers-reduced-motion: reduce'), 'Map expansion animation or reduced-motion fallback missing');
assert(!checklistSource.includes('renderMapDialog'), 'Expanded map must reuse the compact map instead of rendering a second window');
assert(appSource.includes('dataset.embed') && appSource.includes('URLSearchParams'), 'Map embedded mode detection missing');
assert(appSource.includes('rdr2-map-layout') && appSource.includes('rdr2-map-focus'), 'Embedded map message handlers missing');
assert(appSource.includes('(marker.sourceIds || []).indexOf(id)'), 'Checklist item aliases must resolve to shared map markers');
assert(appSource.includes('var filter = ""') && appSource.includes('if (!filter) return []'), 'Standalone map must start with no visible markers');
assert(appSource.includes('return selectedMarker ? [selectedMarker] : []'), 'Embedded map must render only the selected checklist marker');
assert(!appSource.includes('data-category="all"'), 'Standalone map must not default back to every marker category');
assert(appSource.includes('mapIsInteractive()') && appSource.includes('syncEmbeddedInteractionState'), 'Compact map interaction lock missing');
assert(appSource.includes('view.scale = view.fit * Math.pow(2, DATA.image.tiles.maxZoom)') && !appSource.includes('var targetScale = Math.max'), 'Checklist marker focus must use maximum zoom');
assert(!appSource.includes('calibrated locations') && !appSource.includes('Location Guide') && !appSource.includes('First Edition'), 'Removed map labels returned');
assert(appSource.includes('flagIcon(') && appSource.includes('🌙') && appSource.includes('☀️'), 'Map language or theme icon controls missing');
assert(appSource.includes('L("返回", "Back")'), 'Map back button copy is stale');
assert(!markersSource.includes('Use the verified location description in the checklist'), 'Placeholder English collection descriptions remain');
assert(data.markers.filter((marker) => marker.category === 'rock-carvings' || marker.category === 'dinosaur-bones').every((marker) => marker.detailEn && marker.detailEn.length > 35), 'Detailed English rock carving or dinosaur bone descriptions missing');
const checklistCss = read('assets/css/checklist.css');
assert(checklistCss.includes('.map-preview-card.is-expanded') && checklistCss.includes('body.map-preview-lock .split'), 'In-flow map expansion styles missing');
assert(checklistCss.includes('body.map-preview-lock .col-tc>.cat{width:310px;margin-left:auto}'), 'Total completion and Compendium cards must stay compact and align against the checklist');
assert(!checklistCss.includes('100vmax') && !checklistCss.includes('.map-preview-card.is-expanded{position:fixed'), 'Expanded map must not create a fullscreen overlay');
assert(read('assets/css/map.css').includes(':root[data-embed="true"]'), 'Map embedded layout styles missing');
assert(read('assets/css/map.css').includes(':root[data-embed="true"] .map-panel{display:none}'), 'Embedded map must hide the location panel');
assert(read('assets/css/map.css').includes('url("../images/placeholder.png")'), 'Embedded checklist maps must use the requested placeholder pin');
assert(fs.existsSync(path.join(here, 'assets/images/placeholder.png')), 'Placeholder map pin asset file missing');
assert(read('assets/css/map.css').includes(':root[data-embed-view="compact"] .map-viewport{pointer-events:none'), 'Compact map must be non-interactive');
assert(read('assets/css/map.css').includes('.map-categories{flex:0 0 176px;display:grid') && read('assets/css/map.css').includes('overflow-x:hidden'), 'Map categories must keep a stable visible area within the panel');
assert(checklistCss.includes('.map-preview-card:not(.is-expanded) .map-preview-media iframe{pointer-events:none}'), 'Checklist must prevent compact iframe pointer interaction');
const mapInventory = read('docs/map-content-inventory.md');
assert(mapInventory.includes('| 石雕 | 10 |') && mapInventory.includes('| 捕梦网 | 20 |') && mapInventory.includes('| 恐龙骨 | 30 |'), 'Core map inventory collections missing');
assert(mapInventory.includes('`sourceIds`') && mapInventory.includes('`unplaced`') && mapInventory.includes('`verified`'), 'Map marker editor data contract missing');
assert(mapInventory.includes('随机获得') && mapInventory.includes('不重复建点'), 'Map inventory deduplication and no-fake-point rules missing');
assert(css.includes('prefers-reduced-motion') && css.includes('forced-colors'), 'Map accessibility fallbacks missing');

require('./map-renderer-check.cjs');
console.log(`PASS: ${expectedTiles} map tile paths and static integration checks (scripts, storage keys, controls and accessibility rules).`);
