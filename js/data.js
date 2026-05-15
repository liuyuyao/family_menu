const DEFAULT_RECIPES = [
  {
    "name": "羊肚菌酿肉",
    "category": "big_meat",
    "mainIngredient": "猪肉",
    "preference": 4,
    "cookTime": 40,
    "difficulty": "medium",
    "ingredients": [
      "羊肚菌",
      "猪肉末"
    ],
    "lastEaten": null
  },
  {
    "name": "糖醋排骨",
    "category": "big_meat",
    "mainIngredient": "猪肉",
    "preference": 4,
    "cookTime": 60,
    "difficulty": "medium",
    "ingredients": [
      "猪肋排"
    ],
    "lastEaten": null
  },
  {
    "name": "红烧肉加鸡蛋",
    "category": "big_meat",
    "mainIngredient": "猪肉",
    "preference": 4,
    "cookTime": 70,
    "difficulty": "medium",
    "ingredients": [
      "五花肉",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "红烧鸡翅",
    "category": "big_meat",
    "mainIngredient": "鸡肉",
    "preference": 5,
    "cookTime": 35,
    "difficulty": "easy",
    "ingredients": [
      "鸡翅中"
    ],
    "lastEaten": null
  },
  {
    "name": "照烧鸡腿排",
    "category": "big_meat",
    "mainIngredient": "鸡肉",
    "preference": 3,
    "cookTime": 30,
    "difficulty": "easy",
    "ingredients": [
      "鸡腿肉"
    ],
    "lastEaten": null
  },
  {
    "name": "香菇炖鸡",
    "category": "big_meat",
    "mainIngredient": "鸡肉",
    "preference": 3,
    "cookTime": 80,
    "difficulty": "medium",
    "ingredients": [
      "土鸡",
      "干香菇"
    ],
    "lastEaten": null
  },
  {
    "name": "清蒸虾",
    "category": "seafood",
    "mainIngredient": "虾",
    "preference": 4,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "斑节虾"
    ],
    "lastEaten": null
  },
  {
    "name": "清蒸鲈鱼",
    "category": "seafood",
    "mainIngredient": "鱼",
    "preference": 3,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "鲈鱼"
    ],
    "lastEaten": null
  },
  {
    "name": "家烧黄鱼",
    "category": "seafood",
    "mainIngredient": "鱼",
    "preference": 4,
    "cookTime": 30,
    "difficulty": "medium",
    "ingredients": [
      "大黄鱼"
    ],
    "lastEaten": null
  },
  {
    "name": "照烧三文鱼",
    "category": "seafood",
    "mainIngredient": "鱼",
    "preference": 3,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "三文鱼排",
      "柠檬"
    ],
    "lastEaten": null
  },
  {
    "name": "炒蛏子",
    "category": "seafood",
    "mainIngredient": "贝壳",
    "preference": 4,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "蛏子"
    ],
    "lastEaten": null
  },
  {
    "name": "烤羊排",
    "category": "big_meat",
    "mainIngredient": "羊肉",
    "preference": 4,
    "cookTime": 90,
    "difficulty": "medium",
    "ingredients": [
      "羊排",
      "洋葱",
      "土豆"
    ],
    "lastEaten": null
  },
  {
    "name": "酱牛肉",
    "category": "big_meat",
    "mainIngredient": "牛肉",
    "preference": 4,
    "cookTime": 120,
    "difficulty": "medium",
    "ingredients": [
      "牛腱子"
    ],
    "lastEaten": null
  },
  {
    "name": "土豆炖牛腩",
    "category": "big_meat",
    "mainIngredient": "牛肉",
    "preference": 3,
    "cookTime": 100,
    "difficulty": "medium",
    "ingredients": [
      "牛腩",
      "土豆",
      "胡萝卜",
      "洋葱"
    ],
    "lastEaten": null
  },
  {
    "name": "番茄炖牛腩",
    "category": "big_meat",
    "mainIngredient": "牛肉",
    "preference": 3,
    "cookTime": 100,
    "difficulty": "medium",
    "ingredients": [
      "牛腩",
      "番茄",
      "土豆",
      "洋葱"
    ],
    "lastEaten": null
  },
  {
    "name": "炒猪肝",
    "category": "big_meat",
    "mainIngredient": "内脏",
    "preference": 4,
    "cookTime": 20,
    "difficulty": "medium",
    "ingredients": [
      "猪肝",
      "青椒",
      "洋葱"
    ],
    "lastEaten": null
  },
  {
    "name": "南瓜蒸排骨",
    "category": "big_meat",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 50,
    "difficulty": "easy",
    "ingredients": [
      "猪肋排",
      "南瓜"
    ],
    "lastEaten": null
  },
  {
    "name": "宝宝版清蒸鳕鱼",
    "category": "seafood",
    "mainIngredient": "鱼",
    "preference": 2,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "鳕鱼块"
    ],
    "lastEaten": null
  },
  {
    "name": "肉末烧豆腐",
    "category": "small_meat",
    "mainIngredient": "豆腐",
    "preference": 3,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "嫩豆腐",
      "猪肉末"
    ],
    "lastEaten": null
  },
  {
    "name": "韭菜炒蛋",
    "category": "small_meat",
    "mainIngredient": "鸡蛋",
    "preference": 3,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "韭菜",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "番茄炒蛋",
    "category": "small_meat",
    "mainIngredient": "鸡蛋",
    "preference": 4,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "番茄",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "木须肉",
    "category": "small_meat",
    "mainIngredient": "猪肉",
    "preference": 3,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "猪肉片",
      "鸡蛋",
      "黄瓜",
      "黑木耳",
      "胡萝卜"
    ],
    "lastEaten": null
  },
  {
    "name": "虾仁蒸蛋",
    "category": "small_meat",
    "mainIngredient": "虾",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "鸡蛋",
      "虾仁"
    ],
    "lastEaten": null
  },
  {
    "name": "宝宝肉饼蒸蛋",
    "category": "small_meat",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 25,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "胡萝卜土豆炖肉丸",
    "category": "small_meat",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 45,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "胡萝卜",
      "土豆"
    ],
    "lastEaten": null
  },
  {
    "name": "番茄肉酱面",
    "category": "staple",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "番茄",
      "洋葱",
      "面条"
    ],
    "lastEaten": null
  },
  {
    "name": "豆腐鱼肉丸",
    "category": "small_meat",
    "mainIngredient": "鱼",
    "preference": 2,
    "cookTime": 30,
    "difficulty": "medium",
    "ingredients": [
      "鲈鱼肉",
      "嫩豆腐"
    ],
    "lastEaten": null
  },
  {
    "name": "蔬菜蛋饺",
    "category": "small_meat",
    "mainIngredient": "鸡蛋",
    "preference": 2,
    "cookTime": 40,
    "difficulty": "medium",
    "ingredients": [
      "鸡蛋",
      "猪肉末",
      "白菜"
    ],
    "lastEaten": null
  },
  {
    "name": "宝宝版宫保鸡丁",
    "category": "small_meat",
    "mainIngredient": "鸡肉",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "鸡胸肉",
      "黄瓜",
      "胡萝卜"
    ],
    "lastEaten": null
  },
  {
    "name": "手撕包菜",
    "category": "vegetable",
    "mainIngredient": "蔬菜",
    "preference": 3,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "包菜"
    ],
    "lastEaten": null
  },
  {
    "name": "芹菜香干",
    "category": "vegetable",
    "mainIngredient": "蔬菜",
    "preference": 4,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "芹菜",
      "香干"
    ],
    "lastEaten": null
  },
  {
    "name": "蒜蓉时蔬",
    "category": "vegetable",
    "mainIngredient": "蔬菜",
    "preference": 5,
    "cookTime": 5,
    "difficulty": "easy",
    "ingredients": [
      "时蔬"
    ],
    "lastEaten": null
  },
  {
    "name": "西兰花炒胡萝卜",
    "category": "vegetable",
    "mainIngredient": "蔬菜",
    "preference": 3,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "西兰花",
      "胡萝卜"
    ],
    "lastEaten": null
  },
  {
    "name": "蒸南瓜",
    "category": "staple",
    "mainIngredient": "蔬菜",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "老南瓜"
    ],
    "lastEaten": null
  },
  {
    "name": "土豆泥",
    "category": "staple",
    "mainIngredient": "蔬菜",
    "preference": 2,
    "cookTime": 25,
    "difficulty": "easy",
    "ingredients": [
      "土豆",
      "牛奶"
    ],
    "lastEaten": null
  },
  {
    "name": "玉米排骨汤",
    "category": "soup",
    "mainIngredient": "猪肉",
    "preference": 3,
    "cookTime": 80,
    "difficulty": "easy",
    "ingredients": [
      "猪肋排",
      "甜玉米",
      "胡萝卜"
    ],
    "lastEaten": null
  },
  {
    "name": "萝卜牛肉汤",
    "category": "soup",
    "mainIngredient": "牛肉",
    "preference": 3,
    "cookTime": 80,
    "difficulty": "easy",
    "ingredients": [
      "牛腩",
      "白萝卜"
    ],
    "lastEaten": null
  },
  {
    "name": "番茄鸡蛋汤",
    "category": "soup",
    "mainIngredient": "鸡蛋",
    "preference": 3,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "番茄",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "紫菜鸡蛋汤",
    "category": "soup",
    "mainIngredient": "鸡蛋",
    "preference": 3,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "紫菜",
      "鸡蛋",
      "虾皮"
    ],
    "lastEaten": null
  },
  {
    "name": "冬瓜汆丸子",
    "category": "soup",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 30,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "冬瓜"
    ],
    "lastEaten": null
  },
  {
    "name": "丝瓜炒蛋",
    "category": "soup",
    "mainIngredient": "鸡蛋",
    "preference": 2,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "丝瓜",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "玉米浓汤",
    "category": "staple",
    "mainIngredient": "蔬菜",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "甜玉米",
      "牛奶",
      "洋葱"
    ],
    "lastEaten": null
  },
  {
    "name": "青菜肉末粥",
    "category": "staple",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 40,
    "difficulty": "easy",
    "ingredients": [
      "大米",
      "猪肉末",
      "青菜"
    ],
    "lastEaten": null
  },
  {
    "name": "肉末炒蘑菇",
    "category": "small_meat",
    "mainIngredient": "猪肉",
    "preference": 3,
    "cookTime": 15,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "口蘑"
    ],
    "lastEaten": null
  },
  {
    "name": "口蘑炒蛋",
    "category": "small_meat",
    "mainIngredient": "鸡蛋",
    "preference": 3,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "口蘑",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "番茄肉末意面",
    "category": "staple",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      "猪肉末",
      "番茄",
      "洋葱",
      "意面"
    ],
    "lastEaten": null
  },
  {
    "name": "蛋炒饭",
    "category": "staple",
    "mainIngredient": "鸡蛋",
    "preference": 3,
    "cookTime": 10,
    "difficulty": "easy",
    "ingredients": [
      "米饭",
      "鸡蛋"
    ],
    "lastEaten": null
  },
  {
    "name": "鲜肉馄饨",
    "category": "staple",
    "mainIngredient": "猪肉",
    "preference": 2,
    "cookTime": 30,
    "difficulty": "medium",
    "ingredients": [
      "猪肉末",
      "馄饨皮",
      "白菜"
    ],
    "lastEaten": null
  },
  {
    "name": "饺子",
    "category": "staple",
    "mainIngredient": "猪肉",
    "preference": 3,
    "cookTime": 30,
    "difficulty": "medium",
    "ingredients": [
      "猪肉末",
      "饺子皮",
      "白菜"
    ],
    "lastEaten": null
  }
];

const STORAGE_KEYS = {
  RECIPES: 'family_recipes',
  MENUS: 'family_menus',
  INVENTORY: 'family_inventory',
  SETTINGS: 'family_settings'
};

const DataStore = {
  getRecipes() {
    const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_RECIPES));
  },
  saveRecipes(recipes) {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  },
  getMenus() {
    const data = localStorage.getItem(STORAGE_KEYS.MENUS);
    return data ? JSON.parse(data) : [];
  },
  saveMenus(menus) {
    localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
  },
  getInventory() {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : [];
  },
  saveInventory(inv) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv));
  },
  getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { babyMode: false };
  },
  saveSettings(s) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
  },
  exportAll() {
    return JSON.stringify({
      recipes: this.getRecipes(),
      menus: this.getMenus(),
      inventory: this.getInventory(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    }, null, 2);
  },
  importAll(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.recipes) this.saveRecipes(data.recipes);
    if (data.menus) this.saveMenus(data.menus);
    if (data.inventory) this.saveInventory(data.inventory);
    if (data.settings) this.saveSettings(data.settings);
    return true;
  },
  parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] ? cols[idx].trim() : '';
      });
      const ings = [];
      for (let k = 1; k <= 5; k++) {
        const v = obj['食材' + k];
        if (v) ings.push(v);
      }
      out.push({
        name: obj['菜名'],
        category: obj['分类'],
        mainIngredient: obj['主要食材'],
        preference: parseInt(obj['喜爱'] || 3),
        cookTime: parseInt(obj['用时(分钟)'] || 30),
        difficulty: obj['难度'] || 'easy',
        ingredients: ings,
        lastEaten: null
      });
    }
    return out;
  }
};
