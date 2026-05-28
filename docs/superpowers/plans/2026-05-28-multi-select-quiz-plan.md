# 多选释义模式 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在答题页新增多选释义模式，用户需从 4 个中文选项中选出英文单词的全部正确释义。

**Architecture:** 修改 `js/quiz.js` 增加多选渲染和判定逻辑，`js/app.js` 增加 `quizMode` 状态，`css/style.css` 增加模式切换栏、复选框、三色反馈样式。复用现有错题本和收藏本机制。

**Tech Stack:** 纯原生 HTML/CSS/JS

---

### Task 1: App 状态 — 添加 quizMode

**Files:**
- Modify: `js/app.js:1-8`

- [ ] **Step 1: 在 App 对象中添加 quizMode 属性**

在 `js/app.js` 第 5 行后插入 `quizMode: 'single',`：

```js
const App = {
  words: [],
  wrongIds: [],
  favoriteIds: [],
  currentTab: 'quiz',
  quizMode: 'single',
  reviewMode: false,
  reviewRemaining: [],
```

- [ ] **Step 2: 验证语法并提交**

```bash
node --check js/app.js
git add js/app.js && git commit -m "feat: add quizMode state for single/multi select switching"
```

---

### Task 2: 答题模块 — 重写为支持单选/多选双模式

**Files:**
- Modify: `js/quiz.js`（重写整个文件）

- [ ] **Step 1: 重写 js/quiz.js**

```js
const QuizPage = {
  currentWord: null,
  options: [],
  answered: false,
  multiSelected: new Set(),

  render(container) {
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
    this.answered = false;
    this.multiSelected = new Set();

    if (App.quizMode === 'multi') {
      this.renderMulti(container, word);
    } else {
      this.renderSingle(container, word);
    }
  },

  /* ======== Single Select ======== */
  renderSingle(container, word) {
    this.options = this.generateSingleOptions(word);
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="mode-switch">
        <button class="mode-switch-btn active" data-mode="single">📝 单选题</button>
        <button class="mode-switch-btn" data-mode="multi">✅ 多选释义</button>
      </div>
      <div class="quiz-area">
        <div class="quiz-word">${word.english}</div>
        <div class="quiz-options" id="quizOptions">
          ${this.options.map((opt, i) => `
            <button class="option-btn" data-index="${i}" data-is-correct="${opt.isCorrect}">
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

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      this.render(container);
    });
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSingleAnswer(e, container));
    });
  },

  generateSingleOptions(correct) {
    const others = App.words.filter(w => w.id !== correct.id);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const wrongs = shuffled.slice(0, 3);
    const all = [
      { chinese: correct.chinese, isCorrect: true, sourceId: correct.id },
      ...wrongs.map(w => ({ chinese: w.chinese, isCorrect: false, sourceId: w.id }))
    ];
    return all.sort(() => Math.random() - 0.5);
  },

  handleSingleAnswer(e, container) {
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
      if (App.reviewMode) App.reviewRemaining.push(this.currentWord);
    } else {
      if (App.reviewMode) {
        const idx = App.reviewRemaining.findIndex(w => w.id === this.currentWord.id);
        if (idx > -1) App.reviewRemaining.splice(idx, 1);
      }
    }
    setTimeout(() => this.afterAnswer(container), 1200);
  },

  /* ======== Multi Select ======== */
  renderMulti(container, word) {
    this.options = this.generateMultiOptions(word);

    container.innerHTML = `
      <div class="mode-switch">
        <button class="mode-switch-btn" data-mode="single">📝 单选题</button>
        <button class="mode-switch-btn active" data-mode="multi">✅ 多选释义</button>
      </div>
      <div class="quiz-area">
        <div class="quiz-word">${word.english}</div>
        <div class="multi-hint">请选出所有正确的中文释义</div>
        <div class="quiz-options" id="quizOptions">
          ${this.options.map((opt, i) => `
            <div class="multi-option" data-index="${i}" data-is-correct="${opt.isCorrect}">
              <div class="multi-checkbox"></div>
              <span class="option-text">${opt.chinese}</span>
            </div>
          `).join('')}
        </div>
        <div class="quiz-actions">
          <button class="fav-btn multi-fav" id="quizFavBtn">
            ${App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏'}
          </button>
          <button class="btn-submit" id="multiSubmitBtn">确认提交</button>
        </div>
        <div class="multi-result" id="multiResult"></div>
      </div>`;

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      this.render(container);
    });
    document.querySelectorAll('.multi-option').forEach(el => {
      el.addEventListener('click', () => {
        if (this.answered) return;
        const idx = Number(el.dataset.index);
        if (this.multiSelected.has(idx)) {
          this.multiSelected.delete(idx);
          el.classList.remove('selected');
        } else {
          this.multiSelected.add(idx);
          el.classList.add('selected');
        }
      });
    });
    document.getElementById('multiSubmitBtn').addEventListener('click', () => {
      if (this.multiSelected.size === 0) return;
      this.handleMultiAnswer(container);
    });
  },

  generateMultiOptions(word) {
    const meanings = word.chinese.split(/[，,；;、]/).map(s => s.trim()).filter(s => s);
    const maxCorrect = Math.min(meanings.length, 4);
    const selectedCorrect = meanings.sort(() => Math.random() - 0.5).slice(0, maxCorrect);
    const distractorCount = 4 - maxCorrect;

    const otherWords = App.words.filter(w => w.id !== word.id);
    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5);
    const distractors = [];
    for (const w of shuffledOthers) {
      const wm = w.chinese.split(/[，,；;、]/).map(s => s.trim()).filter(s => s);
      for (const m of wm) {
        if (!selectedCorrect.includes(m) && !distractors.some(d => d.chinese === m)) {
          distractors.push({ chinese: m, isCorrect: false });
          if (distractors.length >= distractorCount) break;
        }
      }
      if (distractors.length >= distractorCount) break;
    }

    const all = [
      ...selectedCorrect.map(m => ({ chinese: m, isCorrect: true })),
      ...distractors
    ];
    return all.sort(() => Math.random() - 0.5);
  },

  handleMultiAnswer(container) {
    this.answered = true;
    const correctIndices = [];
    const userIndices = [...this.multiSelected];
    this.options.forEach((opt, i) => { if (opt.isCorrect) correctIndices.push(i); });

    const correctSet = new Set(correctIndices);
    const userSet = new Set(userIndices);
    const allCorrect = correctIndices.every(i => userSet.has(i));
    const noWrong = userIndices.every(i => correctSet.has(i));
    const isFullyCorrect = allCorrect && noWrong;

    document.querySelectorAll('.multi-option').forEach(el => {
      const idx = Number(el.dataset.index);
      const isCorrectOpt = el.dataset.isCorrect === 'true';
      const isSelected = userSet.has(idx);
      if (isCorrectOpt && isSelected) el.classList.add('correct-reveal');
      else if (isCorrectOpt && !isSelected) el.classList.add('missed-reveal');
      else if (!isCorrectOpt && isSelected) el.classList.add('wrong-reveal');
    });

    const resultDiv = document.getElementById('multiResult');
    if (isFullyCorrect) {
      resultDiv.innerHTML = '<div class="result-msg correct">✓ 完全正确！</div>';
    } else if (!noWrong) {
      resultDiv.innerHTML = '<div class="result-msg wrong">✗ 选入了错误项</div>';
    } else {
      resultDiv.innerHTML = '<div class="result-msg partial">⚠ 有遗漏的正确释义</div>';
    }
    resultDiv.innerHTML += `
      <div class="multi-legend">
        <span class="legend-item"><span class="legend-dot dot-correct"></span> 选对</span>
        <span class="legend-item"><span class="legend-dot dot-missed"></span> 遗漏</span>
        <span class="legend-item"><span class="legend-dot dot-wrong"></span> 选错</span>
      </div>
      <button class="btn-next" id="multiNextBtn">下一题 →</button>`;

    if (!isFullyCorrect) {
      App.addWrong(this.currentWord.id);
      if (App.reviewMode) App.reviewRemaining.push(this.currentWord);
    } else {
      if (App.reviewMode) {
        const idx = App.reviewRemaining.findIndex(w => w.id === this.currentWord.id);
        if (idx > -1) App.reviewRemaining.splice(idx, 1);
      }
    }

    document.getElementById('multiSubmitBtn').style.display = 'none';
    document.getElementById('multiNextBtn').addEventListener('click', () => {
      this.afterAnswer(container);
    });
  },

  /* ======== Shared ======== */
  pickWord() {
    let pool;
    if (App.reviewMode) {
      pool = App.reviewRemaining;
    } else if (App.quizMode === 'multi') {
      pool = App.words.filter(w => {
        const meanings = w.chinese.split(/[，,；;、]/).filter(s => s.trim());
        return meanings.length >= 2;
      });
    } else {
      pool = App.words;
    }
    if (pool.length === 0) {
      if (App.reviewMode) { App.reviewMode = false; App.clearWrong(); }
      return null;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  },

  afterAnswer(container) {
    if (App.reviewMode && App.reviewRemaining.length === 0) {
      App.reviewMode = false;
      App.clearWrong();
      alert('错题复习完成！错题本已清空。');
      App.switchTab('wrongbook');
    } else {
      this.render(container);
    }
  },

  bindModeSwitch(container) {
    document.querySelectorAll('.mode-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.quizMode = btn.dataset.mode;
        this.render(container);
      });
    });
  },
};
```

- [ ] **Step 2: 验证语法并提交**

```bash
node --check js/quiz.js
git add js/quiz.js && git commit -m "feat: add multi-select quiz mode with mode switch"
```

---

### Task 3: CSS — 多选模式样式

**Files:**
- Modify: `css/style.css`（追加样式到文件末尾）

- [ ] **Step 1: 追加多选模式样式**

在 `css/style.css` 末尾追加：

```css
/* ============================================
   Mode Switch Bar
   ============================================ */
.mode-switch {
  display: flex;
  padding: 4px;
  gap: 4px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.mode-switch-btn {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  min-height: 44px;
}
.mode-switch-btn:hover {
  background: rgba(255,255,255,0.6);
  color: var(--color-primary);
}
.mode-switch-btn.active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(91,95,239,0.2);
}

/* ============================================
   Multi-Select Quiz
   ============================================ */
.multi-hint {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-danger);
  margin-bottom: 20px;
  margin-top: -24px;
}

.multi-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: var(--border-width) solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-size: var(--font-option);
  font-weight: 500;
  color: var(--color-text);
  transition: all var(--transition-fast);
  user-select: none;
  min-height: 56px;
  box-shadow: 0 2px 8px rgba(79,70,229,0.03);
}
.multi-option:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-bg);
}
.multi-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  box-shadow: 0 0 0 3px rgba(91,95,239,0.10);
}

/* Multi Checkbox */
.multi-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 3px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-size: 13px;
  font-weight: 800;
}
.multi-option.selected .multi-checkbox {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.multi-option.selected .multi-checkbox::after {
  content: '✓';
}

/* Multi Reveal States */
.multi-option.correct-reveal {
  border-color: var(--color-success);
  background: var(--color-success-bg);
}
.multi-option.correct-reveal .multi-checkbox {
  background: var(--color-success);
  border-color: var(--color-success);
}
.multi-option.correct-reveal .multi-checkbox::after {
  content: '✓';
  color: #fff;
}
.multi-option.missed-reveal {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
}
.multi-option.missed-reveal .multi-checkbox {
  background: var(--color-warning);
  border-color: var(--color-warning);
}
.multi-option.missed-reveal .multi-checkbox::after {
  content: '!';
  color: #fff;
}
.multi-option.wrong-reveal {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
}
.multi-option.wrong-reveal .multi-checkbox {
  background: var(--color-danger);
  border-color: var(--color-danger);
}
.multi-option.wrong-reveal .multi-checkbox::after {
  content: '✕';
  color: #fff;
}

/* Multi Submit Button */
.btn-submit {
  padding: 12px 32px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  min-height: 48px;
  box-shadow: 0 4px 14px rgba(91,95,239,0.25);
}
.btn-submit:hover {
  background: #4F46E5;
  transform: translateY(-1px);
}

/* Multi Result */
.multi-result {
  margin-top: 20px;
  text-align: center;
}
.result-msg {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}
.result-msg.correct { color: var(--color-success); }
.result-msg.partial { color: var(--color-warning); }
.result-msg.wrong { color: var(--color-danger); }

.multi-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 8px 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}
.dot-correct { background: var(--color-success); }
.dot-missed { background: var(--color-warning); }
.dot-wrong { background: var(--color-danger); }

.btn-next {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 32px;
  background: var(--color-surface);
  color: var(--color-primary);
  border: 3px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  min-height: 44px;
}
.btn-next:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
}

/* Multi Fav positioning */
.multi-fav {
  margin-right: 12px;
}
```

- [ ] **Step 2: 验证提交**

检查 CSS 文件追加位置正确，没有破坏已有规则。

```bash
git add css/style.css && git commit -m "feat: add multi-select quiz styles - mode switch, checkboxes, three-color feedback"
```

---

### Task 4: 清理和最终验证

- [ ] **Step 1: 清理 demo 文件**

```bash
git rm demo-multi-select.html
git commit -m "chore: remove multi-select mockup demo"
```

- [ ] **Step 2: 端到端测试**

1. 打开 `index.html`
2. 答题页默认显示单选题模式（顶部有切换栏）
3. 切换到"多选释义"
4. 确认显示多义词 + 复选框中选项
5. 勾选选项，确认可多选、可取消
6. 点"确认提交"，确认三色反馈正确
7. 选错时确认单词进入错题本
8. 点"下一题"确认继续
9. 切回单选题模式确认正常

- [ ] **Step 3: 推送到 GitHub Pages**

```bash
git push
```
