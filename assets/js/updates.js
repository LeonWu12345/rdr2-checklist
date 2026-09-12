(() => {
  const entries = Object.freeze([
    Object.freeze({
      date: Object.freeze({ zh: '9月13日', en: 'September 13' }),
      content: Object.freeze({
        zh: '新增缺失支线任务与 14 项营地同伴活动 · “营地请求”更名为“营地请求&活动” · 完善石雕、恐龙骨与捕梦网位置 · 优化英文版字体、地名翻译及标点显示 · 完善图鉴备注与挑战明细',
        en: 'Added missing side missions and 14 camp companion activities - Renamed Camp Requests to Camp Requests & Activities - Improved rock carving, dinosaur bone and dreamcatcher locations - Refined English typography, place names and punctuation - Improved Compendium notes and challenge details'
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
