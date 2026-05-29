const App = {
  words: [],
  wrongIds: [],
  favoriteIds: [],
  completedIds: [],
  currentTab: 'quiz',
  quizMode: 'single',
  reviewMode: false,
  reviewRemaining: [],

  init() {
    this.loadData();
    this.updateWrongBadge();
    this.bindLayoutButtons();
    this.bindTabButtons();
    this.switchTab('quiz');
  },

  /* === Data Persistence === */
  loadData() {
    const saved = JSON.parse(localStorage.getItem('cet6_words') || 'null');
    this.words = saved || DEFAULT_WORDS.map(w => ({...w}));
    this.wrongIds = JSON.parse(localStorage.getItem('cet6_wrong') || '[]');
    this.favoriteIds = JSON.parse(localStorage.getItem('cet6_fav') || '[]');
    this.completedIds = JSON.parse(localStorage.getItem('cet6_completed') || '[]');
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
    const trigger = document.getElementById('fabTrigger');
    const menu = document.getElementById('layoutMenu');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    menu.querySelectorAll('.layout-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const layout = item.dataset.layout;
        document.getElementById('appContainer').setAttribute('data-layout', layout);
        trigger.textContent = item.textContent.trim().charAt(0);
        menu.querySelectorAll('.layout-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        menu.style.display = 'none';
      });
    });

    document.addEventListener('click', () => {
      menu.style.display = 'none';
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
    if (this.reviewMode && tab !== 'quiz') return;
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
