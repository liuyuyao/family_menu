const App = {
  currentPage: 'recommend',

  // 渲染食材颜色圆点
  renderColorDots(recipe) {
    const colors = Engine.getColors(recipe.ingredients || []);
    if (!colors.length) return '';
    const dots = colors.map(c => `<span class="color-dot color-dot-${c}"></span>`).join('');
    return `<span class="color-dots">${dots}</span>`;
  },

  init() {
    this.migrateStorageKeys();
    this.migrateRecipes();
    this.bindNav();
    this.bindEvents();
    this.loadGitHubSettings();
    this.renderRecipes();
    this.renderHistory();
    this.renderQuickInv();
    this.generateRecommend();
  },

  migrateRecipes() {
    const seafoodNames = new Set(['清蒸虾', '清蒸鲈鱼', '家烧黄鱼', '照烧三文鱼', '炒蛏子', '宝宝版清蒸鳕鱼']);
    const occupyMap = {
      '羊肚菌酿肉': 25, '糖醋排骨': 20, '红烧肉加鸡蛋': 20, '红烧鸡翅': 15,
      '照烧鸡腿排': 15, '香菇炖鸡': 20, '清蒸虾': 5, '清蒸鲈鱼': 10,
      '家烧黄鱼': 15, '照烧三文鱼': 10, '炒蛏子': 10, '烤羊排': 20,
      '酱牛肉': 25, '土豆炖牛腩': 20, '番茄炖牛腩': 20, '炒猪肝': 15,
      '南瓜蒸排骨': 15, '宝宝版清蒸鳕鱼': 5, '肉末烧豆腐': 15, '韭菜炒蛋': 10,
      '番茄炒蛋': 10, '木须肉': 20, '虾仁蒸蛋': 10, '宝宝肉饼蒸蛋': 15,
      '胡萝卜土豆炖肉丸': 20, '番茄肉酱面': 20, '豆腐鱼肉丸': 20, '蔬菜蛋饺': 30,
      '宝宝版宫保鸡丁': 15, '手撕包菜': 10, '芹菜香干': 10, '蒜蓉时蔬': 5,
      '西兰花炒胡萝卜': 15, '蒸南瓜': 5, '土豆泥': 15, '玉米排骨汤': 20,
      '萝卜牛肉汤': 20, '番茄鸡蛋汤': 10, '紫菜鸡蛋汤': 10, '冬瓜汆丸子': 20,
      '丝瓜炒蛋': 10, '玉米浓汤': 15, '青菜肉末粥': 15, '肉末炒蘑菇': 15,
      '口蘑炒蛋': 10, '番茄肉末意面': 20, '蛋炒饭': 10, '鲜肉馄饨': 25, '饺子': 25,
    };
    const recipes = DataStore.getRecipes();
    let changed = false;
    recipes.forEach(r => {
      if (seafoodNames.has(r.name) && r.category === 'big_meat') {
        r.category = 'seafood';
        changed = true;
      }
      if (r.occupyTime === undefined || r.occupyTime === null) {
        r.occupyTime = occupyMap[r.name] || Math.round((r.cookTime || 30) * 0.5);
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

    if (page === 'history') this.renderHistory();
  },

  // 事件绑定
  bindEvents() {
    // 生成菜单
    document.getElementById('btn-generate').addEventListener('click', () => this.generateRecommend());

    // 快速添加库存食材
    document.getElementById('btn-quick-add').addEventListener('click', () => this.quickAddInventory());
    document.getElementById('quick-inv').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.quickAddInventory(); });

    // 菜谱搜索与筛选
    document.getElementById('recipe-search').addEventListener('input', () => this.renderRecipes());
    document.getElementById('recipe-filter').addEventListener('change', () => this.renderRecipes());

    // 导入导出
    document.getElementById('btn-add-recipe').addEventListener('click', () => this.openEditor());
    document.getElementById('btn-import-csv').addEventListener('click', () => document.getElementById('file-csv').click());
    document.getElementById('file-csv').addEventListener('change', (e) => this.handleImportCSV(e));
    document.getElementById('btn-export-json').addEventListener('click', () => this.handleExport());
    document.getElementById('file-json-import').addEventListener('change', (e) => this.handleImportJSON(e));

    // 食材管理
  },

  // 今日推荐
  generateRecommend() {
    const recipes = DataStore.getRecipes();
    const inventory = DataStore.getInventory();
    const history = DataStore.getMenus();
    const results = Engine.generateTwoMenus(recipes, inventory, history);
    this.renderRecommend(results, inventory);
  },

  renderRecommend(results, inventory) {
    const container = document.getElementById('recommend-result');
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="empty-state">点击上方按钮生成今日菜单</div>';
      return;
    }

    const res = results[0];
    let menu = res.menu;
    const shopping = Engine.generateShoppingList(menu, inventory);

    // 前端强制排序：大荤→海鲜→小荤→素菜→汤→主食
    const catOrder = ['big_meat', 'seafood', 'small_meat', 'vegetable', 'soup', 'staple'];
    const sortedMenu = [];
    for (const cat of catOrder) {
      const found = menu.filter(r => r.category === cat);
      sortedMenu.push(...found);
    }
    // 同步更新原始数据，保证点击按钮时索引一致
    res.menu = sortedMenu;
    menu = sortedMenu;

    // 统计整组菜单的颜色和占用时间
    const allColors = new Set();
    let totalOccupyTime = 0;
    for (const r of menu) {
      Engine.getColors(r.ingredients || []).forEach(c => allColors.add(c));
      totalOccupyTime += (r.occupyTime || r.cookTime || 0);
    }
    const colorDotsHtml = Array.from(allColors).map(c => `<span class="color-dot color-dot-${c}"></span>`).join('');

    let html = `<div class="menu-group">
      <div class="menu-group-header">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="menu-group-title">今日菜单</span>
          <span class="color-dots">${colorDotsHtml}</span>
        </div>
        <div style="text-align:right;">
          <span class="menu-group-score">综合得分 ${res.score.toFixed(1)}</span>
          <div style="font-size:0.75rem;color:#999;margin-top:2px;">占用时间 ${totalOccupyTime}min</div>
        </div>
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
          <div class="menu-item-name">${r.name} ${this.renderColorDots(r)}</div>
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

        // 假设剩余菜色不变，计算重复惩罚后权重 + 颜色奖励
        const usedIngredients = new Set();
        const usedColors = new Set();
        menu.forEach((r, i) => {
          if (i !== idx) {
            (r.ingredients || []).forEach(ing => { if (ing) usedIngredients.add(ing); });
            Engine.getColors(r.ingredients || []).forEach(c => usedColors.add(c));
          }
        });
        pool.forEach(r => {
          r._weight = Engine.calcFinalWeight(r, inventory, DataStore.getMenus(), today, usedIngredients, usedColors);
        });

        const picked = Engine.pickWeightedRandom(pool);
        usedNames.delete(menu[idx].name);
        menu[idx] = { ...picked };
        usedNames.add(picked.name);
      }

      this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
      this.renderRecommend(this._lastResults, inventory);
      return;
    }

    // 单道菜替换（点击"换"按钮时）：假设剩余菜色不变
    const target = menu[dishIdx];
    if (!target || target.isRice) return;

    const oldCat = target.category;
    const usedNames = new Set(menu.map(r => r.name));
    usedNames.delete(target.name);
    let pool = recipes.filter(r => r.category === oldCat && !usedNames.has(r.name));
    if (!pool.length) {
      pool = recipes.filter(r => !usedNames.has(r.name));
    }
    if (!pool.length) return;

    // 剩余菜单的食材和颜色集合
    const usedIngredients = new Set();
    const usedColors = new Set();
    menu.forEach((r, idx) => {
      if (idx !== dishIdx) {
        (r.ingredients || []).forEach(ing => { if (ing) usedIngredients.add(ing); });
        Engine.getColors(r.ingredients || []).forEach(c => usedColors.add(c));
      }
    });

    pool.forEach(r => {
      r._weight = Engine.calcFinalWeight(r, inventory, DataStore.getMenus(), today, usedIngredients, usedColors);
    });

    const picked = Engine.pickWeightedRandom(pool);
    menu[dishIdx] = { ...picked };
    this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
    this.renderRecommend(this._lastResults, inventory);
  },

  // 菜谱列表
  renderRecipes() {
    const search = document.getElementById('recipe-search').value.toLowerCase();
    const filter = document.getElementById('recipe-filter').value;
    let recipes = DataStore.getRecipes();

    // 默认按分类排序（大荤→海鲜→小荤→素菜→汤→主食）
    const catOrder = { big_meat: 0, seafood: 1, small_meat: 2, vegetable: 3, soup: 4, staple: 5 };
    recipes.sort((a, b) => (catOrder[a.category] || 99) - (catOrder[b.category] || 99));

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
          <div class="name">${r.name} ${this.renderColorDots(r)} <span style="font-size:0.75rem;color:#999">(${catName})</span></div>
          <div class="sub">${r.cookTime}min（占用${r.occupyTime || r.cookTime}min） · ${(r.ingredients || []).join('、')}</div>
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
    container.innerHTML = menus.slice(0, 30).map((m, idx) => `
      <div class="card" style="position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div class="history-date">${m.date}</div>
          <button class="btn-small" onclick="App.deleteHistory(${idx})" style="padding:2px 8px;font-size:0.7rem;background:#FFEBEE;color:#C62828;border-color:#EF9A9A;">删除</button>
        </div>
        <div class="history-recipes">${m.recipes.join('、')}</div>
      </div>
    `).join('');
  },

  deleteHistory(idx) {
    if (!confirm('确定删除这条历史记录吗？')) return;
    const menus = DataStore.getMenus();
    menus.splice(idx, 1);
    DataStore.saveMenus(menus);
    this.renderHistory();
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
    a.download = '帆帆菜单备份_' + Engine.todayStr() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        DataStore.importAll(ev.target.result);
        alert('导入成功');
        this.renderRecipes();
        this.renderInventory();
        this.renderHistory();
      } catch (err) {
        alert('导入失败: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
      document.getElementById('edit-occupy').value = r.occupyTime || r.cookTime;
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
      document.getElementById('edit-occupy').value = '15';
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
    const occupyTime = parseInt(document.getElementById('edit-occupy').value) || cookTime;
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
        recipes[idx] = { ...recipes[idx], name, category, mainIngredient, preference, cookTime, occupyTime, difficulty, ingredients };
      }
    } else {
      if (recipes.some(x => x.name === name)) {
        alert('该菜名已存在'); return;
      }
      recipes.push({ name, category, mainIngredient, preference, cookTime, occupyTime, difficulty, ingredients, lastEaten: null });
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

  quickAddInventory() {
    const input = document.getElementById('quick-inv');
    const text = input.value.trim();
    if (!text) return;
    const names = text.split(/[,，、\s]+/).filter(s => s);
    const inv = DataStore.getInventory();
    const today = Engine.todayStr();
    names.forEach(name => {
      if (!inv.some(i => i.name === name)) {
        inv.push({ name, quantity: '', unit: '', addedDate: today });
      }
    });
    DataStore.saveInventory(inv);
    input.value = '';
    this.renderQuickInv();
  },

  renderQuickInv() {
    const inv = DataStore.getInventory();
    const container = document.getElementById('quick-inv-tags');
    if (!container) return;
    container.innerHTML = inv.map((item, idx) =>
      `<span style="background:#FFE8D6;color:#D4652A;padding:2px 8px;border-radius:10px;font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;">
        ${item.name}<button onclick="App.removeQuickInv(${idx})" style="background:none;border:none;color:#D4652A;cursor:pointer;padding:0;font-size:0.8rem;line-height:1;">×</button>
      </span>`
    ).join('');
  },

  removeQuickInv(idx) {
    const inv = DataStore.getInventory();
    inv.splice(idx, 1);
    DataStore.saveInventory(inv);
    this.renderQuickInv();
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
    const today = Engine.todayStr();

    const usedNames = new Set(menu.map(r => r.name));
    usedNames.delete(menu[dishIdx].name);

    let pool = recipes.filter(r => r.category === newCat && !usedNames.has(r.name));
    if (!pool.length) {
      pool = recipes.filter(r => !usedNames.has(r.name));
    }
    if (!pool.length) return;

    // 剩余菜单的食材和颜色集合
    const usedIngredients = new Set();
    const usedColors = new Set();
    menu.forEach((r, idx) => {
      if (idx !== dishIdx) {
        (r.ingredients || []).forEach(ing => { if (ing) usedIngredients.add(ing); });
        Engine.getColors(r.ingredients || []).forEach(c => usedColors.add(c));
      }
    });

    pool.forEach(r => {
      r._weight = Engine.calcFinalWeight(r, inventory, DataStore.getMenus(), today, usedIngredients, usedColors);
    });

    const picked = Engine.pickWeightedRandom(pool);
    menu[dishIdx] = { ...picked };
    this._lastResults[menuIdx].score = Engine.scoreMenu(menu);
    this.renderRecommend(this._lastResults, inventory);
  },

  showDishPicker(menuIdx, dishIdx) {
    try {
      if (!this._lastResults || !this._lastResults[menuIdx]) { alert('请先生成菜单'); return; }
      const menu = this._lastResults[menuIdx].menu;
      const recipes = DataStore.getRecipes();
      const inventory = DataStore.getInventory();
      const today = Engine.todayStr();
      const target = menu[dishIdx];
      if (!target) { alert('菜单项不存在'); return; }

      const usedNames = new Set(menu.map(r => r.name));
      usedNames.delete(target.name);

      let pool = recipes.filter(r => r.category === target.category && !usedNames.has(r.name));
      if (!pool.length) {
        pool = recipes.filter(r => !usedNames.has(r.name));
      }
      if (!pool.length) { alert('没有可选菜谱'); return; }

      const usedIngredients = new Set();
      const usedColors = new Set();
      menu.forEach((r, idx) => {
        if (idx !== dishIdx) {
          (r.ingredients || []).forEach(ing => { if (ing) usedIngredients.add(ing); });
          Engine.getColors(r.ingredients || []).forEach(c => usedColors.add(c));
        }
      });

      pool.forEach(r => {
        r._weight = Engine.calcFinalWeight(r, inventory, DataStore.getMenus(), today, usedIngredients, usedColors);
      });
      pool.sort((a, b) => b._weight - a._weight);

      const picker = document.getElementById('dish-picker-' + menuIdx + '-' + dishIdx);
      if (!picker) { alert('弹窗元素未找到'); return; }

      let html = '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:6px 0;border-bottom:1px solid #F5F0EB;">';
      pool.slice(0, 10).forEach(r => {
        html += `<button class="btn-small" onclick="App.pickDish(${menuIdx}, ${dishIdx}, '${r.name.replace(/'/g, "\\'")}')" style="padding:4px 8px;font-size:0.75rem;">${r.name} (${r._weight.toFixed(1)})</button>`;
      });
      html += '</div>';
      picker.innerHTML = html;

      const wasVisible = picker.style.display === 'block';
      document.querySelectorAll('.dish-picker').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.cat-picker').forEach(p => p.style.display = 'none');
      picker.style.display = wasVisible ? 'none' : 'block';
    } catch (e) {
      alert('选菜出错: ' + e.message);
    }
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
  },

  // GitHub 设置
  loadGitHubSettings() {
    const s = DataStore.getSettings();
    document.getElementById('gh-token').value = s.ghToken || '';
    document.getElementById('gh-repo').value = s.ghRepo || '';
    document.getElementById('gh-branch').value = s.ghBranch || 'main';
    document.getElementById('gh-path').value = s.ghPath || 'data/recipes.csv';
  },

  saveGitHubSettings() {
    const s = DataStore.getSettings();
    s.ghToken = document.getElementById('gh-token').value.trim();
    s.ghRepo = document.getElementById('gh-repo').value.trim();
    s.ghBranch = document.getElementById('gh-branch').value.trim() || 'main';
    s.ghPath = document.getElementById('gh-path').value.trim() || 'data/recipes.csv';
    DataStore.saveSettings(s);
    this.setStatus('配置已保存');
  },

  setStatus(msg) {
    const el = document.getElementById('gh-status');
    if (el) { el.textContent = msg; setTimeout(() => el.textContent = '', 3000); }
  },

  async syncFromGitHub() {
    const s = DataStore.getSettings();
    if (!s.ghToken || !s.ghRepo) { alert('请先填写 GitHub Token 和仓库名'); return; }
    this.setStatus('正在从仓库加载...');
    try {
      const [owner, repo] = s.ghRepo.split('/');
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${s.ghPath}?ref=${s.ghBranch}`;
      const res = await fetch(url, { headers: { Authorization: `token ${s.ghToken}`, Accept: 'application/vnd.github.v3+json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const csv = atob(data.content.replace(/\n/g, ''));
      const recipes = DataStore.parseCSV(csv);
      DataStore.saveRecipes(recipes);
      this.renderRecipes();
      this.setStatus('已从仓库加载 ' + recipes.length + ' 道菜谱');
    } catch (e) {
      this.setStatus('加载失败: ' + e.message);
    }
  },

  async syncToGitHub() {
    const s = DataStore.getSettings();
    if (!s.ghToken || !s.ghRepo) { alert('请先填写 GitHub Token 和仓库名'); return; }
    this.setStatus('正在保存到仓库...');
    try {
      const [owner, repo] = s.ghRepo.split('/');
      const recipes = DataStore.getRecipes();
      const csv = this.recipesToCSV(recipes);
      const content = btoa(unescape(encodeURIComponent(csv)));

      // 获取现有文件的 sha
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${s.ghPath}?ref=${s.ghBranch}`;
      const getRes = await fetch(getUrl, { headers: { Authorization: `token ${s.ghToken}`, Accept: 'application/vnd.github.v3+json' } });
      let sha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 提交更新
      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${s.ghPath}`;
      const body = { message: '更新菜谱', content, branch: s.ghBranch };
      if (sha) body.sha = sha;
      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: { Authorization: `token ${s.ghToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!putRes.ok) throw new Error('HTTP ' + putRes.status);
      this.setStatus('已成功保存到仓库');
    } catch (e) {
      this.setStatus('保存失败: ' + e.message);
    }
  },

  recipesToCSV(recipes) {
    const headers = ['菜名', '分类', '主要食材', '喜爱', '用时(分钟)', '占用时间(分钟)', '难度', '食材1', '食材2', '食材3', '食材4', '食材5'];
    const lines = [headers.join(',')];
    for (const r of recipes) {
      const ings = r.ingredients || [];
      const row = [
        r.name, r.category, r.mainIngredient || '', r.preference || 3,
        r.cookTime || 30, r.occupyTime || (r.cookTime || 30),
        r.difficulty || 'easy',
        ings[0] || '', ings[1] || '', ings[2] || '', ings[3] || '', ings[4] || ''
      ];
      lines.push(row.join(','));
    }
    return lines.join('\n') + '\n';
  },

  exportCSV() {
    const csv = this.recipesToCSV(DataStore.getRecipes());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recipes.csv';
    link.click();
  },

  exportJSON() {
    const json = DataStore.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fanfan_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    link.click();
  }
};

// Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW注册失败', err));
}

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
