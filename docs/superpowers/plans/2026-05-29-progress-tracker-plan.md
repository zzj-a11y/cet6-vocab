# 答题进度追踪 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 答题页添加 SVG 进度环，追踪答对单词数 / 总单词数的百分比。

**Architecture:** `App.completedIds` 数组持久化，`QuizPage.renderProgressRing()` 渲染 SVG 圆环，单选/多选答对时调用 `App.addCompleted()`。

**Tech Stack:** 纯原生 HTML/CSS/JS，SVG 进度环

---

### Task 1: App 状态 — 添加 completedIds

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 在 App 中添加 completedIds 属性和方法**

在 `js/app.js` 的 App 对象中：

1. 在第 5 行 `favoriteIds: [],` 后添加 `completedIds: [],`
2. 在 `loadData()` 中第 22 行后添加：`this.completedIds = JSON.parse(localStorage.getItem('cet6_completed') || '[]');`
3. 在 `saveFavorites()` 后新增方法：

```js
saveCompleted() {
  localStorage.setItem('cet6_completed', JSON.stringify(this.completedIds));
},

addCompleted(wordId) {
  if (!this.completedIds.includes(wordId)) {
    this.completedIds.push(wordId);
    this.saveCompleted();
  }
},

getCompletedCount() {
  return this.completedIds.length;
},

clearCompleted() {
  this.completedIds = [];
  this.saveCompleted();
},
```

4. 删除单词时同步清理：在 `wordManager.js` 中已有 `del-btn` 逻辑，追加过滤 `App.completedIds`

- [ ] **Step 2: 验证提交**

```bash
node --check js/app.js
git add js/app.js && git commit -m "feat: add completedIds state for progress tracking"
```

---

### Task 2: 答题模块 — 渲染进度环 + 答对时更新

**Files:**
- Modify: `js/quiz.js`

- [ ] **Step 1: 添加进度环渲染方法**

在 `QuizPage` 对象中 `/* ======== Shared ======== */` 之前添加：

```js
renderProgressRing() {
  const total = App.words.length;
  const done = App.getCompletedCount();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;
  const circumference = 2 * Math.PI * 15; // r=15
  const offset = circumference - (done / Math.max(total, 1)) * circumference;

  return `
    <div class="progress-ring-area">
      <div class="progress-ring-wrap">
        <svg class="progress-ring" viewBox="0 0 36 36">
          <circle class="progress-ring-bg" cx="18" cy="18" r="15"
            fill="none" stroke="var(--color-border-light)" stroke-width="3"/>
          <circle class="progress-ring-fill" cx="18" cy="18" r="15"
            fill="none" stroke="url(#progressGrad)" stroke-width="3"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round"/>
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--color-primary)"/>
              <stop offset="100%" stop-color="var(--color-success)"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="progress-ring-num">${done}</div>
      </div>
      <div class="progress-ring-text">
        <span>${total} 词中已完成 <strong>${done}</strong> 词</span>
        ${remaining > 0 ? `<span>还需 <strong>${remaining}</strong> 词</span>` : '<span style="color:var(--color-success)">🎉 全部完成！</span>'}
      </div>
    </div>`;
},
```

- [ ] **Step 2: 在 renderSingle 和 renderMulti 中插入进度环**

在 `renderSingle` 的 `<div class="quiz-word">` 之后、`<div class="quiz-options">` 之前插入 `${this.renderProgressRing()}`。

在 `renderMulti` 的 `<div class="multi-hint">` 之后、`<div class="quiz-options">` 之前插入 `${this.renderProgressRing()}`。

- [ ] **Step 3: 答对时调用 addCompleted**

在 `handleSingleAnswer` 中，`if (!isCorrect)` 的 `else` 分支（第 91 行附近）添加 `App.addCompleted(this.currentWord.id);`

在 `handleMultiAnswer` 中，`if (isFullyCorrect)` 分支添加 `App.addCompleted(this.currentWord.id);`

- [ ] **Step 4: 验证提交**

```bash
node --check js/quiz.js
git add js/quiz.js && git commit -m "feat: add progress ring rendering and answer tracking"
```

---

### Task 3: 管理页 — 重置进度按钮 + 删除单词同步清理

**Files:**
- Modify: `js/wordManager.js`

- [ ] **Step 1: 在管理页工具栏添加"重置进度"按钮**

在管理页 `render` 的 `manage-toolbar` 中，"恢复默认"按钮之前添加：

```html
<button class="btn-outline" id="resetProgressBtn">🔄 重置进度</button>
```

- [ ] **Step 2: 绑定重置进度事件**

在 `bindEvents` 中，"恢复默认"按钮事件之后添加：

```js
document.getElementById('resetProgressBtn').addEventListener('click', () => {
  if (confirm('确定重置背词进度？已完成的记录将清零。')) {
    App.clearCompleted();
    this.render(container);
  }
});
```

- [ ] **Step 3: 删除单词时同步清理 completedIds**

在已有的 `del-btn` 事件处理中，`App.favoriteIds.filter(fid => fid !== id)` 之后添加：

```js
App.completedIds = App.completedIds.filter(cid => cid !== id);
App.saveCompleted();
```

- [ ] **Step 4: 验证提交**

```bash
node --check js/wordManager.js
git add js/wordManager.js && git commit -m "feat: add reset progress button and cleanup on word delete"
```

---

### Task 4: CSS — 进度环样式

**Files:**
- Modify: `css/style.css`（追加到末尾）

- [ ] **Step 1: 追加进度环样式**

```css
/* ============================================
   Progress Ring
   ============================================ */
.progress-ring-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 20px;
  margin-top: -12px;
}
.progress-ring-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.progress-ring {
  width: 44px;
  height: 44px;
  transform: rotate(-90deg);
}
.progress-ring-fill {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-ring-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-primary);
  font-family: var(--font-heading);
}
.progress-ring-text {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.progress-ring-text strong {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 2: 验证提交**

```bash
git add css/style.css && git commit -m "feat: add progress ring styles"
```

---

### Task 5: 端到端验证 + 推送

- [ ] **Step 1: 浏览器测试**

1. 打开 app，确认进度环显示在单词和选项之间
2. 答对几道题，确认进度环数字和百分比增长
3. 答错确认进度不变
4. 刷新页面确认进度持久化
5. 管理页点"重置进度"确认清零
6. 删除一个已完成的单词确认计数更新

- [ ] **Step 2: 推送**

```bash
git push
```
