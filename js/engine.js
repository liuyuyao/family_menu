const Engine = {
  // 工具：计算日期差（天数）
  diffDays(d1, d2) {
    const a = new Date(d1); a.setHours(0,0,0,0);
    const b = new Date(d2); b.setHours(0,0,0,0);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
  },

  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  // 单菜评分
  scoreRecipe(recipe, inventory, historyMenus, today, babyMode) {
    let score = babyMode ? (recipe.babyPreference || recipe.preference) : recipe.preference;

    // 库存加分
    if (inventory && inventory.length > 0) {
      const hasMatch = recipe.ingredients.some(ing =>
        inventory.some(inv => inv.name && ing && (ing.includes(inv.name) || inv.name.includes(ing)))
      );
      if (hasMatch) score += 5;
    }

    // 时间衰减（蒜蓉时蔬/清炒时蔬 和 米饭 不扣）
    const noDecayNames = ['蒜蓉时蔬', '清炒时蔬', '米饭', '白米饭'];
    if (!noDecayNames.includes(recipe.name) && recipe.lastEaten) {
      const days = this.diffDays(today, recipe.lastEaten);
      if (days >= 1 && days <= 5) {
        score -= (6 - days);
      }
    }

    // 随机扰动
    score += Math.random() * 3;

    return score;
  },

  // 菜单组合评分
  scoreMenu(menuRecipes) {
    let score = menuRecipes.reduce((sum, r) => sum + (r._score || 0), 0);

    // 食材重复惩罚
    const counts = {};
    for (const r of menuRecipes) {
      for (const ing of (r.ingredients || [])) {
        if (!ing) continue;
        counts[ing] = (counts[ing] || 0) + 1;
      }
    }
    for (const [name, count] of Object.entries(counts)) {
      if (count > 1) {
        score -= 3 * (count - 1);
      }
    }

    return score;
  },

  // 加权随机从池子选一道
  pickWeightedRandom(pool) {
    const weights = pool.map(r => Math.max(0.1, (r._score || 0) + Math.random() * 2));
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  // 生成候选菜单
  generateCandidateMenu(recipesByCat, inventory, history, today, babyMode) {
    const cats = ['big_meat', 'seafood', 'small_meat', 'vegetable', 'soup', 'staple'];
    const menu = [];
    const usedNames = new Set();

    for (const cat of cats) {
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

      // 计算单菜分并排序，取前5进入候选
      pool.forEach(r => {
        r._score = this.scoreRecipe(r, inventory, history, today, babyMode);
      });
      pool.sort((a, b) => b._score - a._score);
      const topPool = pool.slice(0, 5);

      const picked = this.pickWeightedRandom(topPool);
      menu.push(picked);
      usedNames.add(picked.name);
    }

    // 如果 staple 没选到，默认加米饭（不占评分）
    const hasStaple = menu.some(r => r.category === 'staple');
    if (!hasStaple) {
      menu.push({ name: '米饭', category: 'staple', preference: 0, ingredients: [], _score: 0, isRice: true });
    }

    return menu;
  },

  // 主入口：生成两组菜单
  generateTwoMenus(recipes, inventory, historyMenus, babyMode = false) {
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
      const menu = this.generateCandidateMenu(byCat, inventory, historyMenus, today, babyMode);
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
