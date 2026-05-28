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
