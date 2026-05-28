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
