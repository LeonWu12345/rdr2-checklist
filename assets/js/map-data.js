(function () {
  "use strict";

  // Positions use percentages of the 4096 x 3072 base image. Keeping map content
  // separate from the renderer lets future verified collections be added without
  // changing pan, zoom, filtering or persistence code.
  window.RDR2MapData = {
    version: 1,
    image: {
      src: "assets/images/rdr2-map.jpg",
      width: 4096,
      height: 3072,
      credit: "RDR2.org",
      sourceUrl: "https://www.rdr2.org/guides/map/"
    },
    categories: [
      { id: "town", zh: "城镇", en: "Towns", color: "#c82333" }
    ],
    markers: [
      { id: "town-valentine", category: "town", x: 59.1, y: 33.4, region: "new-hanover", zh: "瓦伦丁", en: "Valentine", detailZh: "新汉诺威 · 大地之心", detailEn: "New Hanover - The Heartlands" },
      { id: "town-strawberry", category: "town", x: 47.0, y: 45.5, region: "west-elizabeth", zh: "草莓镇", en: "Strawberry", detailZh: "西伊丽莎白 · 大谷地", detailEn: "West Elizabeth - Big Valley" },
      { id: "town-blackwater", category: "town", x: 54.5, y: 54.6, region: "west-elizabeth", zh: "黑水镇", en: "Blackwater", detailZh: "西伊丽莎白 · 大平原", detailEn: "West Elizabeth - Great Plains" },
      { id: "town-rhodes", category: "town", x: 72.4, y: 55.8, region: "lemoyne", zh: "罗德斯", en: "Rhodes", detailZh: "莱莫因 · 斯嘉丽草甸", detailEn: "Lemoyne - Scarlett Meadows" },
      { id: "town-saint-denis", category: "town", x: 84.2, y: 54.3, region: "lemoyne", zh: "圣丹尼斯", en: "Saint Denis", detailZh: "莱莫因 · 巴约努瓦", detailEn: "Lemoyne - Bayou Nwa" },
      { id: "town-van-horn", category: "town", x: 91.4, y: 34.5, region: "new-hanover", zh: "范霍恩贸易站", en: "Van Horn Trading Post", detailZh: "新汉诺威 · 罗诺克岭", detailEn: "New Hanover - Roanoke Ridge" },
      { id: "town-annesburg", category: "town", x: 86.0, y: 24.7, region: "new-hanover", zh: "安尼斯堡", en: "Annesburg", detailZh: "新汉诺威 · 罗诺克岭", detailEn: "New Hanover - Roanoke Ridge" },
      { id: "town-armadillo", category: "town", x: 32.7, y: 68.8, region: "new-austin", zh: "犰狳镇", en: "Armadillo", detailZh: "新奥斯汀 · 犰狳镇", detailEn: "New Austin - Armadillo" },
      { id: "town-tumbleweed", category: "town", x: 16.8, y: 74.3, region: "new-austin", zh: "风滚草镇", en: "Tumbleweed", detailZh: "新奥斯汀 · 风滚草镇", detailEn: "New Austin - Tumbleweed" }
    ]
  };
})();
