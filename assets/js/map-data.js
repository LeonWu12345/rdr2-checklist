(function () {
  "use strict";

  // Positions use percentages of the 21617 x 16785 base image. Keeping map content
  // separate from the renderer lets future verified collections be added without
  // changing pan, zoom, filtering or persistence code.
  window.RDR2MapData = {
    version: 2,
    image: {
      width: 21617,
      height: 16785,
      credit: "Jotrius / J10 Railroad Engineer",
      sourceUrl: "https://www.nexusmods.com/reddeadredemption2/mods/676",
      tiles: {
        root: "assets/map-tiles",
        tileSize: 1024,
        minZoom: 0,
        maxZoom: 5,
        extension: "jpg"
      }
    },
    categories: [
      { id: "town", zh: "城镇", en: "Towns", color: "#c82333" }
    ],
    markers: [
      { id: "town-valentine", category: "town", x: 59.15, y: 32.78, region: "new-hanover", zh: "瓦伦丁", en: "Valentine", detailZh: "新汉诺威 - 大地之心", detailEn: "New Hanover - The Heartlands" },
      { id: "town-strawberry", category: "town", x: 45.03, y: 46.01, region: "west-elizabeth", zh: "草莓镇", en: "Strawberry", detailZh: "西伊丽莎白 - 大谷地", detailEn: "West Elizabeth - Big Valley" },
      { id: "town-blackwater", category: "town", x: 53.85, y: 55.72, region: "west-elizabeth", zh: "黑水镇", en: "Blackwater", detailZh: "西伊丽莎白 - 大平原", detailEn: "West Elizabeth - Great Plains" },
      { id: "town-rhodes", category: "town", x: 74.44, y: 56.0, region: "lemoyne", zh: "罗德斯", en: "Rhodes", detailZh: "莱莫因 - 斯嘉丽草甸", detailEn: "Lemoyne - Scarlett Meadows" },
      { id: "town-saint-denis", category: "town", x: 87.27, y: 54.49, region: "lemoyne", zh: "圣丹尼斯", en: "Saint Denis", detailZh: "莱莫因 - 巴约努瓦", detailEn: "Lemoyne - Bayou Nwa" },
      { id: "town-van-horn", category: "town", x: 92.73, y: 34.07, region: "new-hanover", zh: "范霍恩贸易站", en: "Van Horn Trading Post", detailZh: "新汉诺威 - 罗诺克岭", detailEn: "New Hanover - Roanoke Ridge" },
      { id: "town-annesburg", category: "town", x: 87.94, y: 24.23, region: "new-hanover", zh: "安尼斯堡", en: "Annesburg", detailZh: "新汉诺威 - 罗诺克岭", detailEn: "New Hanover - Roanoke Ridge" },
      { id: "town-armadillo", category: "town", x: 31.64, y: 69.95, region: "new-austin", zh: "犰狳镇", en: "Armadillo", detailZh: "新奥斯汀 - 犰狳镇", detailEn: "New Austin - Armadillo" },
      { id: "town-tumbleweed", category: "town", x: 13.17, y: 75.7, region: "new-austin", zh: "风滚草镇", en: "Tumbleweed", detailZh: "新奥斯汀 - 风滚草镇", detailEn: "New Austin - Tumbleweed" }
    ]
  };
})();
