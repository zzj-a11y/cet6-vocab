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
            <input type="file" id="fileUpload" accept=".txt,.docx,.json" hidden>
          </label>
          <button class="btn-outline" id="exportWordsBtn">📤 导出词汇表</button>
          <button class="btn-outline" id="resetProgressBtn">🔄 重置进度</button>
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
        let parsed;
        if (file.name.endsWith('.json')) {
          const text = await file.text();
          parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) { alert('JSON 格式错误：需要单词数组'); return; }
        } else if (file.name.endsWith('.docx')) {
          const text = await this.parseDocx(file);
          parsed = this.parseWords(text);
        } else {
          const text = await file.text();
          parsed = this.parseWords(text);
        }
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

    document.getElementById('exportWordsBtn').addEventListener('click', () => {
      const data = JSON.stringify(App.words, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cet6-words.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    document.getElementById('resetWordsBtn').addEventListener('click', () => {
      if (confirm('确定恢复为默认词汇表？自定义添加的单词将丢失。')) {
        App.words = DEFAULT_WORDS.map(w => ({...w}));
        App.saveWords();
        this.render(container);
      }
    });

    document.getElementById('resetProgressBtn').addEventListener('click', () => {
      if (confirm('确定重置背词进度？已完成的记录将清零。')) {
        App.clearCompleted();
        this.render(container);
      }
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        App.words = App.words.filter(w => w.id !== id);
        App.wrongIds = App.wrongIds.filter(wid => wid !== id);
        App.favoriteIds = App.favoriteIds.filter(fid => fid !== id);
        App.completedIds = App.completedIds.filter(cid => cid !== id);
        App.saveWords(); App.saveWrong(); App.saveFavorites(); App.saveCompleted();
        this.render(container);
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const word = App.words.find(w => w.id === id);
        const row = btn.closest('tr');
        const enCell = row.cells[0];
        const zhCell = row.cells[1];
        const actionCell = row.cells[2];
        const oldEn = enCell.textContent;
        const oldZh = zhCell.textContent;

        enCell.innerHTML = `<input type="text" class="form-input edit-input" value="${this.escapeHtml(oldEn)}">`;
        zhCell.innerHTML = `<input type="text" class="form-input edit-input" value="${this.escapeHtml(oldZh)}">`;
        actionCell.innerHTML = `
          <button class="btn-sm save-edit-btn" data-id="${id}" data-old-en="${this.escapeAttr(oldEn)}" data-old-zh="${this.escapeAttr(oldZh)}">保存</button>
          <button class="btn-sm cancel-edit-btn" data-id="${id}" data-old-en="${this.escapeAttr(oldEn)}" data-old-zh="${this.escapeAttr(oldZh)}">取消</button>
        `;

        row.querySelector('.save-edit-btn').addEventListener('click', () => {
          const newEn = enCell.querySelector('input').value.trim();
          const newZh = zhCell.querySelector('input').value.trim();
          if (!newEn || !newZh) { alert('请填写完整'); return; }
          word.english = newEn;
          word.chinese = newZh;
          App.saveWords();
          this.render(container);
        });

        row.querySelector('.cancel-edit-btn').addEventListener('click', () => {
          word.english = oldEn;
          word.chinese = oldZh;
          this.render(container);
        });

        enCell.querySelector('input').focus();
      });
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
