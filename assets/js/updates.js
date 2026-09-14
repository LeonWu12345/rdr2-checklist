(() => {
  const entries = Object.freeze([
    Object.freeze({
      date: Object.freeze({ zh: '9月15日', en: 'September 15' }),
      content: Object.freeze({
        zh: '新增可互动地图',
        en: 'Added: Interactive map'
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
