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
          <button class="fav-btn ${App.isFavorite(word.id) ? 'favorited' : ''}" id="quizFavBtn">
            <svg class="fav-icon-svg" viewBox="0 0 24 24" fill="${App.isFavorite(word.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            ${App.isFavorite(word.id) ? '已收藏' : '收藏'}
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
