const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const here = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');
const html = read('tools/map-editor/index.html');
const dataSource = read('tools/map-editor/editor-data.js');
const exclusiveSource = read('tools/map-editor/exclusive-data.js');
const cigaretteLocationsSource = read('tools/map-editor/cigarette-locations.js');
const appSource = read('tools/map-editor/editor.js');
const css = read('tools/map-editor/editor.css');

new vm.Script(dataSource, { filename: 'map-editor-data.js' });
new vm.Script(exclusiveSource, { filename: 'map-editor-exclusive-data.js' });
new vm.Script(cigaretteLocationsSource, { filename: 'map-editor-cigarette-locations.js' });
new vm.Script(appSource, { filename: 'map-editor.js' });
const context = { window: {} };
vm.runInNewContext(dataSource, context);
vm.runInNewContext(exclusiveSource, context);
vm.runInNewContext(cigaretteLocationsSource, context);
const data = context.window.RDR2MapEditorData;

assert.equal(data.categories.length, 13, 'Unexpected editor category count');
assert.equal(data.entries.length, 345, 'Unexpected editor entry count');
assert.equal(new Set(data.entries.map((entry) => entry.id)).size, data.entries.length, 'Duplicate editor entry IDs');
assert.equal(data.entries.filter((entry) => entry.category === 'rock-carvings').length, 10, 'Rock carving scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'dreamcatchers').length, 20, 'Dreamcatcher scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'dinosaur-bones').length, 30, 'Dinosaur bone scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'legendary-animals').length, 16, 'Legendary animal scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'legendary-fish').length, 13, 'Legendary fish scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'graves').length, 9, 'Grave scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'hideouts').length, 6, 'Hideout scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'cigarette-cards').length, 144, 'Cigarette card scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'shacks').length, 19, 'Shack scope changed');
assert.equal(data.entries.filter((entry) => entry.category === 'points-of-interest').length, 50, 'Point of interest scope changed');
assert(data.entries.filter((entry) => entry.category === 'points-of-interest').every((entry) => !entry.detailEn.includes('await manual calibration')), 'Point of interest location hint missing');
assert.equal(data.entries.filter((entry) => entry.category === 'cigarette-cards' && entry.sourceIds[0].startsWith('cards-')).length, 144, 'Cigarette cards must link to compendium IDs');
assert.equal(new Set(data.entries.filter((entry) => entry.category === 'cigarette-cards').map((entry) => entry.subgroupId)).size, 12, 'Cigarette card set metadata missing');
assert(data.entries.filter((entry) => entry.category === 'cigarette-cards').every((entry) => entry.detailZh && entry.detailEn && !entry.nameZh.includes('（')), 'Cigarette card bilingual data is incomplete or mixed');
assert.equal(data.entries.filter((entry) => entry.category === 'treasures' && entry.subgroupId).length, 7, 'Treasure submenu metadata missing');
['side-quests', 'camp-activities', 'bounties', 'challenges', 'trapper', 'towns'].forEach((category) => {
  assert(!data.categories.some((item) => item.id === category), `Excluded editor category returned: ${category}`);
});
assert(html.includes('<base href="../../">') && html.includes('map-renderer.js') && html.includes('tools/map-editor/editor-data.js') && html.includes('tools/map-editor/exclusive-data.js') && html.includes('tools/map-editor/cigarette-locations.js') && html.includes('tools/map-editor/editor.js'), 'Editor paths or script order missing');
assert(appSource.includes('rdr2-map-editor-draft-v2'), 'Editor must use isolated draft storage');
assert(!appSource.includes('rdr2-full-checklist-v2') && !appSource.includes('rdr2-interactive-map-v1'), 'Editor must not write checklist or live-map storage');
assert(appSource.includes('rdr2-map-markers-v1') && appSource.includes('exportData') && appSource.includes('importData'), 'Editor import/export contract missing');
assert(appSource.includes('pointPointerMove') && appSource.includes('screenToMap'), 'Marker drag calibration missing');
assert(css.includes('@media(max-width:780px)') && css.includes('@media(max-width:520px)'), 'Editor responsive rules missing');
assert(css.includes('prefers-reduced-motion') && css.includes('forced-colors'), 'Editor accessibility fallbacks missing');
const verified = JSON.parse(read('tools/map-editor/verified-markers.json'));
assert(verified.entries.every((entry) => entry.status === 'verified' && entry.points.length > 0), 'Verified export contains unfinished entries');
assert.equal(verified.entries.flatMap((entry) => entry.points).length, 364, 'Verified coordinate count changed');
const exclusiveIds = new Set(data.entries.filter((entry) => ['cigarette-cards', 'shacks', 'points-of-interest'].includes(entry.category)).map((entry) => entry.id));
assert.equal(verified.entries.filter((entry) => exclusiveIds.has(entry.markerId) && entry.status === 'verified').length, 213, 'Exclusive map entries were not fully calibrated');

console.log(`PASS: map editor has ${data.entries.length} scoped entries, isolated drafts, marker calibration, and JSON import/export.`);
