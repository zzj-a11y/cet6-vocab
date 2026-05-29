const QuizPage = {
  currentWord: null,
  options: [],
  answered: false,
  multiSelected: new Set(),
  history: [],

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
        ${this.renderProgressRing()}
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
          ${this.history.length > 0 ? '<button class="btn-prev" id="prevBtn">⬅ 上一题</button>' : ''}
        </div>
      </div>`;

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      document.getElementById('quizFavBtn').innerHTML = App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏';
    });
    if (this.history.length > 0) {
      document.getElementById('prevBtn').addEventListener('click', () => {
        this.showPrevious(container);
      });
    }
    container.querySelectorAll('.option-btn').forEach(btn => {
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

    container.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.isCorrect === 'true') b.classList.add('correct');
    });
    if (!isCorrect) {
      btn.classList.add('wrong');
      App.addWrong(this.currentWord.id);
      if (App.reviewMode) App.reviewRemaining.push(this.currentWord);
    } else {
      App.addCompleted(this.currentWord.id);
      if (App.reviewMode) {
        const idx = App.reviewRemaining.findIndex(w => w.id === this.currentWord.id);
        if (idx > -1) App.reviewRemaining.splice(idx, 1);
      }
    }
    setTimeout(() => this.afterAnswer(container), 400);
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
        ${this.renderProgressRing()}
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
          ${this.history.length > 0 ? '<button class="btn-prev multi-prev" id="prevBtn">⬅ 上一题</button>' : ''}
        </div>
        <div class="multi-result" id="multiResult"></div>
      </div>`;

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      document.getElementById('quizFavBtn').innerHTML = App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏';
    });
    if (this.history.length > 0) {
      document.getElementById('prevBtn').addEventListener('click', () => {
        this.showPrevious(container);
      });
    }
    container.querySelectorAll('.multi-option').forEach(el => {
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

    container.querySelectorAll('.multi-option').forEach(el => {
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
      App.addCompleted(this.currentWord.id);
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

  renderProgressRing() {
    const total = App.words.length;
    const done = App.getCompletedCount();
    const remaining = total - done;
    const circumference = 2 * Math.PI * 15;
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
      this.history.push({
        word: this.currentWord,
        options: this.options,
        answered: this.answered,
        multiSelected: new Set(this.multiSelected)
      });
      this.render(container);
    }
  },

  showPrevious(container) {
    if (this.history.length === 0) return;
    const prev = this.history.pop();
    this.currentWord = prev.word;
    this.options = prev.options;
    this.answered = true;
    this.multiSelected = prev.multiSelected;

    if (App.quizMode === 'multi') {
      this.showPreviousMulti(container, prev);
    } else {
      this.showPreviousSingle(container, prev);
    }
  },

  showPreviousSingle(container, prev) {
    const word = this.currentWord;
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="mode-switch">
        <button class="mode-switch-btn active" data-mode="single">📝 单选题</button>
        <button class="mode-switch-btn" data-mode="multi">✅ 多选释义</button>
      </div>
      <div class="quiz-area">
        <div class="quiz-word">${word.english}</div>
        ${this.renderProgressRing()}
        <div class="quiz-options" id="quizOptions">
          ${prev.options.map((opt, i) => {
            const wasCorrect = opt.isCorrect;
            const wasPicked = i === prev.options.findIndex(o => o === prev.options.find(x => x.isCorrect));
            let cls = '';
            if (wasCorrect) cls = 'correct';
            return `
            <button class="option-btn ${cls}" data-index="${i}" data-is-correct="${opt.isCorrect}" disabled>
              <span class="option-letter">${letters[i]}</span>
              <span class="option-text">${opt.chinese}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="quiz-actions">
          <button class="fav-btn" id="quizFavBtn">
            ${App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏'}
          </button>
          <button class="btn-next" id="prevNextBtn">下一题 →</button>
        </div>
      </div>`;

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      document.getElementById('quizFavBtn').innerHTML = App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏';
    });
    document.getElementById('prevNextBtn').addEventListener('click', () => {
      this.render(container);
    });
  },

  showPreviousMulti(container, prev) {
    const word = this.currentWord;

    container.innerHTML = `
      <div class="mode-switch">
        <button class="mode-switch-btn" data-mode="single">📝 单选题</button>
        <button class="mode-switch-btn active" data-mode="multi">✅ 多选释义</button>
      </div>
      <div class="quiz-area">
        <div class="quiz-word">${word.english}</div>
        <div class="multi-hint">请选出所有正确的中文释义</div>
        ${this.renderProgressRing()}
        <div class="quiz-options" id="quizOptions">
          ${prev.options.map((opt, i) => {
            let cls = '';
            if (opt.isCorrect && prev.multiSelected.has(i)) cls = 'correct-reveal';
            else if (opt.isCorrect && !prev.multiSelected.has(i)) cls = 'missed-reveal';
            else if (!opt.isCorrect && prev.multiSelected.has(i)) cls = 'wrong-reveal';
            return `
            <div class="multi-option ${cls}" data-index="${i}" data-is-correct="${opt.isCorrect}">
              <div class="multi-checkbox"></div>
              <span class="option-text">${opt.chinese}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="quiz-actions">
          <button class="fav-btn multi-fav" id="quizFavBtn">
            ${App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏'}
          </button>
          <button class="btn-next" id="prevNextBtn">下一题 →</button>
        </div>
        <div class="multi-result" id="multiResult">
          <div class="multi-legend">
            <span class="legend-item"><span class="legend-dot dot-correct"></span> 选对</span>
            <span class="legend-item"><span class="legend-dot dot-missed"></span> 遗漏</span>
            <span class="legend-item"><span class="legend-dot dot-wrong"></span> 选错</span>
          </div>
        </div>
      </div>`;

    this.bindModeSwitch(container);
    document.getElementById('quizFavBtn').addEventListener('click', () => {
      App.toggleFavorite(word.id);
      document.getElementById('quizFavBtn').innerHTML = App.isFavorite(word.id) ? '⭐ 已收藏' : '🤍 收藏';
    });
    document.getElementById('prevNextBtn').addEventListener('click', () => {
      this.render(container);
    });
  },

  bindModeSwitch(container) {
    container.querySelectorAll('.mode-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.quizMode = btn.dataset.mode;
        this.history = [];
        this.render(container);
      });
    });
  },
};
