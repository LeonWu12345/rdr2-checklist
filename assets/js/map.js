(function () {
  "use strict";

  var DATA = window.RDR2MapData;
  var embedded = new URLSearchParams(window.location.search).get("embed") === "1";
  var compact = new URLSearchParams(window.location.search).get("compact") === "1";
  var embedExpanded = !compact;
  var LANG_KEY = "rdr2-full-checklist-lang";
  var THEME_KEY = "rdr2-full-checklist-theme";
  var CHECKLIST_KEY = "rdr2-full-checklist-v2";
  var COMPENDIUM_KEY = "rdr2-compendium-v1";
  var root = document.getElementById("map-root");
  var lang = readSetting(LANG_KEY, "zh") === "en" ? "en" : "zh";
  var theme = readSetting(THEME_KEY, "");
  var filter = "";
  var query = "";
  var selectedId = "";
  var view = { scale: 1, fit: 1, x: 0, y: 0 };
  var pointers = {};
  var drag = null;
  var renderer = null;
  var checklistState = readJson(CHECKLIST_KEY);
  var compendiumState = readJson(COMPENDIUM_KEY);
  var COMPENDIUM_LINKS = {
    la1:"animals-165",la2:"animals-164",la3:"animals-177",la4:"animals-168",la5:"animals-169",la6:"animals-171",la7:"animals-173",la8:"animals-172",la9:"animals-174",la10:"animals-166",la11:"animals-178",la12:"animals-175",la13:"animals-163",la14:"animals-170",la15:"animals-176",la16:"animals-167",
    lf1:"fish-25",lf2:"fish-22",lf3:"fish-27",lf4:"fish-28",lf5:"fish-18",lf6:"fish-23",lf7:"fish-16",lf8:"fish-17",lf9:"fish-30",lf10:"fish-21",lf11:"fish-20",lf12:"fish-19",lf13:"fish-24",lf14:"fish-26",
    tk1:"equipment-23",tk2:"equipment-24",tk3:"equipment-25",tk4:"equipment-26",tk5:"equipment-27",tk6:"equipment-28",tk7:"equipment-29",tk8:"equipment-38",tk9:"equipment-31",tk10:"equipment-32",tk11:"equipment-22",tk12:"equipment-36",tk13:"equipment-18",tk14:"equipment-21",tk15:"equipment-19",tk16:"equipment-20",tk17:"equipment-34",tk18:"equipment-40",tk19:"equipment-41",tk20:"equipment-43",tk21:"equipment-39",tk22:"equipment-42",tk23:"equipment-37",tk24:"equipment-30",tk25:"equipment-35",tk26:"equipment-33"
  };

  function readSetting(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; }
  }

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (error) { return {}; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function L(zh, en) { return lang === "en" ? en : zh; }
  function markerName(marker) { return lang === "en" ? marker.en : marker.zh; }
  function markerDetail(marker) { return lang === "en" ? marker.detailEn : marker.detailZh; }
  function categoryName(category) { return lang === "en" ? category.en : category.zh; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]; }); }

  function flagIcon(code) {
    if (code === "cn") return '<svg class="map-flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" rx="1" fill="#de2910"/><path d="m5 3 .7 2.1h2.2L6.1 6.4l.7 2.1L5 7.2 3.2 8.5l.7-2.1-1.8-1.3h2.2z" fill="#ffde00"/></svg>';
    return '<svg class="map-flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" rx="1" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 30 20M30 0 0 20" stroke="#c8102e" stroke-width="2"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.2"/></svg>';
  }

  function checklistId(marker) { return (marker.sourceIds && marker.sourceIds[0]) || marker.groupId || marker.id; }

  function isComplete(marker) {
    var id = checklistId(marker);
    var linked = COMPENDIUM_LINKS[id];
    return linked ? !!compendiumState[linked] : !!(checklistState[id] && checklistState[id].c);
  }

  function setComplete(marker, complete) {
    var id = checklistId(marker);
    var previous = checklistState[id] || {};
    checklistState[id] = { c: !!complete, m: typeof previous.m === "string" ? previous.m : "" };
    writeJson(CHECKLIST_KEY, checklistState);
    var linked = COMPENDIUM_LINKS[id];
    if (linked) {
      if (complete) compendiumState[linked] = true;
      else delete compendiumState[linked];
      writeJson(COMPENDIUM_KEY, compendiumState);
    }
  }

  function applyPreferences() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.lang = lang;
    if (embedded) document.documentElement.dataset.embed = "true";
    else document.documentElement.removeAttribute("data-embed");
    if (embedded) document.documentElement.dataset.embedView = embedExpanded ? "expanded" : "compact";
    else document.documentElement.removeAttribute("data-embed-view");
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    else document.documentElement.removeAttribute("data-theme");
    document.title = L("RDR2 互动地图", "RDR2 Interactive Map");
  }

  function latestUpdate() {
    return window.RDR2Updates && window.RDR2Updates.latestText ? window.RDR2Updates.latestText(lang) : "";
  }

  function mapIsInteractive() {
    return !embedded || embedExpanded;
  }

  function syncEmbeddedInteractionState() {
    if (!embedded) return;
    var viewport = document.getElementById("map-viewport");
    if (!viewport) return;
    viewport.tabIndex = embedExpanded ? 0 : -1;
    viewport.setAttribute("aria-label", embedExpanded
      ? L("可拖动和缩放的高清游戏地图", "Draggable high-resolution game map")
      : L("地图位置缩略图", "Map location preview"));
  }

  function visibleMarkers() {
    if (embedded) {
      var selectedMarker = markerById(selectedId);
      return selectedMarker ? [selectedMarker] : [];
    }
    if (!filter) return [];
    var normalized = query.trim().toLocaleLowerCase();
    return DATA.markers.filter(function (marker) {
      var categoryMatch = marker.category === filter;
      var haystack = [marker.zh, marker.en, marker.detailZh, marker.detailEn].join(" ").toLocaleLowerCase();
      return categoryMatch && (!normalized || haystack.indexOf(normalized) !== -1);
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
    root.innerHTML =
      '<main class="map-page">' +
        '<aside class="update-ticker" aria-label="' + update + '"><div class="update-ticker-track" aria-hidden="true"><span class="update-ticker-copy">' + update + '</span><span class="update-ticker-copy">' + update + '</span></div></aside>' +
        '<header class="map-topbar"><div class="map-brand">' + icon() + '<h1>' + L("互动地图", "Interactive Map") + '</h1></div>' +
          '<div class="map-actions"><button class="map-button map-icon-button" id="theme-toggle" type="button" title="' + (theme === "light" ? L("切换至深色模式", "Switch to dark mode") : L("切换至浅色模式", "Switch to light mode")) + '" aria-label="' + (theme === "light" ? L("切换至深色模式", "Switch to dark mode") : L("切换至浅色模式", "Switch to light mode")) + '">' + (theme === "light" ? "🌙" : "☀️") + '</button><button class="map-button map-icon-button" id="lang-toggle" type="button" title="' + (lang === "en" ? "切换至中文" : "Switch to English") + '" aria-label="' + (lang === "en" ? "切换至中文" : "Switch to English") + '">' + flagIcon(lang === "en" ? "cn" : "gb") + '</button><a class="map-back" href="index.html">' + L("返回", "Back") + '</a></div></header>' +
        '<section class="map-shell">' +
          '<aside class="map-panel"><div class="map-panel-head"><h2>' + L("西部世界", "The Frontier") + '</h2></div>' +
            '<div class="map-tools"><input class="map-search" id="map-search" type="search" autocomplete="off" placeholder="' + L("搜索地点或物品", "Search locations or items") + '" aria-label="' + L("搜索地图", "Search map") + '" value="' + escapeHtml(query) + '"></div>' +
            '<div class="map-categories" id="map-categories"></div><div class="map-list" id="map-list"></div></aside>' +
          '<section class="map-stage"><div class="map-viewport" id="map-viewport" tabindex="0" aria-label="' + L("可拖动和缩放的高清游戏地图", "Draggable high-resolution game map") + '"><canvas class="map-canvas" id="map-canvas" aria-hidden="true"></canvas><div class="marker-layer" id="marker-layer"></div></div>' +
            '<div class="map-controls" aria-label="' + L("地图缩放", "Map zoom") + '"><button id="zoom-in" type="button" aria-label="' + L("放大", "Zoom in") + '">+</button><button id="zoom-out" type="button" aria-label="' + L("缩小", "Zoom out") + '">−</button><button id="reset-view" type="button" aria-label="' + L("重置视图", "Reset view") + '">⌂</button></div>' +
            '<article class="map-detail" id="map-detail" hidden></article></section>' +
        '</section>' +
        '<footer class="map-foot"><p>' + L("从左侧选择类别或地点，地图会自动定位对应标记。", "Choose a category or location from the left to focus its marker.") + '</p><p>' + L("底图来源：", "Base map: ") + '<a href="' + DATA.image.sourceUrl + '" target="_blank" rel="noopener">' + DATA.image.credit + '</a> · © ' + new Date().getFullYear() + ' Jam8ee</p></footer>' +
      '</main>';
    renderer = window.RDR2MapRenderer.create(document.getElementById("map-canvas"), DATA.image, DATA.version);
    bindControls();
    syncEmbeddedInteractionState();
    renderCategories();
    renderMarkerViews();
    requestAnimationFrame(resetView);
  }

  function renderCategories() {
    var host = document.getElementById("map-categories");
    var html = "";
    DATA.categories.forEach(function (category) {
      var count = DATA.markers.filter(function (marker) { return marker.category === category.id; }).length;
      html += '<button class="category-chip ' + (filter === category.id ? "is-active" : "") + '" type="button" data-category="' + category.id + '" aria-pressed="' + (filter === category.id ? "true" : "false") + '">' + escapeHtml(categoryName(category)) + ' ' + count + '</button>';
    });
    host.innerHTML = html;
    host.querySelectorAll("[data-category]").forEach(function (button) { button.addEventListener("click", function () {
      filter = filter === button.dataset.category ? "" : button.dataset.category;
      selectedId = "";
      query = "";
      var search = document.getElementById("map-search");
      if (search) search.value = "";
      renderMarkerViews();
      renderCategories();
      resetView();
    }); });
  }

  function renderMarkerViews() {
    var markers = visibleMarkers();
    var list = document.getElementById("map-list");
    var layer = document.getElementById("marker-layer");
    if (!markers.length) list.innerHTML = '<div class="map-empty">' + (!embedded && !filter
      ? L("请选择一个类别以显示标点", "Choose a category to show its markers")
      : L("没有符合条件的地点", "No matching locations")) + '</div>';
    else list.innerHTML = markers.map(function (marker, index) {
      var complete = isComplete(marker);
      return '<div class="map-list-item' + (selectedId === marker.id ? ' is-selected' : '') + (complete ? ' is-complete' : '') + '"><input class="map-list-check" type="checkbox" data-checklist-id="' + escapeHtml(checklistId(marker)) + '" data-checklist-marker="' + escapeHtml(marker.id) + '" aria-label="' + escapeHtml(L("标记为已完成：", "Mark complete: ") + markerName(marker)) + '"' + (complete ? ' checked' : '') + '><button class="map-list-focus" type="button" data-marker-id="' + marker.id + '"><span class="map-list-pin">' + (index + 1) + '</span><span class="map-list-copy"><strong class="map-list-title">' + escapeHtml(markerName(marker)) + '</strong><small class="map-list-detail">' + escapeHtml(markerDetail(marker)) + '</small></span></button></div>';
    }).join("");
    layer.innerHTML = markers.map(function (marker, index) {
      return '<button class="marker' + (selectedId === marker.id ? ' is-selected' : '') + (isComplete(marker) ? ' is-complete' : '') + '" type="button" data-marker-id="' + marker.id + '" aria-label="' + escapeHtml(markerName(marker)) + '">' + (index + 1) + '</button>';
    }).join("");
    document.querySelectorAll("[data-marker-id]").forEach(function (button) { button.addEventListener("click", function () {
      if (embedded && !mapIsInteractive()) return;
      selectMarker(button.dataset.markerId, true);
    }); });
    document.querySelectorAll("[data-checklist-marker]").forEach(function (checkbox) { checkbox.addEventListener("change", function () {
      var marker = markerById(checkbox.dataset.checklistMarker);
      if (!marker) return;
      setComplete(marker, checkbox.checked);
      renderMarkerViews();
    }); });
    updateMarkerPositions();
    renderDetail();
  }

  function markerById(id) { return DATA.markers.find(function (marker) { return marker.id === id || (marker.sourceIds || []).indexOf(id) !== -1; }); }

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
    detail.hidden = false;
    detail.innerHTML = '<button class="map-detail-close" id="detail-close" type="button" aria-label="' + L("关闭", "Close") + '">×</button><p class="map-detail-type">' + escapeHtml(categoryName(category)) + '</p><h3>' + escapeHtml(markerName(marker)) + '</h3><p class="map-detail-location">' + escapeHtml(markerDetail(marker)) + '</p>';
    document.getElementById("detail-close").addEventListener("click", function () { selectedId = ""; renderMarkerViews(); });
  }

  function bindControls() {
    document.getElementById("theme-toggle").addEventListener("click", function () { theme = theme === "light" ? "dark" : "light"; try { localStorage.setItem(THEME_KEY, theme); } catch (error) {} render(); });
    document.getElementById("lang-toggle").addEventListener("click", function () { lang = lang === "en" ? "zh" : "en"; try { localStorage.setItem(LANG_KEY, lang); } catch (error) {} render(); });
    document.getElementById("map-search").addEventListener("input", function (event) { query = event.target.value; renderMarkerViews(); });
    document.getElementById("zoom-in").addEventListener("click", function () { if (mapIsInteractive()) zoomAt(1.32); });
    document.getElementById("zoom-out").addEventListener("click", function () { if (mapIsInteractive()) zoomAt(1 / 1.32); });
    document.getElementById("reset-view").addEventListener("click", function () { if (mapIsInteractive()) resetView(); });
    var viewport = document.getElementById("map-viewport");
    viewport.addEventListener("wheel", function (event) { if (!mapIsInteractive()) return; event.preventDefault(); var rect = viewport.getBoundingClientRect(); zoomAt(event.deltaY < 0 ? 1.18 : 1 / 1.18, event.clientX - rect.left, event.clientY - rect.top); }, { passive: false });
    viewport.addEventListener("pointerdown", pointerDown);
    viewport.addEventListener("pointermove", pointerMove);
    viewport.addEventListener("pointerup", pointerUp);
    viewport.addEventListener("pointercancel", pointerUp);
    viewport.addEventListener("dblclick", function (event) { if (!mapIsInteractive()) return; var rect = viewport.getBoundingClientRect(); zoomAt(1.45, event.clientX - rect.left, event.clientY - rect.top); });
    viewport.addEventListener("keydown", function (event) { if (!mapIsInteractive()) return; var step = 44; if (event.key === "+" || event.key === "=") zoomAt(1.25); else if (event.key === "-") zoomAt(.8); else if (event.key === "0") resetView(); else if (event.key === "ArrowLeft") view.x += step; else if (event.key === "ArrowRight") view.x -= step; else if (event.key === "ArrowUp") view.y += step; else if (event.key === "ArrowDown") view.y -= step; else return; event.preventDefault(); clampView(); applyView(); });
    window.removeEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
  }

  function handleResize() {
    var marker = markerById(selectedId);
    resetView();
    if (marker) centerMarker(marker);
  }

  window.addEventListener("message", function (event) {
    var message = event.data || {};
    if (!embedded || typeof message !== "object") return;
    if (message.type === "rdr2-map-layout") {
      embedExpanded = !!message.expanded;
      document.documentElement.dataset.embedView = embedExpanded ? "expanded" : "compact";
      syncEmbeddedInteractionState();
      requestAnimationFrame(handleResize);
      return;
    }
    if (message.type === "rdr2-map-focus" && message.markerId) {
      var marker = markerById(message.markerId);
      if (!marker) return;
      selectedId = marker.id;
      renderMarkerViews();
      requestAnimationFrame(function () { centerMarker(marker); });
    }
  });

  function pointerDown(event) {
    if (!mapIsInteractive()) return;
    if (event.target.closest(".marker")) return;
    var viewport = document.getElementById("map-viewport");
    viewport.setPointerCapture(event.pointerId);
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
    drag = { x: event.clientX, y: event.clientY, mapX: view.x, mapY: view.y };
    viewport.classList.add("is-dragging");
  }

  function pointerMove(event) {
    if (!mapIsInteractive()) return;
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
    if (!viewport) return;
    view.scale = view.fit * Math.pow(2, DATA.image.tiles.maxZoom);
    view.x = viewport.clientWidth / 2 - DATA.image.width * marker.x / 100 * view.scale;
    view.y = viewport.clientHeight / 2 - DATA.image.height * marker.y / 100 * view.scale;
    applyView();
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

  function refreshCompletionState() {
    checklistState = readJson(CHECKLIST_KEY);
    compendiumState = readJson(COMPENDIUM_KEY);
    renderMarkerViews();
  }

  window.addEventListener("storage", function (event) {
    if (!event.key || event.key === CHECKLIST_KEY || event.key === COMPENDIUM_KEY) refreshCompletionState();
  });
  window.addEventListener("pageshow", refreshCompletionState);
  window.addEventListener("focus", refreshCompletionState);

  render();
})();
