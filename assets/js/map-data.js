(function () {
  "use strict";

  // Positions use percentages of the 21617 x 16785 base image. Keeping map content
  // separate from the renderer lets future verified collections be added without
  // changing pan, zoom, filtering or persistence code.
  window.RDR2MapData = {
    version: 4,
    image: {
      width: 21617,
      height: 16785,
      overview: "assets/images/rdr2-map-overview.jpg",
      credit: "Jotrius / J10 Railroad Engineer",
      sourceUrl: "https://www.nexusmods.com/reddeadredemption2/mods/676",
      tiles: {
        root: "assets/map-tiles",
        tileSize: 1024,
        minZoom: 0,
        detailMinZoom: 3,
        maxZoom: 5,
        extension: "jpg"
      }
    },
    categories: [],
    markers: []
  };
})();
