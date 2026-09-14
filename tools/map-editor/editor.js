(function () {
  "use strict";

  var DATA = window.RDR2MapEditorData;
  var MAP = window.RDR2MapData;
  var STORAGE_KEY = "rdr2-map-editor-draft-v2";
  var root = document.getElementById("map-editor-root");
  var draft = loadDraft();
  var selectedEntryId = DATA.entries[0] ? DATA.entries[0].id : "";
  var selectedPointId = "";
  var categoryFilter = "all";
  var statusFilter = "all";
  var query = "";
  var lang = "zh";
  var placementArmed = false;
  var view = { scale: 1, fit: 1, x: 0, y: 0 };
  var renderer = null;
  var drag = null;
  var pointDrag = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function L(zh, en) { return lang === "en" ? en : zh; }
  function entryName(entry) { return lang === "en" ? entry.nameEn : entry.nameZh; }
  function entryDetail(entry) { return lang === "en" ? entry.detailEn : entry.detailZh; }
  function categoryName(category) { return lang === "en" ? category.en : category.zh; }

  function loadDraft() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && parsed.entries && typeof parsed.entries === "object" ? parsed : { version: 1, entries: {} };
    } catch (error) { return { version: 1, entries: {} }; }
  }

  function saveDraft() {
    draft.version = 1;
    draft.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch (error) {}
  }

  function entryState(id) {
    if (!draft.entries[id]) draft.entries[id] = { points: [], verified: false, note: "" };
    var state = draft.entries[id];
    if (!Array.isArray(state.points)) state.points = [];
    return state;
  }

  function entryStatus(entry) {
    var state = entryState(entry.id);
    if (state.verified && state.points.length) return "verified";
    if (state.points.length) return "draft";
    return "unplaced";
  }

  function getEntry(id) { return DATA.entries.find(function (entry) { return entry.id === id; }); }
  function getCategory(id) { return DATA.categories.find(function (category) { return category.id === id; }); }

  function filteredEntries() {
    var needle = query.trim().toLocaleLowerCase();
    return DATA.entries.filter(function (entry) {
      if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
      if (statusFilter !== "all" && entryStatus(entry) !== statusFilter) return false;
      if (!needle) return true;
      return [entry.id, entry.nameZh, entry.nameEn, entry.detailZh, entry.detailEn, entry.sourceIds.join(" ")].join(" ").toLocaleLowerCase().indexOf(needle) !== -1;
    });
  }

  function statusLabel(status) {
    return status === "verified" ? L("已确认", "Verified") : status === "draft" ? L("草稿", "Draft") : L("未标点", "Unplaced");
  }

  function renderShell() {
    root.innerHTML =
      '<main class="editor-page">' +
        '<header class="editor-topbar"><div class="editor-brand"><span class="editor-brand-mark">✣</span><div><p>' + L("内部工具", "Internal Tool") + '</p><h1>' + L("地图标点编辑器", "Map Marker Editor") + '</h1></div></div>' +
          '<div class="editor-progress" id="editor-progress"></div>' +
          '<div class="editor-actions"><button id="lang-toggle" type="button">' + (lang === "zh" ? "EN" : "中文") + '</button><label class="editor-file-button">' + L("导入", "Import") + '<input id="import-file" type="file" accept="application/json"></label><button id="export-data" class="is-primary" type="button">' + L("导出 JSON", "Export JSON") + '</button><a href="map.html">' + L("返回地图", "Map") + '</a></div></header>' +
        '<section class="editor-workspace">' +
          '<aside class="editor-list-panel"><div class="editor-list-head"><label><span>' + L("搜索条目", "Search entries") + '</span><input id="editor-search" type="search" autocomplete="off" placeholder="' + L("名称、ID或位置提示", "Name, ID, or location") + '"></label>' +
            '<div class="editor-status-filter" id="status-filters"></div></div><div class="editor-categories" id="editor-categories"></div><div class="editor-list" id="editor-list"></div></aside>' +
          '<section class="editor-map-stage"><div class="editor-map-viewport" id="editor-map-viewport" tabindex="0" aria-label="' + L("可缩放与拖动的标点底图", "Zoomable marker placement map") + '"><canvas id="editor-map-canvas" aria-hidden="true"></canvas><div class="editor-marker-layer" id="editor-marker-layer"></div><div class="placement-hint" id="placement-hint" hidden></div></div>' +
            '<div class="editor-map-controls"><button id="zoom-in" type="button" aria-label="' + L("放大", "Zoom in") + '">+</button><button id="zoom-out" type="button" aria-label="' + L("缩小", "Zoom out") + '">−</button><button id="reset-view" type="button" aria-label="' + L("重置视图", "Reset view") + '">⌂</button></div><output class="editor-coordinates" id="cursor-coordinates">x — · y —</output></section>' +
          '<aside class="editor-inspector" id="editor-inspector"></aside>' +
        '</section><footer class="editor-foot"><span>' + L("草稿只保存在此浏览器，不会修改正式地图。", "Drafts stay in this browser and never modify the live map.") + '</span><span>' + L("底图：", "Base map: ") + escapeHtml(MAP.image.credit) + '</span></footer>' +
      '</main>';

    renderer = window.RDR2MapRenderer.create(document.getElementById("editor-map-canvas"), MAP.image, MAP.version);
    bindShell();
    renderAllPanels();
    requestAnimationFrame(resetView);
  }

  function bindShell() {
    document.getElementById("lang-toggle").addEventListener("click", function () { lang = lang === "zh" ? "en" : "zh"; if (renderer) renderer.destroy(); renderShell(); });
    document.getElementById("editor-search").addEventListener("input", function (event) { query = event.target.value; renderList(); });
    document.getElementById("export-data").addEventListener("click", exportData);
    document.getElementById("import-file").addEventListener("change", importData);
    document.getElementById("zoom-in").addEventListener("click", function () { zoomAt(1.32); });
    document.getElementById("zoom-out").addEventListener("click", function () { zoomAt(1 / 1.32); });
    document.getElementById("reset-view").addEventListener("click", resetView);
    var viewport = document.getElementById("editor-map-viewport");
    viewport.addEventListener("wheel", function (event) { event.preventDefault(); var rect = viewport.getBoundingClientRect(); zoomAt(event.deltaY < 0 ? 1.18 : 1 / 1.18, event.clientX - rect.left, event.clientY - rect.top); }, { passive: false });
    viewport.addEventListener("pointerdown", mapPointerDown);
    viewport.addEventListener("pointermove", mapPointerMove);
    viewport.addEventListener("pointerup", mapPointerUp);
    viewport.addEventListener("pointercancel", mapPointerUp);
    viewport.addEventListener("click", placePointFromClick);
    viewport.addEventListener("mousemove", showCursorCoordinates);
    viewport.addEventListener("mouseleave", function () { document.getElementById("cursor-coordinates").textContent = "x — · y —"; });
    viewport.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && placementArmed) { placementArmed = false; renderInspector(); renderPlacementHint(); }
      if ((event.key === "+" || event.key === "=") && !event.ctrlKey) zoomAt(1.25);
      else if (event.key === "-") zoomAt(.8);
      else if (event.key === "0") resetView();
    });
    window.onresize = function () { clampView(); applyView(); };
  }

  function renderAllPanels() {
    renderProgress(); renderStatusFilters(); renderCategories(); renderList(); renderInspector(); renderMarkers(); renderPlacementHint();
  }

  function renderProgress() {
    var verified = DATA.entries.filter(function (entry) { return entryStatus(entry) === "verified"; }).length;
    var draftCount = DATA.entries.filter(function (entry) { return entryStatus(entry) === "draft"; }).length;
    document.getElementById("editor-progress").innerHTML = '<strong>' + verified + ' / ' + DATA.entries.length + '</strong><span>' + L("已确认", "verified") + ' · ' + draftCount + ' ' + L("项草稿", "draft") + '</span>';
  }

  function renderStatusFilters() {
    var host = document.getElementById("status-filters");
    host.innerHTML = ["all", "unplaced", "draft", "verified"].map(function (status) {
      var label = status === "all" ? L("全部", "All") : statusLabel(status);
      return '<button type="button" data-status="' + status + '" class="' + (statusFilter === status ? "is-active" : "") + '">' + label + '</button>';
    }).join("");
    host.querySelectorAll("[data-status]").forEach(function (button) { button.addEventListener("click", function () { statusFilter = button.dataset.status; renderStatusFilters(); renderList(); }); });
  }

  function renderCategories() {
    var host = document.getElementById("editor-categories");
    var categories = [{ id: "all", zh: "全部类别", en: "All Categories" }].concat(DATA.categories);
    host.innerHTML = categories.map(function (category) {
      var count = category.id === "all" ? DATA.entries.length : DATA.entries.filter(function (entry) { return entry.category === category.id; }).length;
      return '<button type="button" data-category="' + category.id + '" class="' + (categoryFilter === category.id ? "is-active" : "") + '"><span>' + escapeHtml(categoryName(category)) + '</span><small>' + count + '</small></button>';
    }).join("");
    host.querySelectorAll("[data-category]").forEach(function (button) { button.addEventListener("click", function () { categoryFilter = button.dataset.category; renderCategories(); renderList(); renderMarkers(); }); });
  }

  function renderList() {
    var host = document.getElementById("editor-list");
    var entries = filteredEntries();
    if (!entries.length) { host.innerHTML = '<p class="editor-empty">' + L("没有符合条件的条目", "No matching entries") + '</p>'; return; }
    host.innerHTML = entries.map(function (entry) {
      var state = entryState(entry.id), status = entryStatus(entry);
      return '<button type="button" class="editor-entry ' + (selectedEntryId === entry.id ? "is-selected " : "") + 'is-' + status + '" data-entry="' + entry.id + '"><span class="entry-status-dot"></span><span class="entry-copy"><strong>' + escapeHtml(entryName(entry)) + '</strong><small>' + escapeHtml(entry.id) + ' · ' + state.points.length + ' ' + L("个坐标", "points") + '</small></span><span class="entry-status-label">' + statusLabel(status) + '</span></button>';
    }).join("");
    host.querySelectorAll("[data-entry]").forEach(function (button) { button.addEventListener("click", function () { selectEntry(button.dataset.entry); }); });
  }

  function selectEntry(id) {
    selectedEntryId = id; selectedPointId = ""; placementArmed = false;
    var points = entryState(id).points;
    if (points.length) { selectedPointId = points[0].id; centerPoint(points[0]); }
    renderList(); renderInspector(); renderMarkers(); renderPlacementHint();
  }

  function renderInspector() {
    var host = document.getElementById("editor-inspector");
    var entry = getEntry(selectedEntryId);
    if (!entry) { host.innerHTML = '<p class="editor-empty">' + L("选择一个条目开始标点", "Select an entry to begin") + '</p>'; return; }
    var state = entryState(entry.id), status = entryStatus(entry), category = getCategory(entry.category);
    host.innerHTML = '<div class="inspector-head"><p>' + escapeHtml(categoryName(category)) + '</p><h2>' + escapeHtml(entryName(entry)) + '</h2><span class="inspector-id">' + escapeHtml(entry.id) + '</span></div>' +
      '<div class="inspector-body"><section><h3>' + L("位置提示", "Location hint") + '</h3><p>' + escapeHtml(entryDetail(entry) || L("暂无位置文字，请对照清单或可靠指南。", "No location text; use the checklist or a trusted guide.")) + '</p></section>' +
      '<section><h3>' + L("关联条目", "Linked entries") + '</h3><div class="source-ids">' + entry.sourceIds.map(function (id) { return '<code>' + escapeHtml(id) + '</code>'; }).join("") + '</div></section>' +
      '<section><div class="section-title-row"><h3>' + L("坐标", "Coordinates") + '</h3><span>' + state.points.length + '</span></div><div class="point-list">' + (state.points.length ? state.points.map(function (point, index) {
        return '<button type="button" class="point-row ' + (selectedPointId === point.id ? "is-selected" : "") + '" data-point="' + point.id + '"><strong>' + L("点 ", "Point ") + (index + 1) + '</strong><code>' + point.x.toFixed(5) + ', ' + point.y.toFixed(5) + '</code></button>';
      }).join("") : '<p class="no-points">' + L("尚未放置坐标", "No coordinates placed") + '</p>') + '</div>' +
      '<div class="point-actions"><button id="arm-placement" class="is-primary" type="button">' + (placementArmed ? L("取消放置", "Cancel placement") : state.points.length && entry.pointType === "single" ? L("重新放置", "Replace point") : L("添加坐标", "Add point")) + '</button><button id="delete-point" type="button" ' + (!selectedPointId ? "disabled" : "") + '>' + L("删除选中点", "Delete selected") + '</button></div></section>' +
      '<section><label class="editor-note"><span>' + L("校准备注", "Calibration note") + '</span><textarea id="editor-note" rows="3" placeholder="' + L("记录参考来源或核对说明", "Record the source or verification note") + '">' + escapeHtml(state.note || "") + '</textarea></label></section></div>' +
      '<div class="inspector-footer"><button id="verify-entry" type="button" class="verify-button ' + (status === "verified" ? "is-verified" : "") + '" ' + (!state.points.length ? "disabled" : "") + '>' + (status === "verified" ? L("✓ 已确认", "✓ Verified") : L("确认此条目", "Verify entry")) + '</button><button id="clear-entry" type="button" ' + (!state.points.length && !state.note ? "disabled" : "") + '>' + L("清空条目", "Clear entry") + '</button></div>';

    host.querySelectorAll("[data-point]").forEach(function (button) { button.addEventListener("click", function () { selectedPointId = button.dataset.point; var point = state.points.find(function (candidate) { return candidate.id === selectedPointId; }); if (point) centerPoint(point); renderInspector(); renderMarkers(); }); });
    document.getElementById("arm-placement").addEventListener("click", function () { placementArmed = !placementArmed; renderInspector(); renderPlacementHint(); });
    document.getElementById("delete-point").addEventListener("click", deleteSelectedPoint);
    document.getElementById("editor-note").addEventListener("input", function (event) { state.note = event.target.value; saveDraft(); });
    document.getElementById("verify-entry").addEventListener("click", function () { state.verified = !state.verified; saveDraft(); renderAllPanels(); });
    document.getElementById("clear-entry").addEventListener("click", clearEntry);
  }

  function renderPlacementHint() {
    var hint = document.getElementById("placement-hint");
    var entry = getEntry(selectedEntryId);
    hint.hidden = !placementArmed;
    hint.textContent = placementArmed && entry ? L("点击地图放置：", "Click the map to place: ") + entryName(entry) : "";
    document.getElementById("editor-map-viewport").classList.toggle("is-placing", placementArmed);
  }

  function visibleMarkerEntries() {
    return DATA.entries.filter(function (entry) { return (categoryFilter === "all" || entry.category === categoryFilter) && entryState(entry.id).points.length; });
  }

  function renderMarkers() {
    var layer = document.getElementById("editor-marker-layer");
    var html = [];
    visibleMarkerEntries().forEach(function (entry) {
      entryState(entry.id).points.forEach(function (point, index) {
        html.push('<button type="button" class="editor-marker ' + (selectedEntryId === entry.id ? "is-entry-selected " : "") + (selectedPointId === point.id ? "is-selected" : "") + '" data-entry-id="' + entry.id + '" data-point-id="' + point.id + '" aria-label="' + escapeHtml(entryName(entry)) + '"><span>' + (index + 1) + '</span></button>');
      });
    });
    layer.innerHTML = html.join("");
    layer.querySelectorAll(".editor-marker").forEach(function (marker) { marker.addEventListener("pointerdown", pointPointerDown); marker.addEventListener("click", function (event) { event.stopPropagation(); selectedEntryId = marker.dataset.entryId; selectedPointId = marker.dataset.pointId; placementArmed = false; renderAllPanels(); }); });
    updateMarkerPositions();
  }

  function updateMarkerPositions() {
    var viewport = document.getElementById("editor-map-viewport");
    if (!viewport) return;
    document.querySelectorAll(".editor-marker").forEach(function (marker) {
      var point = entryState(marker.dataset.entryId).points.find(function (candidate) { return candidate.id === marker.dataset.pointId; });
      if (!point) return;
      var x = view.x + MAP.image.width * point.x / 100 * view.scale;
      var y = view.y + MAP.image.height * point.y / 100 * view.scale;
      marker.hidden = x < -24 || y < -24 || x > viewport.clientWidth + 24 || y > viewport.clientHeight + 24;
      marker.style.left = (marker.hidden ? 0 : x) + "px";
      marker.style.top = (marker.hidden ? 0 : y) + "px";
    });
  }

  function pointPointerDown(event) {
    event.preventDefault(); event.stopPropagation();
    var marker = event.currentTarget;
    selectedEntryId = marker.dataset.entryId; selectedPointId = marker.dataset.pointId; placementArmed = false;
    pointDrag = { marker: marker, pointerId: event.pointerId };
    marker.setPointerCapture(event.pointerId);
    marker.addEventListener("pointermove", pointPointerMove);
    marker.addEventListener("pointerup", pointPointerUp);
    marker.addEventListener("pointercancel", pointPointerUp);
  }

  function pointPointerMove(event) {
    if (!pointDrag || pointDrag.pointerId !== event.pointerId) return;
    var point = screenToMap(event.clientX, event.clientY);
    if (!point) return;
    var statePoint = entryState(selectedEntryId).points.find(function (candidate) { return candidate.id === selectedPointId; });
    if (statePoint) { statePoint.x = point.x; statePoint.y = point.y; entryState(selectedEntryId).verified = false; updateMarkerPositions(); }
  }

  function pointPointerUp(event) {
    if (!pointDrag || pointDrag.pointerId !== event.pointerId) return;
    var marker = pointDrag.marker;
    marker.removeEventListener("pointermove", pointPointerMove); marker.removeEventListener("pointerup", pointPointerUp); marker.removeEventListener("pointercancel", pointPointerUp);
    pointDrag = null; saveDraft(); renderAllPanels();
  }

  function placePointFromClick(event) {
    if (!placementArmed || event.target.closest(".editor-marker")) return;
    var entry = getEntry(selectedEntryId), point = screenToMap(event.clientX, event.clientY);
    if (!entry || !point) return;
    var state = entryState(entry.id);
    if (entry.pointType === "single") state.points = [];
    var id = entry.id + "-p" + Date.now().toString(36);
    state.points.push({ id: id, x: point.x, y: point.y });
    state.verified = false; selectedPointId = id; placementArmed = false;
    saveDraft(); renderAllPanels();
  }

  function deleteSelectedPoint() {
    if (!selectedPointId) return;
    var state = entryState(selectedEntryId);
    state.points = state.points.filter(function (point) { return point.id !== selectedPointId; });
    state.verified = false; selectedPointId = state.points.length ? state.points[0].id : "";
    saveDraft(); renderAllPanels();
  }

  function clearEntry() {
    var entry = getEntry(selectedEntryId);
    if (!entry || !window.confirm(L("清空此条目的所有坐标和备注？", "Clear all coordinates and notes for this entry?"))) return;
    draft.entries[entry.id] = { points: [], verified: false, note: "" }; selectedPointId = ""; placementArmed = false;
    saveDraft(); renderAllPanels();
  }

  function screenToMap(clientX, clientY) {
    var viewport = document.getElementById("editor-map-viewport"), rect = viewport.getBoundingClientRect();
    var worldX = (clientX - rect.left - view.x) / view.scale;
    var worldY = (clientY - rect.top - view.y) / view.scale;
    if (worldX < 0 || worldY < 0 || worldX > MAP.image.width || worldY > MAP.image.height) return null;
    return { x: worldX / MAP.image.width * 100, y: worldY / MAP.image.height * 100 };
  }

  function showCursorCoordinates(event) {
    var point = screenToMap(event.clientX, event.clientY);
    document.getElementById("cursor-coordinates").textContent = point ? "x " + point.x.toFixed(5) + " · y " + point.y.toFixed(5) : "x — · y —";
  }

  function mapPointerDown(event) {
    if (placementArmed || event.target.closest(".editor-marker")) return;
    var viewport = document.getElementById("editor-map-viewport");
    viewport.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: view.x, y: view.y };
    viewport.classList.add("is-dragging");
  }

  function mapPointerMove(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    view.x = drag.x + event.clientX - drag.clientX; view.y = drag.y + event.clientY - drag.clientY;
    clampView(); applyView();
  }

  function mapPointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null; document.getElementById("editor-map-viewport").classList.remove("is-dragging");
  }

  function resetView() {
    var viewport = document.getElementById("editor-map-viewport");
    if (!viewport) return;
    view.fit = Math.min(viewport.clientWidth / MAP.image.width, viewport.clientHeight / MAP.image.height);
    view.scale = view.fit; view.x = (viewport.clientWidth - MAP.image.width * view.scale) / 2; view.y = (viewport.clientHeight - MAP.image.height * view.scale) / 2;
    applyView();
  }

  function zoomAt(factor, pointX, pointY) {
    var viewport = document.getElementById("editor-map-viewport");
    if (!viewport) return;
    pointX = pointX == null ? viewport.clientWidth / 2 : pointX; pointY = pointY == null ? viewport.clientHeight / 2 : pointY;
    var oldScale = view.scale, next = Math.max(view.fit, Math.min(view.fit * Math.pow(2, MAP.image.tiles.maxZoom), oldScale * factor));
    var mapX = (pointX - view.x) / oldScale, mapY = (pointY - view.y) / oldScale;
    view.scale = next; view.x = pointX - mapX * next; view.y = pointY - mapY * next; clampView(); applyView();
  }

  function centerPoint(point) {
    var viewport = document.getElementById("editor-map-viewport");
    if (!viewport) return;
    view.scale = Math.max(view.scale, view.fit * 4);
    view.x = viewport.clientWidth / 2 - MAP.image.width * point.x / 100 * view.scale;
    view.y = viewport.clientHeight / 2 - MAP.image.height * point.y / 100 * view.scale;
    clampView(); applyView();
  }

  function clampView() {
    var viewport = document.getElementById("editor-map-viewport"); if (!viewport) return;
    var width = MAP.image.width * view.scale, height = MAP.image.height * view.scale, margin = 70;
    view.x = width <= viewport.clientWidth ? (viewport.clientWidth - width) / 2 : Math.min(margin, Math.max(viewport.clientWidth - width - margin, view.x));
    view.y = height <= viewport.clientHeight ? (viewport.clientHeight - height) / 2 : Math.min(margin, Math.max(viewport.clientHeight - height - margin, view.y));
  }

  function applyView() {
    var viewport = document.getElementById("editor-map-viewport");
    if (!viewport || !renderer) return;
    renderer.update(view, viewport.clientWidth, viewport.clientHeight); updateMarkerPositions();
  }

  function exportData() {
    var payload = {
      schema: "rdr2-map-markers-v1",
      baseImage: { width: MAP.image.width, height: MAP.image.height },
      exportedAt: new Date().toISOString(),
      entries: DATA.entries.map(function (entry) {
        var state = entryState(entry.id);
        return { markerId: entry.id, sourceIds: entry.sourceIds, category: entry.category, nameZh: entry.nameZh, nameEn: entry.nameEn, pointType: entry.pointType, chapterTags: entry.chapterTags, status: entryStatus(entry), points: state.points.map(function (point) { return { x: Number(point.x.toFixed(6)), y: Number(point.y.toFixed(6)) }; }), evidence: state.note || "" };
      })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "rdr2-map-markers-" + new Date().toISOString().slice(0, 10) + ".json"; link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  function importData(event) {
    var file = event.target.files && event.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var payload = JSON.parse(reader.result), incoming = payload.entries;
        if (!Array.isArray(incoming)) throw new Error("entries missing");
        var next = { version: 1, entries: {} };
        incoming.forEach(function (record) {
          if (!getEntry(record.markerId) || !Array.isArray(record.points)) return;
          var points = record.points.filter(function (point) { return Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100; }).map(function (point, index) { return { id: record.markerId + "-import-" + index, x: point.x, y: point.y }; });
          next.entries[record.markerId] = { points: points, verified: record.status === "verified" && points.length > 0, note: typeof record.evidence === "string" ? record.evidence : "" };
        });
        draft = next; selectedPointId = ""; placementArmed = false; saveDraft(); renderAllPanels();
      } catch (error) { window.alert(L("无法导入：文件格式不正确。", "Import failed: invalid file format.")); }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  renderShell();
})();
