# RDR2 Checklist / 荒野大镖客：救赎 2 全收集清单

一个为《荒野大镖客：救赎 2》玩家制作的双语进度追踪网站，集中整理任务、挑战、收集品、狩猎内容与游戏内图鉴。网站以离线优先的纯静态页面实现，无需注册账号；勾选进度、展开状态和个人备注都会保存在当前浏览器中。

**在线使用：[rdr2tracker.com](https://rdr2tracker.com)**

> 这是非官方的玩家项目，与 Rockstar Games 或 Take-Two Interactive 无关。游戏名称、图像及相关商标归其各自权利人所有。

## 主要功能

- 中文与英文界面，可随时切换
- 深色、浅色和跟随系统三种主题
- 按章节、完成状态和关键词筛选条目
- 支持个人备注、菜单折叠以及浏览器本地持久化
- 覆盖总完成度、支线任务、营地请求与活动、挑战、全收集、狩猎、悬赏令和趣味探索等内容
- 独立的 560 项游戏图鉴，包含动物、装备、鱼类、帮派、植物、马匹、武器和香烟卡
- 图鉴分页、香烟卡套组、马匹花色及图鉴备注
- 主清单与图鉴之间的相关条目双向联动
- 捕兽人服装、强化装备、饰品与护身符等材料清单
- 响应式布局、键盘焦点、高对比度和减少动态效果支持

## 技术特点

项目不依赖框架、包管理器、外部字体或在线运行服务。所有页面、样式、脚本、字体与图片都保存在仓库中，可以直接打开，也可以部署到任意静态网站托管平台。

```text
index.html                       主清单页面骨架
compendium.html                  图鉴页面骨架
assets/
  css/
    shared.css                   两页共用的字体与更新公告样式
    checklist.css                主清单样式
    compendium.css               图鉴样式
  js/
    updates.js                   两页共用的更新公告数据
    checklist.js                 主清单数据、渲染与交互
    compendium.js                图鉴数据、渲染与交互
  fonts/                         本地字体
  images/                        图标、背景和社交分享图片
functional-check.cjs             页面行为与存档兼容性检查
validate-redesign.cjs            内容、数量、联动与结构回归检查
```

## 本地使用

直接打开 `index.html` 即可使用。为了获得与线上部署更接近的效果，也可以在项目根目录启动任意静态文件服务器。

本项目没有安装步骤，也不需要执行构建命令。

## 内容更新

网站顶部的更新公告集中保存在 `assets/js/updates.js`。把最新公告放在 `entries` 数组第一项，并填写中英文日期与内容，主清单和图鉴页便会自动显示同一条公告。

修改任务或图鉴数据时，应保留现有条目 ID。纯 UI 调整不应改变条目文字、数量、顺序、联动关系或存档格式。

## 检查修改

提交改动前，在项目根目录运行：

```powershell
node functional-check.cjs
node validate-redesign.cjs
```

两项检查均通过后，再在主清单和图鉴页中手动验证中文/英文、深色/浅色主题、搜索、筛选、备注、分页及跨页面联动。

## 分支与发布流程

- `develop`：日常开发与内容更新的默认分支
- `main`：当前正式发布版本，仅在准备上线时从 `develop` 合并

Netlify 的 Production branch 保持为 `main`。日常修改只推送到 `develop`，并在 Netlify 中关闭 Branch deploys 与 Deploy Previews，便不会因每次开发提交而触发部署。准备发布时，完成检查并将 `develop` 合并到 `main`，Netlify 只部署一次正式版本。

## 存档兼容性

浏览器进度使用以下稳定存储键。后续重构时不得更名，否则会导致已有用户的本地进度无法继续读取。

- `rdr2-full-checklist-v2`
- `rdr2-full-checklist-open`
- `rdr2-full-checklist-theme`
- `rdr2-full-checklist-lang`
- `rdr2-compendium-v1`
- `rdr2-compendium-category`
- `rdr2-compendium-notes-v1`
- `rdr2-compendium-horse-coats-v1`

## 数据说明

条目内容根据游戏内信息及多个攻略来源交叉整理。由于不同版本、平台和翻译之间可能存在差异，游戏内实际显示始终具有最高优先级。发现遗漏或错误时，欢迎通过 GitHub Issue 提交具体条目与可靠来源。

© 2026 Jam8ee
