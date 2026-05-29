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
    this.renderSidebar();
    this.renderStats();
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
    this.renderStats();
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

  renderSidebar() {
    const sidebar = document.getElementById('desktopSidebar');
    if (!sidebar) return;
    const sidebarProg = document.getElementById('sidebarProgress');
    const total = this.words.length;
    const done = this.getCompletedCount();
    const circumference = 2 * Math.PI * 14;
    const offset = circumference - (done / Math.max(total, 1)) * circumference;
    sidebarProg.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 36 36" style="transform:rotate(-90deg)">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#E0E7FF" stroke-width="3"/>
        <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" stroke-width="3"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      </svg>
      <div style="font-size:11px;color:#818CF8;margin-top:4px;">${done}/${total}</div>`;

    sidebar.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', () => this.switchTab(item.dataset.tab));
    });
  },

  updateSidebarActive(tab) {
    const sidebar = document.getElementById('desktopSidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('.sidebar-nav-item').forEach(i => {
      i.classList.toggle('active', i.dataset.tab === tab);
    });
  },

  updateSidebarBadge() {
    const badge = document.getElementById('sidebarWrongBadge');
    if (badge) badge.textContent = this.wrongIds.length;
  },

  renderStats() {
    const stats = document.getElementById('desktopStats');
    if (!stats || stats.offsetWidth === 0) return;
    const total = this.words.length;
    const done = this.getCompletedCount();
    const wrong = this.wrongIds.length;
    const accuracy = (done + wrong) > 0 ? Math.round((done / (done + wrong)) * 100) : 0;
    const pct = total > 0 ? Math.round((done / Math.max(total, 1)) * 100) : 0;

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
          return w ? '<span class="stat-tag">' + w.english + '</span>' : '';
        }).join('')}</div>
      </div>`;
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
    this.updateSidebarActive(tab);
  },

  updateWrongBadge() {
    const badge = document.getElementById('wrongBadge');
    badge.textContent = this.wrongIds.length;
    badge.style.display = this.wrongIds.length > 0 ? 'flex' : 'none';
    this.updateSidebarBadge();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
