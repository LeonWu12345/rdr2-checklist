// Deterministic image/RAF tests of the production renderer; no browser or package
// dependency. These verify drawing geometry and races, not a GPU driver's output.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const renderer = require('../assets/js/map-renderer.js');
const image = {
  width: 21617, height: 16785, overview: 'assets/images/rdr2-map-overview.jpg',
  tiles: { root: 'assets/map-tiles', tileSize: 1024, minZoom: 0, detailMinZoom: 3, maxZoom: 5, extension: 'jpg' }
};

function harness(dpr = 1) {
  const bitmaps = [], frames = new Map(), draws = [], fills = [], events = {};
  let nextFrame = 0, maxPending = 0, maxRetained = 0;
  class Bitmap {
    constructor() { bitmaps.push(this); }
    set src(value) {
      this.url = value;
      this.pending = !!value;
      if (value) {
        const file = path.resolve(__dirname, '..', value.split('?')[0]);
        assert(fs.existsSync(file), `Renderer requested a nonexistent image: ${value}`);
        this.naturalWidth = value.includes('overview') ? 1600 : 1024;
        this.naturalHeight = value.includes('overview') ? 1242 : 1024;
      }
      maxPending = Math.max(maxPending, bitmaps.filter(b => b.pending && !b.url.includes('overview')).length);
      maxRetained = Math.max(maxRetained, bitmaps.filter(b => b.url && !b.url.includes('overview')).length);
    }
    get src() { return this.url; }
    finish(failed = false) {
      assert(this.pending, 'Cannot finish an image twice');
      this.pending = false;
      if (failed) this.onerror?.(); else this.onload?.();
    }
  }
  const canvas = {
    width: 300, height: 150,
    getContext(type, options) {
      assert.equal(type, '2d');
      assert.deepEqual(options, { alpha: false, willReadFrequently: true });
      return {
        fillRect(...args) { fills.push(args); draws.length = 0; },
        drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh) {
          [sx, sy, sw, sh, dx, dy, dw, dh].forEach(n => assert(Number.isFinite(n), 'Invalid draw coordinate'));
          assert(sw > 0 && sh > 0 && dw > 0 && dh > 0);
          assert(sx >= -1e-8 && sy >= -1e-8);
          assert(sx + sw <= bitmap.naturalWidth + 1e-8 && sy + sh <= bitmap.naturalHeight + 1e-8, 'Source crop exceeds image');
          assert(dx >= 0 && dy >= 0 && dx + dw <= canvas.width && dy + dh <= canvas.height, 'Drawing escaped the viewport');
          draws.push({ url: bitmap.src, sx, sy, sw, sh, dx, dy, dw, dh });
        }
      };
    },
    addEventListener(name, fn) { events[name] = fn; },
    removeEventListener(name) { delete events[name]; }
  };
  const env = {
    Image: Bitmap, devicePixelRatio: dpr,
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); }
  };
  const app = renderer.create(canvas, image, 4, env);
  const flush = () => {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach(fn => fn());
    assert(frames.size <= 1, 'More than one queued repaint');
    assert(canvas.width * canvas.height <= 4 * 1024 * 1024, 'Backing surface exceeded 4 MP');
    assert(canvas.width <= 4096 && canvas.height <= 4096, 'Oversized raster side');
  };
  const settle = () => {
    for (let i = 0; i < 100; i++) {
      const pending = bitmaps.filter(b => b.pending);
      pending.reverse().forEach(b => b.finish());
      flush();
      if (!frames.size && !bitmaps.some(b => b.pending)) return;
    }
    assert.fail('Renderer did not become idle');
  };
  return { app, canvas, draws, fills, bitmaps, events, frames, flush, settle,
    pending: () => bitmaps.filter(b => b.pending),
    limits: () => ({ maxPending, maxRetained }) };
}

const fitView = (width, height) => {
  const scale = Math.min(width / image.width, height / image.height);
  return { scale, x: (width - image.width * scale) / 2, y: (height - image.height * scale) / 2 };
};

// Old load callbacks arrive AFTER zooming back out. They must not reintroduce
// their old view, and the full overview must remain identical to the baseline.
{
  const h = harness();
  const fit = fitView(1280, 800);
  h.app.update(fit, 1280, 800);
  h.bitmaps[0].finish();
  h.flush();
  const baseline = structuredClone(h.draws);
  assert.equal(baseline.length, 1);
  assert(baseline[0].url.includes('overview'));
  const mutableView = { x: -9000, y: -7000, scale: 1 };
  h.app.update(mutableView, 1280, 800);
  mutableView.scale = 100; // Callers cannot mutate a queued render's snapshot.
  h.flush();
  const delayed = h.pending();
  assert(delayed.length > 0);
  h.app.update(fit, 1280, 800);
  h.flush();
  delayed.reverse().forEach(b => b.finish());
  h.flush();
  assert.deepEqual(h.draws, baseline, 'Zoom-out must recover the exact overview');
  const oldOnload = delayed[0].onload;
  h.app.destroy();
  oldOnload();
  assert.equal(h.frames.size, 0, 'Destroyed renderer was resurrected by an image callback');
  assert.equal(Object.keys(h.events).length, 0);
}

// Image failure leaves the overview in place and must not trigger a retry loop.
{
  const h = harness();
  h.bitmaps[0].finish();
  h.app.update({ x: -9000, y: -7000, scale: 1 }, 1280, 800);
  h.flush();
  h.pending().forEach(b => b.finish(true));
  h.flush();
  assert(h.draws[0].url.includes('overview'));
  const requests = h.bitmaps.length;
  h.app.update({ x: -9000, y: -7000, scale: 1 }, 1280, 800);
  h.flush();
  assert.equal(h.bitmaps.length, requests, 'Failed images were requested in a tight loop');
  h.events.contextrestored();
  h.flush();
  assert(h.draws[0].url.includes('overview'), 'Context restoration did not redraw map');
  h.app.destroy();
}

// If the preview is unavailable, the low-zoom tile pyramid still paints a map.
{
  const h = harness();
  h.bitmaps[0].finish(true);
  h.app.update(fitView(375, 640), 375, 640);
  h.flush(); h.settle();
  assert(h.draws.length > 0 && h.draws.every(d => d.url.includes('map-tiles/')));
  h.app.destroy();
}

// Repeated fit/detail/edge/pan cycles at mobile, desktop and high-DPI sizes.
// Every requested filename is checked on disk by the fake Image constructor.
let cycles = 0;
for (const [width, height, dpr] of [[319, 580, 1], [375, 640, 2], [768, 700, 2], [1280, 800, 1], [1920, 1080, 2], [10000, 4000, 3]]) {
  const h = harness(dpr);
  h.bitmaps[0].finish();
  for (let cycle = 0; cycle < 20; cycle++) {
    const scale = [.12499, .12501, .24999, .25001, .49999, .50001, 1][cycle % 7];
    const x = -(image.width * scale - width) * ((cycle % 5) / 4);
    const y = -(image.height * scale - height) * ((cycle % 4) / 3);
    h.app.update({ x, y, scale }, width, height);
    h.flush(); h.settle();
    assert(h.draws[0].url.includes('overview'));
    h.app.update(fitView(width, height), width, height);
    h.flush(); h.settle();
    assert(h.draws[0].url.includes('overview'));
    cycles++;
  }
  assert(h.limits().maxPending <= 6, 'Unbounded parallel image requests');
  assert(h.limits().maxRetained <= 48, 'Unbounded decoded tile cache');
  h.app.destroy();
}
console.log(`PASS: renderer ${cycles} zoom/pan cycles, bounded crops/cache/requests, delayed and failed images, overview fallback, teardown and context restoration.`);
