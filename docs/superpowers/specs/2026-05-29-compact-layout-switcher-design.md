# 布局切换器改为紧凑悬浮圆钮 — 设计说明书

**日期**: 2026-05-29
**状态**: 已确认

## 概述

把顶部占整行的三个布局按钮改为右上角一个悬浮圆钮，点击弹出下拉菜单。

## 改动文件

- `index.html`：移除 `.layout-bar`，改为单个 `.layout-fab` 圆钮 + `.layout-menu` 下拉
- `css/style.css`：替换 `.layout-bar` / `.layout-btn` 样式为 FAB 样式
- `js/app.js`：`bindLayoutButtons` 改为弹出/收起 + 外部点击关闭逻辑

## UI

- 圆钮 40×40px，position: absolute 在 `.app-container` 右上角内侧
- 菜单从圆钮下方展开，box-shadow + border-radius
- 选中项 indigo 高亮
