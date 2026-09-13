(function () {
  "use strict";

  var DATA = window.RDR2MapData;
  var STORAGE_KEY = "rdr2-interactive-map-v1";
  var LANG_KEY = "rdr2-full-checklist-lang";
  var THEME_KEY = "rdr2-full-checklist-theme";
  var root = document.getElementById("map-root");
  var lang = readSetting(LANG_KEY, "zh") === "en" ? "en" : "zh";
  var theme = readSetting(THEME_KEY, "");
  var filter = "all";
  var statusFilter = "all";
  var query = "";
  var selectedId = "";
  var saved = loadSaved();
  var view = { scale: 1, fit: 1, x: 0, y: 0 };
  var pointers = {};
  var drag = null;
  var renderer = null;

  function readSetting(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; }
  }

  function loadSaved() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { visited: value.visited || {}, notes: value.notes || {} };
    } catch (error) { return { visited: {}, notes: {} }; }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (error) {}
  }

  function L(zh, en) { return lang === "en" ? en : zh; }
  function markerName(marker) { return lang === "en" ? marker.en : marker.zh; }
  function markerDetail(marker) { return lang === "en" ? marker.detailEn : marker.detailZh; }
  function categoryName(category) { return lang === "en" ? category.en : category.zh; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]; }); }

  function applyPreferences() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.lang = lang;
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    else document.documentElement.removeAttribute("data-theme");
    document.title = L("RDR2 互动地图", "RDR2 Interactive Map");
  }

  function latestUpdate() {
    return window.RDR2Updates && window.RDR2Updates.latestText ? window.RDR2Updates.latestText(lang) : "";
  }

  function visibleMarkers() {
    var normalized = query.trim().toLocaleLowerCase();
    return DATA.markers.filter(function (marker) {
      var categoryMatch = filter === "all" || marker.category === filter;
      var visited = !!saved.visited[marker.id];
      var statusMatch = statusFilter === "all" || (statusFilter === "visited" ? visited : !visited);
      var haystack = [marker.zh, marker.en, marker.detailZh, marker.detailEn].join(" ").toLocaleLowerCase();
      return categoryMatch && statusMatch && (!normalized || haystack.indexOf(normalized) !== -1);
    });
  }

  function icon() {
    return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3z"/><path d="M8 3v15M16 6v15"/></svg>';
  }

  function render() {
    applyPreferences();
    if (renderer) renderer.destroy();
    pointers = {};
    drag = null;
    var update = escapeHtml(latestUpdate());
    var done = DATA.markers.filter(function (marker) { return saved.visited[marker.id]; }).length;
    root.innerHTML =
      '<main class="map-page">' +
        '<aside class="update-ticker" aria-label="' + update + '"><div class="update-ticker-track" aria-hidden="true"><span class="update-ticker-copy">' + update + '</span><span class="update-ticker-copy">' + update + '</span></div></aside>' +
        '<header class="map-topbar"><div class="map-brand">' + icon() + '<h1>' + L("互动地图", "Interactive Map") + '</h1><span>' + L("初版", "First Edition") + '</span></div>' +
          '<div class="map-actions"><button class="map-button" id="theme-toggle" type="button">' + (theme === "light" ? L("深色", "Dark") : L("明亮", "Light")) + '</button><button class="map-button" id="lang-toggle" type="button">' + (lang === "en" ? "中文" : "EN") + '</button><a class="map-back" href="index.html">' + L("返回清单", "Checklist") + '</a></div></header>' +
        '<section class="map-shell">' +
          '<aside class="map-panel"><div class="map-panel-head"><p class="map-kicker">' + L("地点记录", "Location Log") + '</p><h2>' + L("西部世界", "The Frontier") + '</h2><p class="map-progress" id="map-progress">' + L("已到访 ", "Visited ") + done + ' / ' + DATA.markers.length + '</p></div>' +
            '<div class="map-tools"><input class="map-search" id="map-search" type="search" autocomplete="off" placeholder="' + L("搜索地点或区域", "Search places or regions") + '" aria-label="' + L("搜索地图", "Search map") + '" value="' + escapeHtml(query) + '">' +
              '<div class="map-segments" aria-label="' + L("到访状态", "Visit status") + '"><button type="button" data-status="all" class="' + (statusFilter === "all" ? "is-active" : "") + '">' + L("全部", "All") + '</button><button type="button" data-status="unvisited" class="' + (statusFilter === "unvisited" ? "is-active" : "") + '">' + L("未到访", "Unvisited") + '</button><button type="button" data-status="visited" class="' + (statusFilter === "visited" ? "is-active" : "") + '">' + L("已到访", "Visited") + '</button></div></div>' +
            '<div class="map-categories" id="map-categories"></div><div class="map-list" id="map-list"></div></aside>' +
          '<section class="map-stage"><div class="map-viewport" id="map-viewport" tabindex="0" aria-label="' + L("可拖动和缩放的高清游戏地图", "Draggable high-resolution game map") + '"><canvas class="map-canvas" id="map-canvas" aria-hidden="true"></canvas><div class="marker-layer" id="marker-layer"></div></div>' +
            '<div class="map-controls" aria-label="' + L("地图缩放", "Map zoom") + '"><button id="zoom-in" type="button" aria-label="' + L("放大", "Zoom in") + '">+</button><button id="zoom-out" type="button" aria-label="' + L("缩小", "Zoom out") + '">−</button><button id="reset-view" type="button" aria-label="' + L("重置视图", "Reset view") + '">⌂</button></div>' +
            '<article class="map-detail" id="map-detail" hidden></article></section>' +
        '</section>' +
        '<footer class="map-foot"><p>' + L("坐标标记暂时关闭，核对显示稳定性后再分批加入。", "Map markers are temporarily disabled and will return after display stability is verified.") + '</p><p>' + L("底图来源：", "Base map: ") + '<a href="' + DATA.image.sourceUrl + '" target="_blank" rel="noopener">' + DATA.image.credit + '</a> · © ' + new Date().getFullYear() + ' Jam8ee</p></footer>' +
      '</main>';
    renderer = window.RDR2MapRenderer.create(document.getElementById("map-canvas"), DATA.image, DATA.version);
    bindControls();
    renderCategories();
    renderMarkerViews();
    requestAnimationFrame(resetView);
  }

  function renderCategories() {
    var host = document.getElementById("map-categories");
    var html = '<button class="category-chip ' + (filter === "all" ? "is-active" : "") + '" type="button" data-category="all">' + L("全部类别", "All categories") + '</button>';
    DATA.categories.forEach(function (category) {
      var count = DATA.markers.filter(function (marker) { return marker.category === category.id; }).length;
      html += '<button class="category-chip ' + (filter === category.id ? "is-active" : "") + '" type="button" data-category="' + category.id + '">' + escapeHtml(categoryName(category)) + ' ' + count + '</button>';
    });
    host.innerHTML = html;
    host.querySelectorAll("[data-category]").forEach(function (button) { button.addEventListener("click", function () { filter = button.dataset.category; renderMarkerViews(); renderCategories(); }); });
  }

  function renderMarkerViews() {
    var markers = visibleMarkers();
    var list = document.getElementById("map-list");
    var layer = document.getElementById("marker-layer");
    if (!markers.length) list.innerHTML = '<div class="map-empty">' + L("没有符合条件的地点", "No matching locations") + '</div>';
    else list.innerHTML = markers.map(function (marker, index) {
      return '<button class="map-list-item' + (saved.visited[marker.id] ? ' is-visited' : '') + (selectedId === marker.id ? ' is-selected' : '') + '" type="button" data-marker-id="' + marker.id + '"><span class="map-list-pin">' + (index + 1) + '</span><span class="map-list-copy"><strong class="map-list-title">' + escapeHtml(markerName(marker)) + '</strong><small class="map-list-detail">' + escapeHtml(markerDetail(marker)) + '</small></span><span class="map-list-state">' + (saved.visited[marker.id] ? "✓" : "") + '</span></button>';
    }).join("");
    layer.innerHTML = markers.map(function (marker, index) {
      return '<button class="marker' + (saved.visited[marker.id] ? ' is-visited' : '') + (selectedId === marker.id ? ' is-selected' : '') + '" type="button" data-marker-id="' + marker.id + '" aria-label="' + escapeHtml(markerName(marker)) + '">' + (index + 1) + '</button>';
    }).join("");
    document.querySelectorAll("[data-marker-id]").forEach(function (button) { button.addEventListener("click", function () { selectMarker(button.dataset.markerId, button.classList.contains("marker")); }); });
    updateMarkerPositions();
    renderDetail();
  }

  function markerById(id) { return DATA.markers.find(function (marker) { return marker.id === id; }); }

  function selectMarker(id, center) {
    selectedId = id;
    var marker = markerById(id);
    if (center && marker) centerMarker(marker);
    renderMarkerViews();
  }

  function renderDetail() {
    var detail = document.getElementById("map-detail");
    var marker = markerById(selectedId);
    if (!marker) { detail.hidden = true; detail.innerHTML = ""; return; }
    var category = DATA.categories.find(function (item) { return item.id === marker.category; });
    var visited = !!saved.visited[marker.id];
    detail.hidden = false;
    detail.innerHTML = '<button class="map-detail-close" id="detail-close" type="button" aria-label="' + L("关闭", "Close") + '">×</button><p class="map-detail-type">' + escapeHtml(categoryName(category)) + '</p><h3>' + escapeHtml(markerName(marker)) + '</h3><p class="map-detail-location">' + escapeHtml(markerDetail(marker)) + '</p><div class="map-detail-actions"><button class="map-visited' + (visited ? ' is-active' : '') + '" id="visit-toggle" type="button">' + (visited ? L("✓ 已到访", "✓ Visited") : L("标记到访", "Mark visited")) + '</button><input class="map-note" id="map-note" type="text" maxlength="160" placeholder="' + L("我的备注…", "My notes...") + '" aria-label="' + L("地点备注", "Location notes") + '" value="' + escapeHtml(saved.notes[marker.id] || "") + '"></div>';
    document.getElementById("detail-close").addEventListener("click", function () { selectedId = ""; renderMarkerViews(); });
    document.getElementById("visit-toggle").addEventListener("click", function () { saved.visited[marker.id] = !visited; persist(); renderMarkerViews(); updateProgress(); });
    document.getElementById("map-note").addEventListener("input", function (event) { saved.notes[marker.id] = event.target.value; persist(); });
  }

  function updateProgress() {
    var done = DATA.markers.filter(function (marker) { return saved.visited[marker.id]; }).length;
    document.getElementById("map-progress").textContent = L("已到访 ", "Visited ") + done + " / " + DATA.markers.length;
  }

  function bindControls() {
    document.getElementById("theme-toggle").addEventListener("click", function () { theme = theme === "light" ? "dark" : "light"; try { localStorage.setItem(THEME_KEY, theme); } catch (error) {} render(); });
    document.getElementById("lang-toggle").addEventListener("click", function () { lang = lang === "en" ? "zh" : "en"; try { localStorage.setItem(LANG_KEY, lang); } catch (error) {} render(); });
    document.getElementById("map-search").addEventListener("input", function (event) { query = event.target.value; renderMarkerViews(); });
    document.querySelectorAll("[data-status]").forEach(function (button) { button.addEventListener("click", function () { statusFilter = button.dataset.status; document.querySelectorAll("[data-status]").forEach(function (item) { item.classList.toggle("is-active", item === button); }); renderMarkerViews(); }); });
    document.getElementById("zoom-in").addEventListener("click", function () { zoomAt(1.32); });
    document.getElementById("zoom-out").addEventListener("click", function () { zoomAt(1 / 1.32); });
    document.getElementById("reset-view").addEventListener("click", resetView);
    var viewport = document.getElementById("map-viewport");
    viewport.addEventListener("wheel", function (event) { event.preventDefault(); var rect = viewport.getBoundingClientRect(); zoomAt(event.deltaY < 0 ? 1.18 : 1 / 1.18, event.clientX - rect.left, event.clientY - rect.top); }, { passive: false });
    viewport.addEventListener("pointerdown", pointerDown);
    viewport.addEventListener("pointermove", pointerMove);
    viewport.addEventListener("pointerup", pointerUp);
    viewport.addEventListener("pointercancel", pointerUp);
    viewport.addEventListener("dblclick", function (event) { var rect = viewport.getBoundingClientRect(); zoomAt(1.45, event.clientX - rect.left, event.clientY - rect.top); });
    viewport.addEventListener("keydown", function (event) { var step = 44; if (event.key === "+" || event.key === "=") zoomAt(1.25); else if (event.key === "-") zoomAt(.8); else if (event.key === "0") resetView(); else if (event.key === "ArrowLeft") view.x += step; else if (event.key === "ArrowRight") view.x -= step; else if (event.key === "ArrowUp") view.y += step; else if (event.key === "ArrowDown") view.y -= step; else return; event.preventDefault(); clampView(); applyView(); });
    window.removeEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
  }

  function handleResize() { resetView(); }

  function pointerDown(event) {
    if (event.target.closest(".marker")) return;
    var viewport = document.getElementById("map-viewport");
    viewport.setPointerCapture(event.pointerId);
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
    drag = { x: event.clientX, y: event.clientY, mapX: view.x, mapY: view.y };
    viewport.classList.add("is-dragging");
  }

  function pointerMove(event) {
    if (!pointers[event.pointerId] || !drag) return;
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
    view.x = drag.mapX + event.clientX - drag.x;
    view.y = drag.mapY + event.clientY - drag.y;
    clampView(); applyView();
  }

  function pointerUp(event) {
    delete pointers[event.pointerId]; drag = null;
    var viewport = document.getElementById("map-viewport");
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  }

  function resetView() {
    var viewport = document.getElementById("map-viewport");
    if (!viewport) return;
    var width = viewport.clientWidth, height = viewport.clientHeight;
    view.fit = Math.min(width / DATA.image.width, height / DATA.image.height);
    view.scale = view.fit;
    view.x = (width - DATA.image.width * view.scale) / 2;
    view.y = (height - DATA.image.height * view.scale) / 2;
    applyView();
  }

  function zoomAt(factor, pointX, pointY) {
    var viewport = document.getElementById("map-viewport");
    if (!viewport) return;
    pointX = pointX == null ? viewport.clientWidth / 2 : pointX;
    pointY = pointY == null ? viewport.clientHeight / 2 : pointY;
    var oldScale = view.scale;
    var next = Math.max(view.fit, Math.min(view.fit * Math.pow(2, DATA.image.tiles.maxZoom), oldScale * factor));
    var mapX = (pointX - view.x) / oldScale;
    var mapY = (pointY - view.y) / oldScale;
    view.scale = next;
    view.x = pointX - mapX * next;
    view.y = pointY - mapY * next;
    clampView(); applyView();
  }

  function centerMarker(marker) {
    var viewport = document.getElementById("map-viewport");
    var targetScale = Math.max(view.scale, view.fit * 4);
    view.scale = Math.min(view.fit * Math.pow(2, DATA.image.tiles.maxZoom), targetScale);
    view.x = viewport.clientWidth / 2 - DATA.image.width * marker.x / 100 * view.scale;
    view.y = viewport.clientHeight / 2 - DATA.image.height * marker.y / 100 * view.scale;
    clampView(); applyView();
  }

  function clampView() {
    var viewport = document.getElementById("map-viewport");
    if (!viewport) return;
    var scaledWidth = DATA.image.width * view.scale;
    var scaledHeight = DATA.image.height * view.scale;
    var margin = 70;
    view.x = scaledWidth <= viewport.clientWidth ? (viewport.clientWidth - scaledWidth) / 2 : Math.min(margin, Math.max(viewport.clientWidth - scaledWidth - margin, view.x));
    view.y = scaledHeight <= viewport.clientHeight ? (viewport.clientHeight - scaledHeight) / 2 : Math.min(margin, Math.max(viewport.clientHeight - scaledHeight - margin, view.y));
  }

  function applyView() {
    var viewport = document.getElementById("map-viewport");
    if (!viewport || !renderer) return;
    renderer.update(view, viewport.clientWidth, viewport.clientHeight);
    updateMarkerPositions();
  }

  function updateMarkerPositions() {
    var viewport = document.getElementById("map-viewport");
    if (!viewport) return;
    document.querySelectorAll(".marker").forEach(function (button) {
      var marker = markerById(button.dataset.markerId);
      var x = view.x + DATA.image.width * marker.x / 100 * view.scale;
      var y = view.y + DATA.image.height * marker.y / 100 * view.scale;
      button.hidden = x < -22 || y < -22 || x > viewport.clientWidth + 22 || y > viewport.clientHeight + 22;
      // Off-screen markers must not expand the overlay's paintable bounds.
      button.style.left = (button.hidden ? 0 : x) + "px";
      button.style.top = (button.hidden ? 0 : y) + "px";
    });
  }

  render();
})();
