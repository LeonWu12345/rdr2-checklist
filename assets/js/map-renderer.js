(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RDR2MapRenderer = factory();
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  // World coordinates are numbers only. Never allocate a world-sized DOM element,
  // bitmap or transformed layer: the 21617 x 16785 source is drawn in small crops.
  var MAX_PIXELS = 4 * 1024 * 1024;
  var MAX_SIDE = 4096;
  var MAX_CACHE = 48;
  var MAX_REQUESTS = 6;

  function create(canvas, image, version, environment) {
    var env = environment || window;
    // Software 2D avoids repeatedly rasterizing a giant GPU-transformed texture.
    var context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!context) throw new Error("2D map rendering is unavailable");
    var cache = new Map();
    var wanted = [];
    var wantedKeys = new Set();
    var active = 0;
    var frame = null;
    var destroyed = false;
    var sequence = 0;
    var current = null;
    var overview = new env.Image();
    var overviewReady = false;
    var tiles = image.tiles;

    function schedule() {
      if (!destroyed && frame === null) frame = env.requestAnimationFrame(paint);
    }

    function update(view, width, height) {
      if (destroyed || width <= 0 || height <= 0 || view.scale <= 0) return;
      // Copy the view: a queued image callback must never restore an old view.
      current = { x: view.x, y: view.y, scale: view.scale, width: width, height: height };
      schedule();
    }

    function surfaceSize() {
      var ratio = Math.min(env.devicePixelRatio || 1, 2,
        MAX_SIDE / current.width, MAX_SIDE / current.height,
        Math.sqrt(MAX_PIXELS / (current.width * current.height)));
      var width = Math.max(1, Math.floor(current.width * ratio));
      var height = Math.max(1, Math.floor(current.height * ratio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      return Math.min(width / current.width, height / current.height);
    }

    function zoomForScale(ratio) {
      var zoom = Math.ceil(tiles.maxZoom + Math.log(current.scale * ratio) / Math.LN2);
      return Math.max(tiles.minZoom, Math.min(tiles.maxZoom, zoom));
    }

    function visibleTiles(zoom) {
      if (overviewReady && zoom < tiles.detailMinZoom) return [];
      var span = tiles.tileSize * Math.pow(2, tiles.maxZoom - zoom);
      var left = Math.max(0, -current.x / current.scale);
      var top = Math.max(0, -current.y / current.scale);
      var right = Math.min(image.width, (current.width - current.x) / current.scale);
      var bottom = Math.min(image.height, (current.height - current.y) / current.scale);
      if (right <= left || bottom <= top) return [];
      var list = [];
      for (var y = Math.floor(top / span); y < Math.ceil(bottom / span); y += 1) {
        for (var x = Math.floor(left / span); x < Math.ceil(right / span); x += 1) {
          list.push({ key: zoom + ":" + x + ":" + y, zoom: zoom, x: x, y: y, span: span });
        }
      }
      var centerX = (left + right) / (2 * span), centerY = (top + bottom) / (2 * span);
      return list.sort(function (a, b) {
        return Math.hypot(a.x + .5 - centerX, a.y + .5 - centerY) - Math.hypot(b.x + .5 - centerX, b.y + .5 - centerY);
      });
    }

    function drawCrop(bitmap, x, y, width, height) {
      var left = Math.max(0, x, -current.x / current.scale);
      var top = Math.max(0, y, -current.y / current.scale);
      var right = Math.min(image.width, x + width, (current.width - current.x) / current.scale);
      var bottom = Math.min(image.height, y + height, (current.height - current.y) / current.scale);
      if (right <= left || bottom <= top) return;
      var ratioX = canvas.width / current.width, ratioY = canvas.height / current.height;
      // Shared boundaries round to the same device pixel, preventing tile seams.
      var dx = Math.max(0, Math.round((current.x + left * current.scale) * ratioX));
      var dy = Math.max(0, Math.round((current.y + top * current.scale) * ratioY));
      var dr = Math.min(canvas.width, Math.round((current.x + right * current.scale) * ratioX));
      var db = Math.min(canvas.height, Math.round((current.y + bottom * current.scale) * ratioY));
      if (dr <= dx || db <= dy) return;
      var sourceX = bitmap.naturalWidth / width, sourceY = bitmap.naturalHeight / height;
      context.drawImage(bitmap, (left - x) * sourceX, (top - y) * sourceY,
        (right - left) * sourceX, (bottom - top) * sourceY, dx, dy, dr - dx, db - dy);
    }

    function makeRoom() {
      if (cache.size < MAX_CACHE) return true;
      var oldest = null;
      cache.forEach(function (entry) {
        if (entry.state !== "loading" && !wantedKeys.has(entry.key) && (!oldest || entry.used < oldest.used)) oldest = entry;
      });
      if (!oldest) return false;
      cache.delete(oldest.key);
      oldest.bitmap.onload = oldest.bitmap.onerror = null;
      oldest.bitmap.src = "";
      return true;
    }

    function load(entry) {
      var bitmap = new env.Image();
      entry.bitmap = bitmap;
      entry.state = "loading";
      entry.used = sequence;
      cache.set(entry.key, entry);
      active += 1;
      bitmap.onload = function () {
        if (destroyed) return;
        entry.state = "ready";
        active -= 1;
        schedule();
      };
      bitmap.onerror = function () {
        if (destroyed) return;
        entry.state = "error";
        entry.retryAt = Date.now() + 10000;
        active -= 1;
        schedule();
      };
      bitmap.src = tiles.root + "/" + entry.zoom + "/" + entry.y + "/" + entry.x + "." + tiles.extension + "?v=" + version;
    }

    function requestTiles() {
      wanted.forEach(function (tile) {
        var entry = cache.get(tile.key);
        if (entry) entry.used = sequence;
        if (active >= MAX_REQUESTS || (entry && (entry.state !== "error" || Date.now() < entry.retryAt))) return;
        if (!entry && !makeRoom()) return;
        load(tile);
      });
    }

    function paint() {
      frame = null;
      if (destroyed || !current) return;
      var ratio = surfaceSize();
      var zoom = zoomForScale(ratio);
      sequence += 1;
      wanted = visibleTiles(zoom);
      wantedKeys = new Set(wanted.map(function (entry) { return entry.key; }));
      context.fillStyle = "#d9bc8e";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      // Redraw the overview on EVERY frame. Missing/failed/delayed detail images
      // can reduce sharpness, but must never erase the underlying map.
      if (overviewReady) drawCrop(overview, 0, 0, image.width, image.height);
      Array.from(cache.values()).filter(function (entry) {
        return entry.state === "ready" && entry.zoom <= zoom;
      }).sort(function (a, b) { return a.zoom - b.zoom; }).forEach(function (entry) {
        drawCrop(entry.bitmap, entry.x * entry.span, entry.y * entry.span, entry.span, entry.span);
      });
      requestTiles();
    }

    function contextLost(event) { event.preventDefault(); }
    function contextRestored() { schedule(); }
    canvas.addEventListener("contextlost", contextLost);
    canvas.addEventListener("contextrestored", contextRestored);
    overview.onload = function () { if (!destroyed) { overviewReady = true; schedule(); } };
    overview.onerror = function () { if (!destroyed) { overviewReady = false; schedule(); } };
    overview.src = image.overview + "?v=" + version;

    function destroy() {
      destroyed = true;
      if (frame !== null) env.cancelAnimationFrame(frame);
      overview.onload = overview.onerror = null;
      overview.src = "";
      cache.forEach(function (entry) {
        entry.bitmap.onload = entry.bitmap.onerror = null;
        entry.bitmap.src = "";
      });
      cache.clear();
      canvas.removeEventListener("contextlost", contextLost);
      canvas.removeEventListener("contextrestored", contextRestored);
    }

    return { update: update, destroy: destroy };
  }

  return { create: create };
});
