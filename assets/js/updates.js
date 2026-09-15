(() => {
  const entries = Object.freeze([
    Object.freeze({
      date: Object.freeze({ zh: '9月16日', en: 'September 16' }),
      content: Object.freeze({
        zh: '互动地图新增香烟卡、棚屋与兴趣点，并加入香烟卡套组与藏宝图筛选',
        en: 'Interactive map: added Cigarette Cards, Shacks, and Points of Interest, plus card-set and treasure-map filters'
      })
    })
  ]);

  window.RDR2Updates = Object.freeze({
    entries,
    latestText(language) {
      const latest = entries[0];
      return language === 'en'
        ? `${latest.date.en} update: [${latest.content.en}]`
        : `${latest.date.zh}更新：[${latest.content.zh}]`;
    }
  });
})();
