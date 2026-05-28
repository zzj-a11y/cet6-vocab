# CET-6 六级单词背诵程序 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯前端的六级词汇背诵网页应用，支持答题、错题本、收藏本、单词管理，三种设备布局切换。

**Architecture:** 纯原生 HTML/CSS/JS，零依赖。app.js 作为主控制器管理状态和路由，4 个功能模块各管一页。数据通过 localStorage 持久化。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS (ES6+)，无框架无构建工具

**文件清单:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `data/words.js`
- Create: `js/app.js`
- Create: `js/quiz.js`
- Create: `js/wrongBook.js`
- Create: `js/favorite.js`
- Create: `js/wordManager.js`

---

### Task 1: 创建项目骨架和 HTML 结构

**Files:**
- Create: `index.html`

- [ ] **Step 1: 创建 index.html 完整结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CET-6 六级单词背诵</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- 布局切换栏 -->
  <div class="layout-bar">
    <button class="layout-btn active" data-layout="iphone">📱 iPhone</button>
    <button class="layout-btn" data-layout="ipad">📋 iPad Air</button>
    <button class="layout-btn" data-layout="macbook">💻 MacBook Neo</button>
  </div>

  <!-- 主容器 -->
  <div class="app-container" data-layout="iphone" id="appContainer">
    <!-- 页面内容区 -->
    <main class="page-content" id="pageContent"></main>

    <!-- 底部 Tab 栏 -->
    <nav class="tab-bar">
      <button class="tab-btn active" data-tab="quiz">
        <span class="tab-icon">📝</span>
        <span class="tab-label">答题</span>
      </button>
      <button class="tab-btn" data-tab="wrongbook">
        <span class="tab-icon">❌</span>
        <span class="tab-label">错题本</span>
        <span class="badge" id="wrongBadge" style="display:none">0</span>
      </button>
      <button class="tab-btn" data-tab="favorites">
        <span class="tab-icon">⭐</span>
        <span class="tab-label">收藏本</span>
      </button>
      <button class="tab-btn" data-tab="manage">
        <span class="tab-icon">⚙️</span>
        <span class="tab-label">管理</span>
      </button>
    </nav>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="data/words.js"></script>
  <script src="js/app.js"></script>
  <script src="js/quiz.js"></script>
  <script src="js/wrongBook.js"></script>
  <script src="js/favorite.js"></script>
  <script src="js/wordManager.js"></script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器中打开 index.html，确认骨架渲染正常**

打开 `index.html`，检查布局栏和底部 Tab 栏是否显示。

---

### Task 2: CSS 样式 — 布局系统、Tab 栏、三种设备尺寸

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: 编写 CSS Reset 和 CSS 变量**

```css
/* === Reset === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  color: #1a1a2e;
}

/* === CSS Variables — default iPhone === */
:root {
  --container-width: 430px;
  --container-radius: 20px;
  --font-base: 14px;
  --font-word: 26px;
  --font-option: 16px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --color-primary: #4A90D9;
  --color-success: #27AE60;
  --color-danger: #E74C3C;
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-text-light: #666;
  --color-border: #e0e0e0;
  --color-tab-active: #4A90D9;
  --color-tab-inactive: #999;
}
```

- [ ] **Step 2: 编写布局栏样式**

```css
/* === Layout Switcher === */
.layout-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.layout-btn {
  padding: 8px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.layout-btn:hover { border-color: var(--color-primary); }
.layout-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
```

- [ ] **Step 3: 编写主容器和三种设备布局**

```css
/* === App Container === */
.app-container {
  width: var(--container-width);
  min-height: 800px;
  background: var(--color-bg);
  border-radius: var(--container-radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.35s ease;
  position: relative;
}

/* iPhone 15 Pro Max */
.app-container[data-layout="iphone"] {
  --container-width: 430px;
  --font-base: 14px;
  --font-word: 26px;
  --font-option: 15px;
}

/* iPad Air 11" */
.app-container[data-layout="ipad"] {
  --container-width: 820px;
  --font-base: 17px;
  --font-word: 36px;
  --font-option: 18px;
}

/* MacBook Neo 13" */
.app-container[data-layout="macbook"] {
  --container-width: 1280px;
  --font-base: 18px;
  --font-word: 44px;
  --font-option: 20px;
}
```

- [ ] **Step 4: 编写页面内容区和 Tab 栏样式**

```css
/* === Page Content === */
.page-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  font-size: var(--font-base);
}

/* === Tab Bar === */
.tab-bar {
  display: flex;
  border-top: 1px solid var(--color-border);
  background: #fafafa;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 6px 0;
  color: var(--color-tab-inactive);
  transition: color 0.2s;
  position: relative;
}
.tab-btn.active { color: var(--color-tab-active); }
.tab-icon { font-size: 20px; }
.tab-label { font-size: 11px; }

.badge {
  position: absolute;
  top: 0;
  right: calc(50% - 24px);
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
```

- [ ] **Step 5: 在浏览器中验证三种布局切换的视觉效果**

打开 `index.html`，手动修改 `data-layout` 属性为 `ipad` 和 `macbook` 看宽度是否正确变化。

---

### Task 3: 词汇数据模块

**Files:**
- Create: `data/words.js`

- [ ] **Step 1: 创建默认词汇表**

```js
const DEFAULT_WORDS = [
  { id: 1, english: "instruction", chinese: "指导，指示" },
  { id: 2, english: "supervision", chinese: "监督，管理" },
  { id: 3, english: "supervisor", chinese: "监督者，管理者" },
  { id: 4, english: "adequate", chinese: "足够的，适当的" },
  { id: 5, english: "merit", chinese: "优点" },
  { id: 6, english: "appreciate", chinese: "感激，欣赏" },
  { id: 7, english: "colleague", chinese: "同事" },
  { id: 8, english: "offend", chinese: "冒犯，得罪" },
  { id: 9, english: "urge", chinese: "敦促，催促" },
  { id: 10, english: "degree", chinese: "度，学位" },
  { id: 11, english: "profound", chinese: "深刻的，极大的" },
  { id: 12, english: "realize", chinese: "实现，获得，意识到" },
  { id: 13, english: "branch", chinese: "分支" },
  { id: 14, english: "conductive", chinese: "有助于，有益于" },
  { id: 15, english: "institution", chinese: "机构，制度" },
  { id: 16, english: "picnic", chinese: "野餐，轻松" },
  { id: 17, english: "trustworthy", chinese: "值得信任的" },
  { id: 18, english: "prevent", chinese: "阻止" },
  { id: 19, english: "hacker", chinese: "黑客" },
  { id: 20, english: "crack", chinese: "爆发，裂开" },
  { id: 21, english: "guide", chinese: "指导" },
  { id: 22, english: "guideline", chinese: "指导方针" },
  { id: 23, english: "anticipate", chinese: "预期，预料" },
  { id: 24, english: "intricacy", chinese: "错综复杂" },
  { id: 25, english: "incentive", chinese: "激励" },
  { id: 26, english: "application", chinese: "申请，用途，应用软件" },
  { id: 27, english: "workout", chinese: "锻炼" },
  { id: 28, english: "fitness", chinese: "健康" },
  { id: 29, english: "fell into", chinese: "陷入（fell是fall的过去式）" },
  { id: 30, english: "slump", chinese: "暴跌" },
  { id: 31, english: "deteriorate", chinese: "恶化，变化" },
  { id: 32, english: "repeat", chinese: "重复" },
  { id: 33, english: "optimal", chinese: "合适的" },
];
```

- [ ] **Step 2: 在浏览器 console 中验证 `DEFAULT_WORDS` 可访问**

打开 `index.html`，在 console 输入 `DEFAULT_WORDS` 确认数组正常输出。

---

### Task 4: App 主控制器 — 状态管理、路由、布局切换

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: 编写 app.js 完整代码**

```js
const App = {
  words: [],
  wrongIds: [],
  favoriteIds: [],
  currentTab: 'quiz',
  reviewMode: false,
  reviewRemaining: [],

  init() {
    this.loadData();
    this.bindLayoutButtons();
    this.bindTabButtons();
    this.switchTab('quiz');
  },

  /* === Data Persistence === */
  loadData() {
    const saved = JSON.parse(localStorage.getItem('cet6_words') || 'null');
    this.words = saved || [...DEFAULT_WORDS];
    this.wrongIds = JSON.parse(localStorage.getItem('cet6_wrong') || '[]');
    this.favoriteIds = JSON.parse(localStorage.getItem('cet6_fav') || '[]');
  },

  saveWords() {
    localStorage.setItem('cet6_words', JSON.stringify(this.words));
  },

  saveWrong() {
    localStorage.setItem('cet6_wrong', JSON.stringify(this.wrongIds));
    this.updateWrongBadge();
  },

  saveFavorites() {
    localStorage.setItem('cet6_fav', JSON.stringify(this.favoriteIds));
  },

  getWrongWords() {
    return this.words.filter(w => this.wrongIds.includes(w.id));
  },

  getFavoriteWords() {
    return this.words.filter(w => this.favoriteIds.includes(w.id));
  },

  addWrong(wordId) {
    if (!this.wrongIds.includes(wordId)) {
      this.wrongIds.push(wordId);
      this.saveWrong();
    }
  },

  clearWrong() {
    this.wrongIds = [];
    this.saveWrong();
  },

  toggleFavorite(wordId) {
    const idx = this.favoriteIds.indexOf(wordId);
    if (idx > -1) {
      this.favoriteIds.splice(idx, 1);
    } else {
      this.favoriteIds.push(wordId);
    }
    this.saveFavorites();
  },

  isFavorite(wordId) {
    return this.favoriteIds.includes(wordId);
  },

  /* === Layout Switching === */
  bindLayoutButtons() {
    document.querySelectorAll('.layout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('appContainer').setAttribute('data-layout', btn.dataset.layout);
      });
    });
  },

  /* === Tab Routing === */
  bindTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.reviewMode && btn.dataset.tab !== 'quiz') {
          return;
        }
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  switchTab(tab) {
    if (this.reviewMode) return;
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    const content = document.getElementById('pageContent');
    switch (tab) {
      case 'quiz':      QuizPage.render(content); break;
      case 'wrongbook': WrongBookPage.render(content); break;
      case 'favorites': FavoritePage.render(content); break;
      case 'manage':    WordManagerPage.render(content); break;
    }
  },

  updateWrongBadge() {
    const badge = document.getElementById('wrongBadge');
    badge.textContent = this.wrongIds.length;
    badge.style.display = this.wrongIds.length > 0 ? 'flex' : 'none';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: 在浏览器中验证 Tab 切换和布局切换**

打开 `index.html`，点击各个 Tab 按钮，确认 tab 高亮切换。点击布局按钮，确认容器宽度变化。

---

### Task 5: 答题模块

**Files:**
- Create: `js/quiz.js`

- [ ] **Step 1: 编写答题模块完整代码**

```js
const QuizPage = {
  currentWord: null,
  options: [],
  answered: false,

  render(container) {
    this.answered = false;
    const word = this.pickWord();
    if (!word) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <p>词汇表为空，请先添加单词</p>
        </div>`;
      return;
    }
    this.currentWord = word;
    this.options = this.generateOptions(word);
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="quiz-area">
        <div class="quiz-word">${word.english}</div>
        <div class="quiz-options" id="quizOptions">
          ${this.options.map((opt, i) => `
            <button class="option-btn" data-index="${i}" data-is-correct="${opt.english === word.english}">
              <span class="option-letter">${letters[i]}</span>
              <span class="option-text">${opt.chinese}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-actions">
          <button class="fav-btn" id="quizFavBtn">
            ${App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏'}
          </button>
        </div>
      </div>`;

    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      this.render(container);
    });

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAnswer(e, container));
    });
  },

  pickWord() {
    let pool;
    if (App.reviewMode) {
      pool = App.reviewRemaining;
    } else {
      pool = App.words;
    }
    if (pool.length === 0) {
      if (App.reviewMode) {
        App.reviewMode = false;
        App.clearWrong();
        return null;
      }
      return null;
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  },

  generateOptions(correct) {
    const others = App.words.filter(w => w.id !== correct.id);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const wrongs = shuffled.slice(0, 3);
    const all = [correct, ...wrongs];
    return all.sort(() => Math.random() - 0.5);
  },

  handleAnswer(e, container) {
    if (this.answered) return;
    this.answered = true;
    const btn = e.currentTarget;
    const isCorrect = btn.dataset.isCorrect === 'true';

    document.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.isCorrect === 'true') b.classList.add('correct');
    });

    if (!isCorrect) {
      btn.classList.add('wrong');
      App.addWrong(this.currentWord.id);
      if (App.reviewMode) {
        App.reviewRemaining.push(this.currentWord);
      }
    } else {
      if (App.reviewMode) {
        const idx = App.reviewRemaining.findIndex(w => w.id === this.currentWord.id);
        if (idx > -1) App.reviewRemaining.splice(idx, 1);
      }
    }

    setTimeout(() => {
      if (App.reviewMode && App.reviewRemaining.length === 0) {
        App.reviewMode = false;
        App.clearWrong();
        alert('错题复习完成！错题本已清空。');
        App.switchTab('wrongbook');
      } else {
        this.render(container);
      }
    }, 1200);
  },
};
```

- [ ] **Step 2: 在浏览器中测试答题流程**

打开 `index.html`，选择"答题"Tab。确认：
- 显示英文单词和 4 个中文选项
- 选对时正确选项变绿，1.2 秒后进入下一题
- 选错时正确选项变绿、错误选项变红，1.2 秒后下一题
- 收藏按钮可点击切换收藏/取消收藏

---

### Task 6: 错题本模块

**Files:**
- Create: `js/wrongBook.js`

- [ ] **Step 1: 编写错题本模块完整代码**

```js
const WrongBookPage = {
  render(container) {
    const wrongWords = App.getWrongWords();

    if (wrongWords.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎯</div>
          <p>错题本为空，继续加油！</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="wrongbook-area">
        <div class="section-header">
          <h2>错题本</h2>
          <span class="count-badge">${wrongWords.length} 个单词</span>
        </div>
        <button class="btn-primary review-btn" id="startReviewBtn">开始复习错题</button>
        <div class="word-list" id="wrongList">
          ${wrongWords.map(w => `
            <div class="word-card">
              <div class="word-english">${w.english}</div>
              <div class="word-chinese">${w.chinese}</div>
            </div>
          `).join('')}
        </div>
      </div>`;

    document.getElementById('startReviewBtn').addEventListener('click', () => {
      App.reviewMode = true;
      App.reviewRemaining = [...wrongWords];
      App.switchTab('quiz');
    });
  },
};
```

- [ ] **Step 2: 在浏览器中测试错题本**

先答错几道题，切换到错题本 Tab：
- 确认显示答错的单词列表
- 点击"开始复习错题"进入复习模式
- 复习完成后弹出提示，错题本清空

---

### Task 7: 收藏本模块

**Files:**
- Create: `js/favorite.js`

- [ ] **Step 1: 编写收藏本模块完整代码**

```js
const FavoritePage = {
  render(container) {
    const favWords = App.getFavoriteWords();

    if (favWords.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <p>还没有收藏单词</p>
          <p class="sub-text">答题时点击收藏按钮即可添加</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="favorite-area">
        <div class="section-header">
          <h2>收藏本</h2>
          <span class="count-badge">${favWords.length} 个单词</span>
        </div>
        <div class="word-list" id="favList">
          ${favWords.map(w => `
            <div class="word-card">
              <div class="word-info">
                <div class="word-english">${w.english}</div>
                <div class="word-chinese">${w.chinese}</div>
              </div>
              <button class="btn-icon unfav-btn" data-id="${w.id}">取消收藏</button>
            </div>
          `).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.unfav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.toggleFavorite(Number(btn.dataset.id));
        this.render(container);
      });
    });
  },
};
```

- [ ] **Step 2: 在浏览器中测试收藏本**

在答题时收藏几个单词，切换到收藏本 Tab：
- 确认显示已收藏的单词
- 点击"取消收藏"确认单词从列表移除

---

### Task 8: 单词管理模块（上传 + 在线编辑）

**Files:**
- Create: `js/wordManager.js`

- [ ] **Step 1: 编写单词管理模块完整代码**

```js
const WordManagerPage = {
  render(container) {
    container.innerHTML = `
      <div class="manage-area">
        <div class="section-header">
          <h2>单词管理</h2>
          <span class="count-badge" id="wordCount">${App.words.length} 个单词</span>
        </div>

        <div class="manage-toolbar">
          <button class="btn-primary" id="addWordBtn">+ 添加单词</button>
          <label class="btn-outline upload-label">
            📁 上传文件导入
            <input type="file" id="fileUpload" accept=".txt,.docx" hidden>
          </label>
          <button class="btn-outline" id="resetWordsBtn">恢复默认</button>
        </div>

        <div id="addWordForm" class="add-form" style="display:none">
          <input type="text" id="newEnglish" placeholder="英文单词" class="form-input">
          <input type="text" id="newChinese" placeholder="中文释义" class="form-input">
          <button class="btn-primary" id="saveWordBtn">保存</button>
          <button class="btn-cancel" id="cancelAddBtn">取消</button>
        </div>

        <div class="word-table-wrap">
          <table class="word-table">
            <thead>
              <tr><th>英文</th><th>中文</th><th>操作</th></tr>
            </thead>
            <tbody id="wordTableBody">
              ${App.words.map(w => `
                <tr>
                  <td>${w.english}</td>
                  <td>${w.chinese}</td>
                  <td class="action-cell">
                    <button class="btn-sm edit-btn" data-id="${w.id}">编辑</button>
                    <button class="btn-sm del-btn" data-id="${w.id}">删除</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    this.bindEvents(container);
  },

  bindEvents(container) {
    document.getElementById('addWordBtn').addEventListener('click', () => {
      document.getElementById('addWordForm').style.display = 'flex';
    });

    document.getElementById('cancelAddBtn').addEventListener('click', () => {
      document.getElementById('addWordForm').style.display = 'none';
      document.getElementById('newEnglish').value = '';
      document.getElementById('newChinese').value = '';
    });

    document.getElementById('saveWordBtn').addEventListener('click', () => {
      const en = document.getElementById('newEnglish').value.trim();
      const zh = document.getElementById('newChinese').value.trim();
      if (!en || !zh) { alert('请填写完整'); return; }
      const maxId = App.words.length > 0 ? Math.max(...App.words.map(w => w.id)) : 0;
      App.words.push({ id: maxId + 1, english: en, chinese: zh });
      App.saveWords();
      this.render(container);
    });

    document.getElementById('fileUpload').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        let text;
        if (file.name.endsWith('.docx')) {
          text = await this.parseDocx(file);
        } else {
          text = await file.text();
        }
        const parsed = this.parseWords(text);
        if (parsed.length === 0) { alert('未能从文件中解析到单词'); return; }
        const maxId = App.words.length > 0 ? Math.max(...App.words.map(w => w.id)) : 0;
        parsed.forEach((w, i) => { w.id = maxId + i + 1; });
        App.words = [...App.words, ...parsed];
        App.saveWords();
        this.render(container);
      } catch (err) {
        alert('文件解析失败: ' + err.message);
      }
    });

    document.getElementById('resetWordsBtn').addEventListener('click', () => {
      if (confirm('确定恢复为默认词汇表？自定义添加的单词将丢失。')) {
        App.words = [...DEFAULT_WORDS];
        App.saveWords();
        this.render(container);
      }
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        App.words = App.words.filter(w => w.id !== id);
        App.wrongIds = App.wrongIds.filter(wid => wid !== id);
        App.favoriteIds = App.favoriteIds.filter(fid => fid !== id);
        App.saveWords(); App.saveWrong(); App.saveFavorites();
        this.render(container);
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const word = App.words.find(w => w.id === id);
        const newEn = prompt('修改英文:', word.english);
        if (newEn === null) return;
        const newZh = prompt('修改中文:', word.chinese);
        if (newZh === null) return;
        word.english = newEn.trim() || word.english;
        word.chinese = newZh.trim() || word.chinese;
        App.saveWords();
        this.render(container);
      });
    });
  },

  parseWords(text) {
    const words = [];
    const lines = text.split(/[\n\r]+/).filter(l => l.trim());
    for (const line of lines) {
      const parts = line.split(/[ \t,，]+/);
      const english = parts[0]?.trim();
      const chinese = parts.slice(1).join(' ').trim();
      if (english && chinese) {
        words.push({ english, chinese });
      }
    }
    return words;
  },

  async parseDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file('word/document.xml').async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXml, 'text/xml');
    const textNodes = xmlDoc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 't');
    let text = '';
    for (const node of textNodes) { text += node.textContent + '\n'; }
    return text;
  },
};
```

- [ ] **Step 2: 在浏览器中测试单词管理**

- 添加新单词 → 确认出现在表格中
- 编辑单词 → 确认修改生效
- 删除单词 → 确认移除
- 准备一个 txt 文件（格式：`english chinese` 每行一个）上传测试
- 准备一个 docx 文件上传测试
- 恢复默认 → 确认回到初始词汇表

---

### Task 9: 页面级样式补全

**Files:**
- Modify: `css/style.css`（追加样式）

- [ ] **Step 1: 追加答题区、单词列表、管理页等样式**

```css
/* === Quiz Area === */
.quiz-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.quiz-word {
  font-size: var(--font-word);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 40px;
  text-align: center;
  letter-spacing: 0.5px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-size: var(--font-option);
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}
.option-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: #f0f7ff;
}
.option-btn.correct {
  border-color: var(--color-success);
  background: #e8f8ef;
  color: var(--color-success);
}
.option-btn.wrong {
  border-color: var(--color-danger);
  background: #fdeaea;
  color: var(--color-danger);
}
.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.option-btn.correct .option-letter { background: #d4edda; }
.option-btn.wrong .option-letter { background: #f8d7da; }

/* === Quiz Actions === */
.quiz-actions {
  margin-top: 24px;
}
.fav-btn {
  padding: 10px 24px;
  border: 2px solid #f0c040;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
}
.fav-btn:hover { background: #fff8e0; }

/* === Empty State === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: var(--color-text-light);
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { font-size: 16px; }
.sub-text { font-size: 13px; margin-top: 8px; color: #999; }

/* === Section Header === */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-header h2 {
  font-size: 20px;
  font-weight: 700;
}
.count-badge {
  background: #f0f2f5;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--color-text-light);
}

/* === Buttons === */
.btn-primary {
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }

.btn-outline {
  padding: 10px 24px;
  background: #fff;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { background: #f0f7ff; }

.btn-cancel {
  padding: 10px 24px;
  background: #fff;
  color: #999;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
}

.btn-sm {
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  margin: 0 2px;
}
.edit-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.del-btn:hover { border-color: var(--color-danger); color: var(--color-danger); }

.upload-label { display: inline-block; cursor: pointer; }

/* === Word List & Cards === */
.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.word-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fafafa;
}
.word-english {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-text);
}
.word-chinese {
  font-size: 14px;
  color: var(--color-text-light);
  margin-top: 2px;
}

.review-btn { margin-bottom: 12px; }

/* === Word Management === */
.manage-area { padding-bottom: 20px; }
.manage-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}
.form-input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  min-width: 120px;
}
.form-input:focus { outline: none; border-color: var(--color-primary); }

.word-table-wrap {
  overflow-x: auto;
}
.word-table {
  width: 100%;
  border-collapse: collapse;
}
.word-table th, .word-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  font-size: 14px;
}
.word-table th {
  background: #f8f9fa;
  font-weight: 600;
  position: sticky;
  top: 0;
}
.word-table tbody tr:hover { background: #f8f9fa; }
.action-cell { white-space: nowrap; }

/* === Responsive Tweaks === */
@media (max-width: 440px) {
  .layout-bar { gap: 4px; padding: 8px; }
  .layout-btn { padding: 6px 10px; font-size: 12px; }
  .quiz-word { margin-bottom: 24px; }
}
```

- [ ] **Step 2: 在三种布局下分别验证视觉效果**

分别切换到 iPhone、iPad、MacBook Neo 三种布局，检查各页面显示是否正常。

---

### Task 10: 最终集成验证

- [ ] **Step 1: 端到端测试全流程**

1. 打开 `index.html`
2. 切换三种布局 → 确认都正常
3. 答题 5 题以上 → 包含答对和答错
4. 切换到错题本 → 确认有错误单词
5. 点"开始复习错题" → 完成复习 → 确认错题本清空
6. 收藏几个单词 → 切换到收藏本 → 确认显示
7. 取消收藏 → 确认移除
8. 切到管理页 → 添加单词 → 确认出现在答题中
9. 编辑单词 → 确认修改生效
10. 删除单词 → 确认移除
11. 创建测试 txt 文件，上传导入 → 确认新单词出现
12. 恢复默认 → 确认回到初始状态
13. 关闭浏览器 → 重新打开 → 确认数据和上次一致

- [ ] **Step 2: 修复发现的问题**

完成端到端测试中发现的任何 bug。
