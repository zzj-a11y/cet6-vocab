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
