# 布局切换器改为紧凑悬浮圆钮 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把顶部整行布局按钮栏改为右上角悬浮圆钮 + 点击弹出下拉菜单。

**Architecture:** 改 index.html 结构、css 样式、app.js 事件逻辑。

**Tech Stack:** 纯原生 HTML/CSS/JS

---

### Task 1: HTML 结构 — 替换布局栏为 FAB

**Files:**
- Modify: `index.html`

替换现有的 `<div class="layout-bar">...</div>` 为：

```html
  <!-- 布局切换 FAB -->
  <div class="layout-fab" id="layoutFab">
    <button class="fab-trigger" id="fabTrigger">📱</button>
    <div class="layout-menu" id="layoutMenu" style="display:none">
      <button class="layout-menu-item active" data-layout="iphone">📱 iPhone</button>
      <button class="layout-menu-item" data-layout="ipad">📋 iPad Air</button>
      <button class="layout-menu-item" data-layout="macbook">💻 MacBook Neo</button>
    </div>
  </div>
```

注意：`.layout-fab` 放在 `.app-container` 内部（作为其第一个子元素），用 absolute 定位在右上角。

### Task 2: CSS — FAB 样式替换布局栏样式

**Files:**
- Modify: `css/style.css`

1. 删除 `.layout-bar` 和 `.layout-btn` 所有样式
2. 追加 FAB 样式：

```css
/* ============================================
   Layout FAB
   ============================================ */
.layout-fab {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
}
.fab-trigger {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border-light);
  cursor: pointer;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: all var(--transition-fast);
}
.fab-trigger:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(79,70,229,0.15);
}
.layout-menu {
  position: absolute;
  top: 48px;
  right: 0;
  background: var(--color-surface);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 110;
  min-width: 180px;
  padding: 6px;
}
.layout-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  min-height: 40px;
}
.layout-menu-item:hover {
  background: var(--color-primary-bg);
}
.layout-menu-item.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
}
```

### Task 3: JS — FAB 弹出/收起 + 外部点击关闭

**Files:**
- Modify: `js/app.js`

替换 `bindLayoutButtons()` 方法为：

```js
bindLayoutButtons() {
    const fab = document.getElementById('layoutFab');
    const trigger = document.getElementById('fabTrigger');
    const menu = document.getElementById('layoutMenu');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display !== 'none';
      menu.style.display = isOpen ? 'none' : 'block';
    });

    menu.querySelectorAll('.layout-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const layout = item.dataset.layout;
        document.getElementById('appContainer').setAttribute('data-layout', layout);
        trigger.textContent = item.textContent.trim().charAt(0) === '📱' ? '📱' :
                              item.textContent.trim().charAt(0) === '📋' ? '📋' : '💻';
        menu.querySelectorAll('.layout-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        menu.style.display = 'none';
      });
    });

    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });
  },
```

### Task 4: 端到端验证 + 推送

测试：
1. 默认显示 📱 圆钮
2. 点击圆钮弹出菜单，三个选项
3. 选中 iPad → 圆钮变 📋，容器 820px
4. 点击菜单外 → 菜单关闭
5. 刷新后保持上次选择（layout 在 data-layout 属性上）

```bash
git push
```
