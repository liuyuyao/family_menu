const Engine = {
  // 基准概率倍数：1星0.4, 2星0.7, 3星1, 4星1.5, 5星2
  BASE_PROB: { 1: 0.2, 2: 0.5, 3: 1, 4: 1.5, 5: 2 },

  // 时间衰减系数
  TIME_DECAY: { 1: 0.2, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9 },

  // 食材颜色映射表
  COLOR_MAP: {
    red: ['番茄', '胡萝卜', '红枣', '红豆', '红椒', '红薯', '枸杞', '山楂', '草莓', '西瓜'],
    green: ['青菜', '西兰花', '菠菜', '黄瓜', '青椒', '葱', '豌豆', '荷兰豆', '芹菜', '油麦菜', '包菜', '韭菜', '丝瓜', '冬瓜', '生菜', '莴笋', '蒜苗', '蒜苔', '毛豆', '海带', '菜心', '芥蓝', '空心菜', '茼蒿', '茴香', '香菜', '苦菊', '秋葵', '芦笋', '四季豆', '青豆', '时蔬'],
    white: ['豆腐', '白萝卜', '白菜', '花菜', '莲藕', '山药', '米饭', '面条', '面粉', '土豆', '大米', '馄饨皮', '饺子皮', '百合', '银耳', '粉条', '年糕', '腐竹', '千张', '豆皮', '面筋', '芋头', '荸荠', '茭白'],
    yellow: ['南瓜', '玉米', '鸡蛋', '黄花菜', '黄豆', '小米', '香蕉', '芒果', '菠萝'],
    black_purple: ['紫菜', '木耳', '香菇', '黑米', '黑豆', '紫薯', '黑芝麻', '海苔', '黑枸杞', '桑葚', '蓝莓', '紫甘蓝']
  },

  // 工具：计算日期差（天数）
  diffDays(d1, d2) {
    const a = new Date(d1); a.setHours(0,0,0,0);
    const b = new Date(d2); b.setHours(0,0,0,0);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
  },

  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  // 计算概率权重（基础权重，不含重复惩罚）
  calcWeight(recipe, inventory, historyMenus, today) {
    const pref = recipe.preference;
    let weight = this.BASE_PROB[pref] || 1;

    // 时间衰减（蒜蓉时蔬/清炒时蔬 和 米饭 不衰减）
    const noDecayNames = ['蒜蓉时蔬', '清炒时蔬', '米饭', '白米饭'];
    if (!noDecayNames.includes(recipe.name) && recipe.lastEaten) {
      const days = this.diffDays(today, recipe.lastEaten);
      if (days >= 1 && days <= 5) {
        weight *= (this.TIME_DECAY[days] || 1);
      }
    }

    // 库存加成 *3
    if (inventory && inventory.length > 0) {
      const hasMatch = recipe.ingredients.some(ing =>
        inventory.some(inv => inv.name && ing && (ing.includes(inv.name) || inv.name.includes(ing)))
      );
      if (hasMatch) weight *= 3;
    }

    return parseFloat(weight.toFixed(1));
  },

  // 推断食材颜色
  getColors(ingredients) {
    const colors = new Set();
    for (const ing of (ingredients || [])) {
      if (!ing) continue;
      for (const [color, keywords] of Object.entries(this.COLOR_MAP)) {
        if (keywords.some(k => ing.includes(k) || k.includes(ing))) {
          colors.add(color);
        }
      }
    }
    return Array.from(colors);
  },

  // 计算惩罚后权重（食材重复惩罚）
  calcWeightedWithDup(recipe, baseWeight, usedIngredients) {
    let weight = baseWeight;
    let dupCount = 0;
    for (const ing of (recipe.ingredients || [])) {
      if (usedIngredients.has(ing)) dupCount++;
    }
    if (dupCount > 0) {
      weight = parseFloat((weight * Math.pow(0.6, dupCount)).toFixed(1));
    }
    return weight;
  },

  // 计算单菜最终权重：基础权重 + 重复惩罚 + 颜色奖励
  calcFinalWeight(recipe, inventory, history, today, usedIngredients, usedColors) {
    let weight = this.calcWeight(recipe, inventory, history, today);
    weight = this.calcWeightedWithDup(recipe, weight, usedIngredients);

    // 颜色奖励：带来新颜色，权重 ×1.5
    const colors = this.getColors(recipe.ingredients || []);
    const hasNewColor = colors.some(c => !(usedColors || new Set()).has(c));
    if (hasNewColor) {
      weight *= 1.5;
    }

    return parseFloat(weight.toFixed(1));
  },

  // 兼容旧调用
  scoreRecipe(...args) {
    return this.calcWeight(...args);
  },

  // 菜单综合得分（纯权重之和）
  scoreMenu(menuRecipes) {
    return parseFloat(menuRecipes.reduce((sum, r) => sum + (r._weight || 0), 0).toFixed(1));
  },

  // 按权重随机抽取一道（轮盘赌算法）
  pickWeightedRandom(pool) {
    const weights = pool.map(r => Math.max(0.001, r._weight || 0));
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  // 打乱数组顺序
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // 生成候选菜单：随机顺序抽取，后面菜按重复惩罚后概率计算
  generateCandidateMenu(recipesByCat, inventory, history, today) {
    const cats = ['big_meat', 'seafood', 'small_meat', 'vegetable', 'soup', 'staple'];
    // 随机打乱抽取顺序
    const order = this.shuffle(cats);
    const menu = [];
    const usedNames = new Set();
    const usedIngredients = new Set();
    const usedColors = new Set();

    for (const cat of order) {
      let pool = (recipesByCat[cat] || []).filter(r => !usedNames.has(r.name));
      if (pool.length === 0) {
        // 如果该分类不足，从其他分类补
        pool = (recipesByCat['big_meat'] || [])
          .concat(recipesByCat['seafood'] || [])
          .concat(recipesByCat['small_meat'] || [])
          .concat(recipesByCat['vegetable'] || [])
          .concat(recipesByCat['soup'] || [])
          .concat(recipesByCat['staple'] || [])
          .filter(r => !usedNames.has(r.name));
      }
      if (pool.length === 0) continue;

      pool.forEach(r => {
        r._weight = this.calcFinalWeight(r, inventory, history, today, usedIngredients, usedColors);
      });

      const picked = this.pickWeightedRandom(pool);
      menu.push(picked);
      usedNames.add(picked.name);
      (picked.ingredients || []).forEach(ing => { if (ing) usedIngredients.add(ing); });
      this.getColors(picked.ingredients || []).forEach(c => usedColors.add(c));
    }

    // 按固定顺序重新排列菜单（大荤→海鲜→小荤→素菜→汤→主食），方便展示
    const catOrder = { big_meat: 0, seafood: 1, small_meat: 2, vegetable: 3, soup: 4, staple: 5 };
    menu.sort((a, b) => (catOrder[a.category] || 99) - (catOrder[b.category] || 99));

    // 如果 staple 没选到，默认加米饭
    const hasStaple = menu.some(r => r.category === 'staple');
    if (!hasStaple) {
      menu.push({ name: '米饭', category: 'staple', preference: 0, ingredients: [], _weight: 0, isRice: true });
    }

    return menu;
  },

  // 主入口：生成两组菜单
  generateTwoMenus(recipes, inventory, historyMenus) {
    const today = this.todayStr();

    // 按分类归档
    const byCat = {};
    for (const r of recipes) {
      if (!byCat[r.category]) byCat[r.category] = [];
      byCat[r.category].push({ ...r });
    }

    // 生成大量候选组合
    const candidates = [];
    for (let i = 0; i < 30; i++) {
      const menu = this.generateCandidateMenu(byCat, inventory, historyMenus, today);
      const score = this.scoreMenu(menu);
      candidates.push({ menu, score });
    }

    // 按分数降序
    candidates.sort((a, b) => b.score - a.score);

    // 取前2，确保差异（至少换2道菜）
    const results = [];
    for (const c of candidates) {
      if (results.length >= 2) break;
      if (results.length === 0) {
        results.push(c);
      } else {
        const overlap = c.menu.filter(r => results[0].menu.some(r2 => r2.name === r.name)).length;
        if (overlap <= 4) { // 最多重复4道（允许换2道）
          results.push(c);
        }
      }
    }

    // 如果只有一组，复制一份微调
    if (results.length === 1) {
      results.push({ ...results[0] });
    }

    return results;
  },

  // 生成采购清单：菜单食材 - 库存食材
  generateShoppingList(menuRecipes, inventory) {
    const needed = {};
    for (const r of menuRecipes) {
      for (const ing of (r.ingredients || [])) {
        if (!ing) continue;
        needed[ing] = (needed[ing] || 0) + 1;
      }
    }

    const invNames = new Set((inventory || []).map(i => i.name));
    const list = [];
    for (const [name, count] of Object.entries(needed)) {
      const inStock = Array.from(invNames).some(inv => name.includes(inv) || inv.includes(name));
      if (!inStock) {
        list.push(name);
      }
    }
    return list;
  }
};
