# RDR2 Checklist

这是一个无需构建工具、可直接部署到 Netlify 的静态网站。主清单与图鉴共享字体、图片和更新公告，但各自的数据与页面逻辑保持独立。

## 目录结构

```text
index.html                       主清单页面骨架
compendium.html                  图鉴页面骨架
assets/
  css/
    shared.css                   两个页面共用的字体和更新栏样式
    checklist.css                主清单样式
    compendium.css               图鉴样式
  js/
    updates.js                   更新公告数据，两页自动共用
    checklist.js                 主清单数据、渲染与交互
    compendium.js                图鉴数据、渲染与交互
  fonts/                         本地字体
  images/                        图标、背景与分享图片
functional-check.cjs             主清单功能检查
validate-redesign.cjs            内容、联动和结构回归检查
```

## 发布更新公告

只编辑 `assets/js/updates.js`。最新公告放在 `entries` 数组第一项，填写中英文日期和内容；主清单与图鉴会自动读取同一条公告，不需要再修改两个 HTML 文件。

## 本地验证

在项目根目录运行：

```powershell
node functional-check.cjs
node validate-redesign.cjs
```

页面没有 npm、框架、外部字体或网络运行依赖，可直接打开 `index.html`，也可把整个目录作为 Netlify 发布目录。

## 兼容性约束

以下本地存储键属于稳定接口，后续重构或更新时不可更名：

- `rdr2-full-checklist-v2`
- `rdr2-full-checklist-open`
- `rdr2-full-checklist-theme`
- `rdr2-full-checklist-lang`
- `rdr2-compendium-v1`
- `rdr2-compendium-category`
- `rdr2-compendium-notes-v1`
- `rdr2-compendium-horse-coats-v1`

条目 ID、文字、数量、顺序和主清单与图鉴的联动映射同样属于稳定数据，不应在纯 UI 或结构调整中修改。
