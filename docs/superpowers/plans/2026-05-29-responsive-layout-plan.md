# 三设备专属布局 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 iPhone/iPad/MacBook 三种设备设计专属 UI 布局，不只是一个宽度拉伸。

**Architecture:** 通过 CSS `[data-layout]` 选择器控制每个设备的显示/隐藏和布局风格。HTML 增加 MacBook 侧边栏和统计面板结构（默认隐藏）。JS 增加统计数据填充方法。

**Tech Stack:** 纯原生 HTML/CSS/JS，CSS `[data-layout]` 属性选择器 + `display` 控制

---

### Task 1: HTML — 新增 MacBook 侧边栏和统计面板

**Files:**
- Modify: `index.html`

在 `<div class="app-container">` 内，`<main class="page-content">` 之前，添加桌面端专属结构：

```html
    <!-- 桌面端：左侧导航栏（仅 MacBook 显示） -->
    <div class="desktop-sidebar" id="desktopSidebar">
      <div class="sidebar-brand">CET-6</div>
      <div class="sidebar-progress" id="sidebarProgress"></div>
      <nav class="sidebar-nav">
        <button class="sidebar-nav-item active" data-tab="quiz" id="sidebarQuizBtn">
          <span>📝</span> 答题
        </button>
        <button class="sidebar-nav-item" data-tab="wrongbook" id="sidebarWrongBtn">
          <span>❌</span> 错题本 <span class="sidebar-badge" id="sidebarWrongBadge">0</span>
        </button>
        <button class="sidebar-nav-item" data-tab="favorites" id="sidebarFavBtn">
          <span>⭐</span> 收藏本
        </button>
        <button class="sidebar-nav-item" data-tab="manage" id="sidebarManageBtn">
          <span>⚙️</span> 管理
        </button>
      </nav>
      <div class="sidebar-fab" id="sidebarFab"></div>
    </div>

    <!-- 桌面端：右侧统计面板（仅 MacBook 显示） -->
    <div class="desktop-stats" id="desktopStats"></div>
```

这些元素默认 `display: none`，仅 `[data-layout="macbook"]` 时显示。

### Task 2: CSS — iPhone 布局优化

**Files:**
- Modify: `css/style.css`

在 `[data-layout="iphone"]` 块内追加专属样式（大触控区、按钮靠下）：

```css
.app-container[data-layout="iphone"] {
  --container-width: 430px;
  --font-base: 15px;
  --font-word: 28px;
  --font-option: 16px;
}
/* iPhone: 选项触控区加大，按钮靠下排列 */
.app-container[data-layout="iphone"] .option-btn {
  min-height: 56px;
  padding: 20px 16px;
}
.app-container[data-layout="iphone"] .page-content {
  padding: 20px 16px;
}
```

### Task 3: CSS — iPad 左右分栏 + 2×2 网格

**Files:**
- Modify: `css/style.css`

```css
.app-container[data-layout="ipad"] {
  --container-width: 820px;
  --font-base: 17px;
  --font-word: 36px;
  --font-option: 16px;
  --spacing-lg: 32px;
}
/* iPad: 2×2 选项网格 */
.app-container[data-layout="ipad"] .quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  max-width: 100%;
}
.app-container[data-layout="ipad"] .option-btn {
  min-height: 100px;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
}
.app-container[data-layout="ipad"] .option-letter {
  width: 28px;
  height: 28px;
  font-size: 14px;
}
/* iPad: quiz area 改为支持分列 */
.app-container[data-layout="ipad"] .quiz-area {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  padding-top: 24px;
}
.app-container[data-layout="ipad"] .quiz-word {
  width: 100%;
  margin-bottom: 8px;
}
.app-container[data-layout="ipad"] .progress-ring-area {
  width: 100%;
  justify-content: center;
}
/* iPad: 操作区底部横排 */
.app-container[data-layout="ipad"] .quiz-actions {
  width: 100%;
  justify-content: center;
  gap: 16px;
}
```

### Task 4: CSS — MacBook 三栏布局 + 统计面板

**Files:**
- Modify: `css/style.css`

```css
.app-container[data-layout="macbook"] {
  --container-width: 1280px;
  --font-base: 18px;
  --font-word: 42px;
  --font-option: 18px;
  --spacing-lg: 36px;
}
/* MacBook: 三栏 flex 布局 */
.app-container[data-layout="macbook"] {
  flex-direction: row;
}
/* 左侧导航栏 170px */
.app-container[data-layout="macbook"] .desktop-sidebar {
  display: flex;
  flex-direction: column;
  width: 170px;
  border-right: 2px solid var(--color-border-light);
  background: var(--color-primary-bg);
  padding: 16px 12px;
  flex-shrink: 0;
}
/* 中间内容区 flex:1 */
.app-container[data-layout="macbook"] .page-content {
  flex: 1;
  overflow-y: auto;
}
/* 右侧统计面板 200px */
.app-container[data-layout="macbook"] .desktop-stats {
  display: flex;
  flex-direction: column;
  width: 200px;
  border-left: 2px solid var(--color-border-light);
  background: var(--color-primary-bg);
  padding: 16px 12px;
  overflow-y: auto;
  flex-shrink: 0;
}
/* MacBook: 隐藏底部 tab bar */
.app-container[data-layout="macbook"] .tab-bar {
  display: none;
}
/* MacBook: 选项 2×2 网格 + 快捷键提示 */
.app-container[data-layout="macbook"] .quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 560px;
}
.app-container[data-layout="macbook"] .option-btn {
  min-height: 56px;
  justify-content: flex-start;
  gap: 12px;
}
/* 侧边栏导航样式 */
.sidebar-brand { font-family: var(--font-heading); font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 16px; color: var(--color-primary); }
.sidebar-progress { text-align: center; margin-bottom: 12px; }
.sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
.sidebar-nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; cursor: pointer; font-size: 13px; color: var(--color-text-muted); transition: all var(--transition-fast); width: 100%; text-align: left; font-family: var(--font-body); min-height: 40px; }
.sidebar-nav-item:hover { background: rgba(255,255,255,0.6); }
.sidebar-nav-item.active { background: var(--color-primary); color: #fff; font-weight: 600; }
.sidebar-badge { margin-left: auto; background: var(--color-danger); color: #fff; border-radius: 8px; padding: 0 6px; font-size: 10px; font-weight: 700; min-width: 18px; text-align: center; }
.sidebar-nav-item.active .sidebar-badge { background: rgba(255,255,255,0.3); }
.sidebar-fab { margin-top: auto; display: flex; justify-content: center; gap: 4px; padding-top: 12px; }

/* 统计面板样式 */
.stat-card { background: #fff; border: 2px solid var(--color-border-light); border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 10px; }
.stat-card.gradient-purple { background: linear-gradient(135deg, #5B5FEF, #818CF8); color: #fff; border: none; }
.stat-card.gradient-green { background: linear-gradient(135deg, #22C55E, #4ADE80); color: #fff; border: none; }
.stat-card.gradient-amber { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: #fff; border: none; }
.stat-card-label { font-size: 10px; opacity: 0.8; margin-bottom: 2px; }
.stat-card-value { font-size: 28px; font-weight: 800; line-height: 1.1; }
.stat-card-sub { font-size: 10px; opacity: 0.7; margin-top: 2px; }
.stat-progress { margin-bottom: 10px; }
.stat-progress-label { display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-bottom: 3px; }
.stat-progress-bar { height: 6px; background: var(--color-border-light); border-radius: 3px; overflow: hidden; }
.stat-progress-fill { height: 100%; border-radius: 3px; }
.stat-recent { background: #fff; border: 2px solid var(--color-border-light); border-radius: 12px; padding: 10px; }
.stat-recent-label { font-size: 10px; color: var(--color-text-muted); margin-bottom: 6px; text-align: center; }
.stat-recent-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.stat-tag { background: var(--color-primary-bg); color: var(--color-primary); padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 600; }
```

### Task 5: JS — 侧边栏导航 + 统计面板数据

**Files:**
- Modify: `js/app.js`

1. 在 `init()` 中添加 `this.renderSidebar(); this.renderStats();`
2. 在 `switchTab()` 中同步更新侧边栏高亮
3. 新增方法：

```js
renderSidebar() {
  const sidebar = document.getElementById('desktopSidebar');
  if (!sidebar) return;
  const sidebarProg = document.getElementById('sidebarProgress');
  const total = this.words.length;
  const done = this.getCompletedCount();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 14;
  const offset = circumference - (done / Math.max(total, 1)) * circumference;
  sidebarProg.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
      <circle cx="18" cy="18" r="14" fill="none" stroke="#E0E7FF" stroke-width="3"/>
      <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" stroke-width="3"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <div style="font-size:11px;color:#818CF8;margin-top:4px;">${done}/${total}</div>`;

  // Bind sidebar nav
  sidebar.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => this.switchTab(item.dataset.tab));
  });
},

updateSidebarActive(tab) {
  const sidebar = document.getElementById('desktopSidebar');
  if (!sidebar) return;
  sidebar.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.toggle('active', i.dataset.tab === tab));
},

updateSidebarBadge() {
  const badge = document.getElementById('sidebarWrongBadge');
  if (badge) badge.textContent = this.wrongIds.length;
},

renderStats() {
  const stats = document.getElementById('desktopStats');
  if (!stats || !stats.offsetParent) return;
  const total = this.words.length;
  const done = this.getCompletedCount();
  const wrong = this.wrongIds.length;
  const fav = this.favoriteIds.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const accuracy = done > 0 ? Math.round((done / (done + wrong || 1)) * 100) : 0;

  stats.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:#1E1B4B;margin-bottom:12px;text-align:center;">📊 答题统计</div>
    <div style="text-align: center; margin-bottom: 14px;">
      <div style="display: inline-block; position: relative; width: 68px; height: 68px;">
        <svg viewBox="0 0 36 36" style="width:68px;height:68px;transform:rotate(-90deg)">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#E0E7FF" stroke-width="3"/>
          <circle cx="18" cy="18" r="15" fill="none" stroke="#22C55E" stroke-width="3"
            stroke-dasharray="94.2" stroke-dashoffset="${94.2 - (pct/100)*94.2}" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#5B5FEF;">${pct}%</div>
      </div>
      <div style="font-size:11px;color:#818CF8;margin-top:6px;">${done} / ${total} 已完成</div>
    </div>
    <div class="stat-progress">
      <div class="stat-progress-label"><span>✅ 正确率</span><span>${accuracy}%</span></div>
      <div class="stat-progress-bar"><div class="stat-progress-fill" style="width:${accuracy}%;background:linear-gradient(90deg,#22C55E,#4ADE80);"></div></div>
    </div>
    <div class="stat-progress">
      <div class="stat-progress-label"><span>📝 总进度</span><span>${pct}%</span></div>
      <div class="stat-progress-bar"><div class="stat-progress-fill" style="width:${pct}%;background:linear-gradient(90deg,#5B5FEF,#818CF8);"></div></div>
    </div>
    <div class="stat-card gradient-amber">
      <div class="stat-card-label">🔥 连续打卡</div>
      <div class="stat-card-value">1<span style="font-size:14px;"> 天</span></div>
    </div>
    <div class="stat-card" style="text-align:center;">
      <div style="font-size:11px;color:#818CF8;">❌ 错题本 · ${wrong} 词</div>
    </div>
    <div class="stat-recent" style="margin-top:8px;">
      <div class="stat-recent-label">最近复习</div>
      <div class="stat-recent-tags">${this.completedIds.slice(-6).reverse().map(id => {
        const w = this.words.find(x => x.id === id);
        return w ? `<span class="stat-tag">${w.english}</span>` : '';
      }).join('')}</div>
    </div>`;
},
```

4. 在 `switchTab()` 末尾添加 `this.updateSidebarActive(tab);`
5. 在 `updateWrongBadge()` 末尾添加 `this.updateSidebarBadge();`
6. 在 `saveCompleted()` 后调用 `this.renderStats();`

### Task 6: 端到端验证 + 推送

在三种布局下分别测试：答题、错题本、收藏、管理、FAB 切换所有功能。
