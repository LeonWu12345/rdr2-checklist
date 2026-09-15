const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..', '..');
const rawPath = path.join(__dirname, 'verified-markers.json');
const catalogPath = path.join(__dirname, 'editor-data.js');
const exclusivePath = path.join(__dirname, 'exclusive-data.js');
const cigaretteLocationsPath = path.join(__dirname, 'cigarette-locations.js');
const outputPath = path.join(repo, 'assets', 'js', 'map-markers.js');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(catalogPath, 'utf8'), context, { filename: catalogPath });
vm.runInNewContext(fs.readFileSync(exclusivePath, 'utf8'), context, { filename: exclusivePath });
vm.runInNewContext(fs.readFileSync(cigaretteLocationsPath, 'utf8'), context, { filename: cigaretteLocationsPath });
const catalog = context.window.RDR2MapEditorData;
const metadata = new Map(catalog.entries.map((entry) => [entry.id, entry]));

if (raw.schema !== 'rdr2-map-markers-v1') throw new Error('Unsupported marker export schema');
if (!raw.baseImage || raw.baseImage.width !== 21617 || raw.baseImage.height !== 16785) throw new Error('Marker export uses a different base image');
const markers = [];
raw.entries.forEach((record) => {
  const meta = metadata.get(record.markerId);
  if (!meta) throw new Error(`Unknown marker entry: ${record.markerId}`);
  if (record.status !== 'verified' || !Array.isArray(record.points) || !record.points.length) return;
  record.points.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) throw new Error(`Invalid coordinate: ${record.markerId}`);
    const multi = record.points.length > 1;
    const sourceIds = meta.sourceIds.filter((sourceId) => sourceId !== 'tk22' || index === record.points.length - 1);
    markers.push({
      id: index === 0 ? record.markerId : `${record.markerId}-p${index + 1}`,
      groupId: record.markerId,
      pointIndex: index + 1,
      pointCount: record.points.length,
      category: meta.category,
      zh: multi ? `${meta.nameZh} · 地点 ${index + 1}` : meta.nameZh,
      en: multi ? `${meta.nameEn} - Point ${index + 1}` : meta.nameEn,
      detailZh: meta.detailZh || '',
      detailEn: meta.detailEn || '',
      x: Number(point.x.toFixed(6)),
      y: Number(point.y.toFixed(6)),
      sourceIds,
      chapterTags: meta.chapterTags.slice(),
      subgroupId: meta.subgroupId || '',
      subgroupZh: meta.subgroupZh || '',
      subgroupEn: meta.subgroupEn || ''
    });
  });
});

const visibleCategories = new Set(markers.map((marker) => marker.category));
const categories = catalog.categories.filter((category) => visibleCategories.has(category.id));

const generated = `(function () {\n  "use strict";\n  window.RDR2VerifiedMapMarkers = ${JSON.stringify({ version: 1, categories, markers }, null, 2)};\n})();\n`;
fs.writeFileSync(outputPath, generated, 'utf8');
console.log(`Generated ${markers.length} verified markers from ${raw.entries.length} imported editor records.`);
