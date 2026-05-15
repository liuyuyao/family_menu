const App = {
  currentPage: 'recommend',

  init() {
    this.migrateStorageKeys();
    this.migrateRecipes();
    this.bindNav();
    this.bindEvents();
    this.renderRecipes();
    this.renderInventory();
    this.renderHistory();
    this.generateRecommend();
  },

  migrateRecipes() {
    const seafoodNames = new Set(['清蒸虾', '清蒸鲈鱼', '家烧黄鱼', '照烧三文鱼', '炒蛏子', '宝宝版清蒸鳕鱼']);
    const recipes = DataStore.getRecipes();
    let changed = false;
    recipes.forEach(r => {
      if (seafoodNames.has(r.name) && r.category === 'big_meat') {
        r.category = 'seafood';
        changed = true;
      }
    });
    if (changed) DataStore.saveRecipes(recipes);
  },

  migrateStorageKeys() {
    const oldKeys = {
      'fanfan_recipes': 'family_recipes',
      'fanfan_menus': 'family_menus',
      'fanfan_inventory': 'family_inventory',
      'fanfan_settings': 'family_settings'
    };
    for (const [oldK, newK] of Object.entries(oldKeys)) {
      const data = localStorage.getItem(oldK);
      if (data && !localStorage.getItem(newK)) {
        localStorage.setItem(newK, data);
      }
    }
  },

  // 路由切换
  bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.switchPage(page);
      });
    });
  },

  switchPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));

    if (page === 'recipes') this.renderRecipes();
    if (page === 'inventory') this.renderInventory();
    if (page === 'history') this.renderHistory();
  },

  // 事件绑定
  bindEvents() {
    // 生成菜单
    document.getElementById('btn-generate').addEventListener('click', () => this.generateRecommend());

    // 菜谱搜索与筛选
    document.getElementById('recipe-search').addEventListener('input', () => this.renderRecipes());
    document.getElementById('recipe-filter').addEventListener('change', () => this.renderRecipes());

    // 导入导出
    document.getElementById('btn-add-recipe').addEventListener('click', () => this.openEditor());
    document.getElementById('btn-import-csv').addEventListener('click', () => document.getElementById('file-csv').click());
    document.getElementById('file-csv').addEventListener('change', (e) => this.handleImportCSV(e));
    document.getElementById('btn-export-json').addEventListener('click', () => this.handleExport());

    // 食材管理
    document.getElementById('btn-add-inv').addEventListener('click', () => this.addInventory());
    document.getElementById('btn-clear-inv').addEventListener('click', () => this.clearInventory());
  },

  // 今日推荐
  generateRecommend() {
    const recipes = DataStore.getRecipes();
    const inventory = DataStore.getInventory();
    const history = DataStore.getMenus();
    const babyMode = document.getElementById('baby-mode').checked;

    const results = Engine.generateTwoMenus(recipes, inventory, history, babyMode);
    this.renderRecommend(results, inventory);
  },

  renderRecommend(results, inventory) {
    const container = document.getElementById('recommend-result');
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="empty-state">点击上方按钮生成今日菜单</div>';
      return;
    }

    const res = results[0];
    const menu = res.menu;
    const shopping = Engine.generateShoppingList(menu, inventory);

    let html = `<div class="menu-group">
      <div class="menu-group-header">
        <span class="menu-group-title">今日菜单</span>
        <span class="menu-group-score">综合得分 ${Math.round(res.score)}</span>
      </div>`;

    menu.forEach((r, dishIdx) => {
      const tagClass = {
        big_meat: 'tag-big', small_meat: 'tag-small', vegetable: 'tag-veg',
        soup: 'tag-soup', staple: 'tag-staple', seafood: 'tag-seafood'
      }[r.category] || 'tag-staple';
      const tagName = { big_meat: '大荤', small_meat: '小荤', vegetable: '素菜', soup: '汤', staple: '主食', seafood: '海鲜' }[r.category] || '主食';
      const canSwap = !r.isRice;
      html += `<div class="menu-item">
        <div class="menu-item-info">
          <div class="menu-item-name">${r.name}</div>
          <div class="menu-item-ing">${(r.ingredients || []).join('、')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="tag ${tagClass}" onclick="App.togglePicker(0, ${dishIdx})" style="cursor:pointer;">${tagName}</span>
          ${canSwap ? `<button class="btn-small" onclick="App.swapRecipe(0, ${dishIdx})" style="padding:2px 6px;font-size:0.7rem;">🎲</button><button class="btn-small" onclick="App.showDishPicker(0, ${dishIdx})" style="padding:2px 6px;font-size:0.7rem;">📋</button>` : ''}
        </div>
      </div>`;
      html += `<div class="cat-picker" id="picker-0-${dishIdx}" style="display:none;padding:6px 0;border-bottom:1px solid #F5F0EB;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'big_meat')" style="padding:2px 8px;font-size:0.7rem;">大荤</button>
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'seafood')" style="padding:2px 8px;font-size:0.7rem;">海鲜</button>
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'small_meat')" style="padding:2px 8px;font-size:0.7rem;">小荤</button>
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'vegetable')" style="padding:2px 8px;font-size:0.7rem;">素菜</button>
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'soup')" style="padding:2px 8px;font-size:0.7rem;">汤</button>
          <button class="btn-small" onclick="App.changeCategory(0, ${dishIdx}, 'staple')" style="padding:2px 8px;font-size:0.7rem;">主食</button>
        </div>
      </div>`;
      html += `<div class="dish-picker" id="dish-picker-0-${dishIdx}" style="display:none;"></div>`;
    });

    html += `<div class="menu-actions">
      <button class="btn-primary" onclick="App.confirmMenu(0)">确认用这套</button>
      <button class="btn-secondary" onclick="App.swapRecipe(0)">换一组</button>
    </div>`;

    html += '</div>';

    html += `<div class="shopping-list" style="margin-top:12px;">
      <h4>待采购 (${shopping.length}项)</h4>
      <ul>${shopping.length ? shopping.map(s => `<li>☐ ${s}</li>`).join('') : '<li>家里都有，无需采购</li>'}</ul>
    </div>`;

    container.innerHTML = html;
    this._lastResults = results;
  },

  confirmMenu(idx) {
    if (!this._lastResults || !this._lastResults[idx]) return;
    const menu = this._lastResults[idx].menu;
    const today = Engine.todayStr();

    // 保存历史
    const menus = DataStore.getMenus();
    menus.unshift({
      date: today,
      recipes: menu.map(r => r.name),
      source: 'auto'
    });
    DataStore.saveMenus(menus);

    // 更新 lastEaten
    const recipes = DataStore.getRecipes();
    recipes.forEach(r => {
      if (menu.some(m => m.name === r.name)) {
        r.lastEaten = today;
      }
    });
    DataStore.saveRecipes(recipes);

    alert('已确认今日菜单，并记录到历史！');
    this.renderHistory();
  },

  swapRecipe(menuIdx, dishIdx) {
    if (!this._lastResults || !this._lastResults[menuIdx]) return;
    const menu = this._lastResults[menuIdx].menu;
    const recipes = DataStore.getRecipes();
    const inventory = DataStore.getInventory();
    const babyMode = document.getElementById('baby-mode').checked;
    const today = Engine.todayStr();

    // 如果 dishIdx 未指定，表示"换一组"（至少换2道）
    if (dishIdx === undefined) {
      const swapable = menu.map((r, i) => ({ r, i })).filter(x => !x.r.isRice);
      if (swapable.length < 2) return;
      const shuffled = swapable.sort(() => Math.random() - 0.5);
      const count = Math.min(shuffled.length, 2 + Math.floor(Math.random() * 2)); // 换2或3道
      const toSwap = shuffled.slice(0, count);
      const usedNames = new Set(menu.map(r => r.name));

      for (const item of toSwap) {
        const idx = item.i;
        const oldCat = menu[idx].category;
        let pool = recipes.filter(r => r.category === oldCat && !usedNames.has(r.name));
        if (!pool.length) {
          pool = recipes.filter(r => !usedNames.has(r.name));
        }
        if (!pool.length) continue;
        pool.forEach(r => { r._score = Engine.scoreRecipe(r, inventory, DataStore.getMenus(), today, babyMode); });
        pool.sort((a, b) => b._score - a._score);
        const topPool = pool.slice(0, 5);
        const picked = Engine.pickWeightedRandom(topPool);
        usedNames.delete(menu[idx].name);
        menu[idx] = { ...picked };
        usedNames.add(picked.name);
      }

      this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
      this.renderRecommend(this._lastResults, inventory);
      return;
    }

    // 单道菜替换（点击"换"按钮时）
    const target = menu[dishIdx];
    if (!target || target.isRice) return;

    const oldCat = target.category;
    const usedNames = new Set(menu.map(r => r.name));
    let pool = recipes.filter(r => r.category === oldCat && !usedNames.has(r.name));
    if (!pool.length) {
      pool = recipes.filter(r => !usedNames.has(r.name));
    }
    if (!pool.length) return;

    pool.forEach(r => { r._score = Engine.scoreRecipe(r, inventory, DataStore.getMenus(), today, babyMode); });
    pool.sort((a, b) => b._score - a._score);
    const topPool = pool.slice(0, 5);
    const picked = Engine.pickWeightedRandom(topPool);
    menu[dishIdx] = { ...picked };
    this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
    this.renderRecommend(this._lastResults, inventory);
  },

  // 菜谱列表
  renderRecipes() {
    const search = document.getElementById('recipe-search').value.toLowerCase();
    const filter = document.getElementById('recipe-filter').value;
    let recipes = DataStore.getRecipes();

    if (search) {
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search) ||
        (r.ingredients || []).some(i => i.toLowerCase().includes(search))
      );
    }
    if (filter) {
      recipes = recipes.filter(r => r.category === filter);
    }

    const container = document.getElementById('recipe-list');
    if (!recipes.length) {
      container.innerHTML = '<div class="empty-state">没有找到匹配的菜谱</div>';
      return;
    }

    container.innerHTML = recipes.map((r, idx) => {
      const stars = '★'.repeat(r.preference) + '☆'.repeat(5 - r.preference);
      const catName = { big_meat: '大荤', small_meat: '小荤', vegetable: '素菜', soup: '汤', staple: '主食', seafood: '海鲜' }[r.category];
      return `<div class="recipe-row">
        <div class="info">
          <div class="name">${r.name} <span style="font-size:0.75rem;color:#999">(${catName})</span></div>
          <div class="sub">${r.cookTime}min · ${(r.ingredients || []).join('、')}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <div class="pref" data-name="${r.name}">${stars.split('').map((s, i) =>
            `<span class="star ${s === '☆' ? 'empty' : ''}" data-val="${i+1}">${s}</span>`
          ).join('')}</div>
          <button class="btn-small" onclick="App.openEditor('${r.name}')" style="padding:4px 8px;font-size:0.75rem;">编辑</button>
          <button class="btn-small" onclick="App.deleteRecipe('${r.name}')" style="padding:4px 8px;font-size:0.75rem;background:#FFEBEE;color:#C62828;border-color:#EF9A9A;">删除</button>
        </div>
      </div>`;
    }).join('');

    // 绑定星星点击
    container.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', (e) => {
        const name = e.target.closest('.pref').dataset.name;
        const val = parseInt(e.target.dataset.val);
        this.setPreference(name, val);
      });
    });
  },

  setPreference(name, val) {
    const recipes = DataStore.getRecipes();
    const r = recipes.find(x => x.name === name);
    if (r) { r.preference = val; DataStore.saveRecipes(recipes); this.renderRecipes(); }
  },

  // 历史菜单
  renderHistory() {
    const menus = DataStore.getMenus();
    const container = document.getElementById('history-list');
    if (!menus.length) {
      container.innerHTML = '<div class="empty-state">还没有历史记录</div>';
      return;
    }
    container.innerHTML = menus.slice(0, 30).map(m => `
      <div class="card">
        <div class="history-date">${m.date}</div>
        <div class="history-recipes">${m.recipes.join('、')}</div>
      </div>
    `).join('');
  },

  // 食材管理
  renderInventory() {
    const inv = DataStore.getInventory();
    const container = document.getElementById('inventory-list');
    if (!inv.length) {
      container.innerHTML = '<div class="empty-state">还没有库存食材</div>';
      return;
    }
    container.innerHTML = inv.map((item, idx) => `
      <div class="inv-item">
        <span>${item.name} ${item.quantity}${item.unit}</span>
        <button onclick="App.removeInventory(${idx})">删除</button>
      </div>
    `).join('');
  },

  addInventory() {
    const name = document.getElementById('inv-name').value.trim();
    const qty = document.getElementById('inv-qty').value.trim();
    const unit = document.getElementById('inv-unit').value.trim();
    if (!name) return;
    const inv = DataStore.getInventory();
    inv.push({ name, quantity: qty || '', unit: unit || '', addedDate: Engine.todayStr() });
    DataStore.saveInventory(inv);
    document.getElementById('inv-name').value = '';
    document.getElementById('inv-qty').value = '';
    document.getElementById('inv-unit').value = '';
    this.renderInventory();
  },

  removeInventory(idx) {
    const inv = DataStore.getInventory();
    inv.splice(idx, 1);
    DataStore.saveInventory(inv);
    this.renderInventory();
  },

  clearInventory() {
    if (!confirm('确定清空所有库存食材？')) return;
    DataStore.saveInventory([]);
    this.renderInventory();
  },

  // 导入导出
  handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const recipes = DataStore.parseCSV(text);
      if (recipes.length) {
        // 保留lastEaten
        const old = DataStore.getRecipes();
        recipes.forEach(r => {
          const o = old.find(x => x.name === r.name);
          if (o) r.lastEaten = o.lastEaten;
        });
        DataStore.saveRecipes(recipes);
        alert('导入成功，共 ' + recipes.length + ' 道菜');
        this.renderRecipes();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  handleExport() {
    const json = DataStore.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FamilyMenu_backup_' + Engine.todayStr() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  openEditor(name) {
    const editor = document.getElementById('recipe-editor');
    const title = document.getElementById('editor-title');
    editor.style.display = 'block';
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (name) {
      const recipes = DataStore.getRecipes();
      const r = recipes.find(x => x.name === name);
      if (!r) return;
      title.textContent = '编辑菜谱';
      document.getElementById('edit-old-name').value = r.name;
      document.getElementById('edit-name').value = r.name;
      document.getElementById('edit-category').value = r.category;
      document.getElementById('edit-main').value = r.mainIngredient || '';
      document.getElementById('edit-pref').value = r.preference;
      document.getElementById('edit-time').value = r.cookTime;
      document.getElementById('edit-diff').value = r.difficulty || 'easy';
      const ings = r.ingredients || [];
      for (let i = 0; i < 5; i++) {
        document.getElementById('edit-ing' + (i + 1)).value = ings[i] || '';
      }
    } else {
      title.textContent = '新增菜谱';
      document.getElementById('edit-old-name').value = '';
      document.getElementById('edit-name').value = '';
      document.getElementById('edit-category').value = 'big_meat';
      document.getElementById('edit-main').value = '';
      document.getElementById('edit-pref').value = '3';
      document.getElementById('edit-time').value = '30';
      document.getElementById('edit-diff').value = 'easy';
      for (let i = 1; i <= 5; i++) {
        document.getElementById('edit-ing' + i).value = '';
      }
    }
  },

  closeEditor() {
    document.getElementById('recipe-editor').style.display = 'none';
  },

  saveRecipe() {
    const oldName = document.getElementById('edit-old-name').value;
    const name = document.getElementById('edit-name').value.trim();
    const category = document.getElementById('edit-category').value;
    const mainIngredient = document.getElementById('edit-main').value.trim();
    const preference = parseInt(document.getElementById('edit-pref').value) || 3;
    const cookTime = parseInt(document.getElementById('edit-time').value) || 30;
    const difficulty = document.getElementById('edit-diff').value;
    const ingredients = [];
    for (let i = 1; i <= 5; i++) {
      const v = document.getElementById('edit-ing' + i).value.trim();
      if (v) ingredients.push(v);
    }
    if (!name) { alert('请输入菜名'); return; }
    const recipes = DataStore.getRecipes();
    if (oldName) {
      const idx = recipes.findIndex(x => x.name === oldName);
      if (idx >= 0) {
        recipes[idx] = { ...recipes[idx], name, category, mainIngredient, preference, cookTime, difficulty, ingredients };
      }
    } else {
      if (recipes.some(x => x.name === name)) {
        alert('该菜名已存在'); return;
      }
      recipes.push({ name, category, mainIngredient, preference, cookTime, difficulty, ingredients, lastEaten: null });
    }
    DataStore.saveRecipes(recipes);
    this.closeEditor();
    this.renderRecipes();
  },

  deleteRecipe(name) {
    if (!confirm('确定删除「' + name + '」吗？')) return;
    const recipes = DataStore.getRecipes();
    const filtered = recipes.filter(x => x.name !== name);
    DataStore.saveRecipes(filtered);
    this.renderRecipes();
  },

  togglePicker(menuIdx, dishIdx) {
    const picker = document.getElementById('picker-' + menuIdx + '-' + dishIdx);
    if (!picker) return;
    const wasVisible = picker.style.display === 'block';
    document.querySelectorAll('.cat-picker').forEach(p => p.style.display = 'none');
    picker.style.display = wasVisible ? 'none' : 'block';
  },

  changeCategory(menuIdx, dishIdx, newCat) {
    if (!this._lastResults || !this._lastResults[menuIdx]) return;
    const menu = this._lastResults[menuIdx].menu;
    const recipes = DataStore.getRecipes();
    const inventory = DataStore.getInventory();
    const babyMode = document.getElementById('baby-mode').checked;
    const today = Engine.todayStr();

    const usedNames = new Set(menu.map(r => r.name));
    usedNames.delete(menu[dishIdx].name);

    let pool = recipes.filter(r => r.category === newCat && !usedNames.has(r.name));
    if (!pool.length) {
      pool = recipes.filter(r => !usedNames.has(r.name));
    }
    if (!pool.length) return;

    pool.forEach(r => { r._score = Engine.scoreRecipe(r, inventory, DataStore.getMenus(), today, babyMode); });
    pool.sort((a, b) => b._score - a._score);
    const topPool = pool.slice(0, 5);
    const picked = Engine.pickWeightedRandom(topPool);
    menu[dishIdx] = { ...picked };
    this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
    this.renderRecommend(this._lastResults, inventory);
  },

  showDishPicker(menuIdx, dishIdx) {
    if (!this._lastResults || !this._lastResults[menuIdx]) return;
    const menu = this._lastResults[menuIdx].menu;
    const recipes = DataStore.getRecipes();
    const inventory = DataStore.getInventory();
    const babyMode = document.getElementById('baby-mode').checked;
    const today = Engine.todayStr();
    const target = menu[dishIdx];

    const usedNames = new Set(menu.map(r => r.name));
    usedNames.delete(target.name);

    let pool = recipes.filter(r => r.category === target.category && !usedNames.has(r.name));
    if (!pool.length) {
      pool = recipes.filter(r => !usedNames.has(r.name));
    }
    if (!pool.length) return;

    pool.forEach(r => { r._score = Engine.scoreRecipe(r, inventory, DataStore.getMenus(), today, babyMode); });
    pool.sort((a, b) => b._score - a._score);

    const picker = document.getElementById('dish-picker-' + menuIdx + '-' + dishIdx);
    if (!picker) return;

    let html = '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:6px 0;border-bottom:1px solid #F5F0EB;">';
    pool.slice(0, 10).forEach(r => {
      html += `<button class="btn-small" onclick="App.pickDish(${menuIdx}, ${dishIdx}, '${r.name.replace(/'/g, "\\'")}')" style="padding:4px 8px;font-size:0.75rem;">${r.name} (${Math.round(r._score)})</button>`;
    });
    html += '</div>';
    picker.innerHTML = html;

    const wasVisible = picker.style.display === 'block';
    document.querySelectorAll('.dish-picker').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.cat-picker').forEach(p => p.style.display = 'none');
    picker.style.display = wasVisible ? 'none' : 'block';
  },

  pickDish(menuIdx, dishIdx, dishName) {
    if (!this._lastResults || !this._lastResults[menuIdx]) return;
    const menu = this._lastResults[menuIdx].menu;
    const recipes = DataStore.getRecipes();
    const picked = recipes.find(r => r.name === dishName);
    if (!picked) return;
    menu[dishIdx] = { ...picked };
    this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
    this.renderRecommend(this._lastResults, DataStore.getInventory());
  }
};

// Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW注册失败', err));
}

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
