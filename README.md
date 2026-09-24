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
- 互动地图位置辅助，支持拖动、缩放、搜索、分类筛选、清单地点定位，以及与主清单共用的完成状态
- 21617×16785 高清地图瓦片，放大时仅加载当前视野附近的区域
- 独立地图标点编辑器，支持筛选、拖动校准、本地草稿、确认状态及 JSON 导入导出
- 捕兽人服装、强化装备、饰品与护身符等材料清单
- 响应式布局、键盘焦点、高对比度和减少动态效果支持

## 技术特点

项目不依赖框架、包管理器、外部字体或在线运行服务。所有页面、样式、脚本、字体与图片都保存在仓库中，可以直接打开，也可以部署到任意静态网站托管平台。

```text
index.html                       主清单页面骨架
compendium.html                  图鉴页面骨架
map.html                         互动地图页面骨架
assets/
  css/
    shared.css                   页面共用的本地字体
    checklist.css                主清单样式
    compendium.css               图鉴样式
    map.css                      互动地图样式
  js/
    checklist.js                 主清单数据、渲染与交互
    compendium.js                图鉴数据、渲染与交互
    map-data.js                  可独立扩展和校准的地图标记数据
    map-markers.js               由已确认坐标生成的正式地图标记
    map.js                       地图界面、拖动、缩放与筛选逻辑
    map-renderer.js              视口大小的 2D 绘图、瓦片缓存与加载
  fonts/                         本地字体
  images/                        图标、背景和社交分享图片
  map-tiles/                     多缩放等级的本地高清地图瓦片
docs/
  map-content-inventory.md       互动地图待标点范围、去重规则与编辑器字段约定
tests/
  functional-check.cjs           页面行为与存档兼容性检查
  validate-redesign.cjs          内容、数量、联动与结构回归检查
  map-check.cjs                  地图资源与静态集成检查，包含渲染器测试
  map-renderer-check.cjs         缩放/拖动几何、异步加载与资源上限测试
  map-editor-check.cjs           编辑器范围、隔离存储与导出结构检查
tools/
  preview-server.cjs             无依赖的本地预览服务器
  map-editor/
    index.html                   内部标点编辑器入口（不进入正式导航）
    editor.css                   编辑器工作区样式
    editor-data.js               待标点条目范围与清单关联
    editor.js                    标点、校准、草稿和数据导入导出
    verified-markers.json        用户确认的原始坐标导出
    build-map-markers.cjs        从确认数据生成正式地图标记
```

## 本地使用

直接打开 `index.html` 即可使用。为了获得与线上部署更接近的效果，也可以在项目根目录运行 `node tools/preview-server.cjs`，再访问 `http://127.0.0.1:4173/`。

本项目没有安装步骤，也不需要执行构建命令。

## 内容更新

修改任务或图鉴数据时，应保留现有条目 ID。纯 UI 调整不应改变条目文字、数量、顺序、联动关系或存档格式。

## 检查修改

提交改动前，在项目根目录运行：

```powershell
node tests/functional-check.cjs
node tests/validate-redesign.cjs
node tests/map-check.cjs
node tests/map-editor-check.cjs
```

四项检查均通过后，再在主清单和图鉴页中手动验证中文/英文、深色/浅色主题、搜索、筛选、备注、分页及跨页面联动。地图需要在目标浏览器中反复放大、缩小、拖动和重置，同时观察标题栏与侧栏；本地文件与 HTTP 预览都应检查。自动渲染器测试验证绘图计算和异步行为，不能代替实际浏览器/显卡的视觉检查。

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

互动地图底图由 Jotrius / J10 Railroad Engineer 制作，项目按作者许可署名使用。原始资源见 [Nexus Mods](https://www.nexusmods.com/reddeadredemption2/mods/676)。网页使用本地瓦片金字塔，不会在初次打开时下载完整的 21617×16785 图片。

地图仅在视口大小的 2D 画布内绘制可见裁片，不创建或缩放原图大小的 DOM 图层。画布上限为 4 百万像素、单边 4096 像素，最多保留 48 张瓦片、并行加载 6 张。每次重绘先铺完整缩略底图，高清瓦片未加载成功时仍保留底图。主清单的小窗和展开窗默认不显示标点，点击已关联的地点后只显示该标点，以最大倍率居中定位；独立地图页默认不显示标点，选择类别后显示该类别的全部已确认地点。地图页的勾选状态直接写入主清单和图鉴的既有存档，不另建地图进度。

条目内容根据游戏内信息及多个攻略来源交叉整理。由于不同版本、平台和翻译之间可能存在差异，游戏内实际显示始终具有最高优先级。发现遗漏或错误时，欢迎通过 GitHub Issue 提交具体条目与可靠来源。

© 2026 Jam8ee
