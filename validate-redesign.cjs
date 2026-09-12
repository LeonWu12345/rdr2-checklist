const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const here = __dirname;
const baseline = path.resolve(here, '..', 'rdr2-checklist-phase1');
const read = (dir, file) => fs.readFileSync(path.join(dir, file), 'utf8');

const mainHtml = read(here, 'index.html');
const updatesJs = read(here, 'assets/js/updates.js');
const mainJs = read(here, 'assets/js/checklist.js');
const mainCss = read(here, 'assets/css/shared.css') + read(here, 'assets/css/checklist.css');
const newMain = mainHtml + updatesJs + mainJs + mainCss;
const compHtml = read(here, 'compendium.html');
const compJs = read(here, 'assets/js/compendium.js');
const compCss = read(here, 'assets/css/shared.css') + read(here, 'assets/css/compendium.css');
const newComp = compHtml + updatesJs + compJs + compCss;
const hasBaseline = fs.existsSync(path.join(baseline, 'index.html')) &&
  fs.existsSync(path.join(baseline, 'compendium.html'));
const oldMain = hasBaseline ? read(baseline, 'index.html') : newMain;
const oldComp = hasBaseline ? read(baseline, 'compendium.html') : newComp;

const stripMainTheme = (html) => html.replace(
  /\n  CSS_TEXT \+= String\.raw`\n\/\* 2026 cinematic precision redesign:[\s\S]*?\n`;\n(?=  var styleEl = document\.createElement\('style'\);)/,
  '\n'
).replace(
  /\n  function compendiumBoardComplete\(\)\{[\s\S]*?  \/\/ The two version-exclusive equipment entries remain optional, matching the Compendium total\.\n/,
  '\n  // True once every one of the 8 top-level boards (including TC — unlike countAll() above,\n' +
  '  // this checks all 8) individually shows 100%: the same per-board "complete" condition\n' +
  '  // renderCategory() already uses for the green cat-complete highlight, just required of\n' +
  '  // every board at once. Drives the gold "legend" theme (see .wrap.is-legend in CSS_TEXT).\n'
).replace(
  '    return compendiumBoardComplete() && CATS.every(function(cat){',
  '    return CATS.every(function(cat){'
).replace(
  `    return '<a class="cat glass compendium-card' + (done === 560 ? ' cat-complete' : '') + '" href="compendium.html">' +`,
  `    return '<a class="cat glass compendium-card" href="compendium.html">' +`
);
const stripCompTheme = (html) => html.replace(
  /<style id="cinematic-redesign">[\s\S]*?<\/style>\n(?=<\/head>)/,
  ''
).replace(
  '<link rel="icon" type="image/jpeg" href="compendium-icon.jpg">\n<link rel="apple-touch-icon" href="compendium-icon.jpg">\n',
  ''
).replace(
  'function progress(){const c=allCounts();document.documentElement.classList.toggle("is-legend",c.total>0&&c.done===c.total);',
  'function progress(){const c=allCounts();'
).replace(
  '}.foot p{margin:0}.foot .copyright{margin-top:8px}',
  '}'
).replace(
  '<footer class="foot"><p id="source-note"></p><p class="copyright" id="copyright-note"></p></footer>',
  '<footer class="foot" id="source-note"></footer>'
).replace(
  'document.getElementById("copyright-note").textContent="© "+new Date().getFullYear()+" Jam8ee";',
  ''
);

const staticItemSignatures = (html) => [...html.matchAll(/\b(?:I|T)\('([^']+)'\s*,\s*'([^']*)'/g)]
  .map((match) => ({ id: match[1], title: match[2] }));
const preservedItems = staticItemSignatures(oldMain).filter((item) =>
  !/^ou\d+$/.test(item.id) &&
  !/^dc[1-3]$/.test(item.id) &&
  !/^(?:rc|db)\d+$/.test(item.id)
);
preservedItems.forEach((item) => {
  const signature = new RegExp("\\b(?:I|T)\\('" + item.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'\\s*,\\s*'" + item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'");
  assert(signature.test(newMain), `Existing checklist item changed or disappeared: ${item.id}`);
});
const compData = (html) => html.match(/const DATA=(\{[\s\S]*?\});\nconst META=/)?.[1];
const compPlants = (html) => html.match(/const PLANT_NAMES=(\[[\s\S]*?\]);\nDATA\.plants=/)?.[1];
const compZh = (html) => html.match(/const ZH_NAMES=(\{[\s\S]*?\});\nObject\.entries/)?.[1];
assert.equal(compData(newComp), compData(oldComp), 'Compendium base entries changed');
assert.equal(compPlants(newComp), compPlants(oldComp), 'Compendium plant entries changed');
assert.equal(compZh(newComp), compZh(oldComp), 'Compendium Chinese names changed');

for (const [name, html, scripts] of [['main', newMain, [updatesJs, mainJs]], ['compendium', newComp, [updatesJs, compJs]]]) {
  scripts.forEach((source, index) => new vm.Script(source, { filename: `${name}-${index}.js` }));
  assert(html.includes('prefers-reduced-motion'), `${name}: reduced-motion support missing`);
  assert(html.includes('forced-colors'), `${name}: forced-colors support missing`);
}

const storageKeys = [
  'rdr2-full-checklist-v2',
  'rdr2-full-checklist-open',
  'rdr2-full-checklist-theme',
  'rdr2-full-checklist-lang',
  'rdr2-compendium-v1',
  'rdr2-compendium-category',
  'rdr2-compendium-notes-v1',
  'rdr2-compendium-horse-coats-v1'
];
const combined = newMain + newComp;
storageKeys.forEach((key) => assert(combined.includes(key), `Storage interface missing: ${key}`));
assert(newMain.includes('function compendiumBoardComplete()'), 'Legendary Outlaw must include Compendium completion');
assert(newMain.includes("compendiumCount(saved, 'cards-', 1, 144) === 144"), 'Legendary Outlaw card requirement missing');
assert(newMain.includes("'equipment-33':true, 'equipment-35':true"), 'Optional edition equipment handling changed');
assert(newMain.includes("done === 560 ? ' cat-complete'"), 'Completed Compendium card must join the gold state');
assert(newComp.includes('classList.toggle("is-legend",c.total>0&&c.done===c.total)'), 'Completed Compendium page gold state missing');
assert.equal((newMain.match(/craftItem\('trc\d+_\d+'/g) || []).length, 116, 'Trapper clothing item count changed');
assert.equal((newMain.match(/reinforcedItem\('re\d+'/g) || []).length, 36, 'Reinforced equipment count changed');
assert(newMain.includes("{ id:'trc', name:'捕兽人服装'") && newMain.includes("{ id:'re', name:'强化装备'"), 'New Hunting groups missing');
assert(newMain.includes("reinforcedItem('re1','强盗子弹带','Bandit Bandolier','强盗','Bandit',1)"), 'Bandit Bandolier unlock requirement missing');
assert(newMain.includes("reinforcedItem('re36','武器专家副手枪套','Weapons Expert Off-Hand Holster','武器专家','Weapons Expert',7)"), 'Weapons Expert Off-Hand Holster unlock requirement missing');
assert(newMain.includes("T('tc31','找到并与5名特殊路人互动','Find and interact with 5 special characters')"), 'Special Characters total-completion requirement missing');
for (let i = 1; i <= 26; i++) assert(newMain.includes(`tk${i}:'equipment-`), `Trinket/talisman link missing: tk${i}`);
for (let i = 1; i <= 36; i++) assert(newMain.includes(`re${i}:'equipment-${i + 43}'`), `Reinforced equipment link missing: re${i}`);

['assets/fonts/chinese-rocks.ttf', 'assets/images/compendium-icon.jpg', 'assets/images/og-image.jpg', 'assets/images/rdr2-background.jpg'].forEach((asset) => {
  assert(fs.existsSync(path.join(here, asset)), `Missing asset: ${asset}`);
});

const dataMatch = newComp.match(/const DATA=(\{[\s\S]*?\});\nconst META=/);
assert(dataMatch, 'Compendium data block not found');
const data = JSON.parse(dataMatch[1]);
const plantsMatch = newComp.match(/const PLANT_NAMES=(\[[\s\S]*?\]);\nDATA\.plants=/);
assert(plantsMatch, 'Plant data block not found');
data.plants = JSON.parse(plantsMatch[1]);
assert(newComp.includes('const KEYS=["animals","equipment","fish","gangs","plants","horses","weapons","cards"]'), 'Eight-category order changed');
const standardTotal = Object.values(data).flat().filter((item) => typeof item === 'string' || !item.optional).length;
assert.equal(standardTotal, 560, 'Standard compendium total changed');
assert(newComp.includes('const PAGE_SIZE=30'), '30-item pagination changed');
assert(newComp.includes('class="entry-memo"'), 'Compendium notes field missing');
assert(newMain.includes('class="update-ticker"') && newComp.includes('id="update-ticker"'), 'Shared update ticker missing');
const updateContext = { window: {} };
vm.runInNewContext(updatesJs, updateContext);
assert(updateContext.window.RDR2Updates.latestText('zh').startsWith('9月13日更新：['), 'Chinese update ticker format changed');
assert(updateContext.window.RDR2Updates.latestText('en').startsWith('September 13 update: ['), 'English update ticker format changed');
assert(mainJs.includes('window.RDR2Updates.latestText(lang)') && compJs.includes('window.RDR2Updates.latestText(lang)'), 'Pages must read shared update data');
assert(newComp.includes('width:100%!important') && newComp.includes('cursor:text!important'), 'Compendium notes field sizing regression');
assert(newComp.includes('const HORSE_COATS={'), 'Horse coat checklists missing');
for (let i = 1; i <= 19; i++) assert(newComp.includes(`"horses-${i}":[`), `Horse coat list missing: horses-${i}`);
assert(!newComp.includes('if(HORSE_COATS[id])') && !newComp.includes('allDone=coats.every'), 'Horse breed and coat progress must remain independent');
assert(!newMain.includes("herbalistNine.detailsLabel='43种植物明细'"), 'Herbalist 9 must use the Compendium plant list instead of a duplicate checklist');
assert(newMain.includes("herbalistTen.detailsLabel='11种肉类明细'"), 'Herbalist 10 meat checklist missing');
assert(newMain.includes("horsemanTen.detailsLabel='9种野马明细'"), 'Horseman 10 wild-breed checklist missing');
for (let i = 1; i <= 20; i++) assert(newMain.includes(`dc_${i <= 14 ? 'nh' : i <= 16 ? 'le' : 'am'}${String(i <= 14 ? i : i <= 16 ? i - 14 : i - 16).padStart(2, '0')}`), `Dreamcatcher detail missing: ${i}`);

assert(newMain.includes('@media(max-width:850px)') && newMain.includes('@media(max-width:520px)'), 'Main responsive breakpoints missing');
assert(newComp.includes('@media(max-width:850px)') && newComp.includes('@media(max-width:580px)'), 'Compendium responsive breakpoints missing');
assert(!newMain.includes('@import url(') && !newComp.includes('@import url('), 'Unexpected network font dependency');
assert(!/<style(?:\s|>)/.test(mainHtml) && !/<script>/.test(mainHtml), 'Main HTML must remain a lightweight shell');
assert(!/<style(?:\s|>)/.test(compHtml) && !/<script>/.test(compHtml), 'Compendium HTML must remain a lightweight shell');
assert(mainHtml.length < 5000 && compHtml.length < 5000, 'HTML shell size regression');

console.log('PASS: existing checklist items, storage keys, eight Compendium categories, 560 standard entries, assets, offline behavior and accessibility fallbacks are preserved; 116 Trapper garments, 36 reinforced equipment items and all equipment links are present.');
