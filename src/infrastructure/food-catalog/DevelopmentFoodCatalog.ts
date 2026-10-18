import type { CatalogFood, FoodCatalogProvider } from '../../features/food-catalog/domain/types';

// Illustrative development nutrition, not verified commercial product information.
const rows: readonly [string, string, number, number, number, number, string?, string?][] = [
  ['eggs','Яйца',143,12.6,9.5,0.7], ['oats','Овсяные хлопья',370,13,7,60],
  ['chicken','Куриная грудка',165,31,3.6,0], ['rice','Рис отварной',130,2.7,0.3,28],
  ['banana','Банан',89,1.1,0.3,22.8], ['yogurt','Греческий йогурт',65,10,1.2,3.8],
  ['curd','Творог 5%',121,17,5,1.8], ['milk','Молоко 2,5%',52,3,2.5,4.7],
  ['bread','Хлеб цельнозерновой',247,13,4.2,41], ['cheese','Сыр',350,25,27,0.5],
  ['salmon','Лосось',208,20,13,0], ['tuna','Тунец в собственном соку',116,26,1,0],
  ['potato','Картофель',80,2,0.1,17], ['pasta','Макароны отварные',158,5.8,0.9,31],
  ['avocado','Авокадо',160,2,14.7,8.5], ['apple','Яблоко',52,0.3,0.2,14],
  ['peanut-butter','Арахисовая паста',588,25,50,20], ['protein','Протеин Gold Standard',380,75,5,7,'Optimum Nutrition','протеин protein'],
  ['kefir','Кефир 1%',40,3,1,4], ['turkey','Индейка',135,29,1.6,0],
  ['tilda','Tilda Basmati Rice',150,3.2,1.1,31.4,'Tilda','рис басмати rice'],
  ['john-west','John West Tuna',110,25,1,0,'John West','тунец tuna'],
  ['valio','Греческий йогурт',73,10,1.8,4.2,'Valio','йогурт yogurt'],
  ['barilla','Спагетти Integrale',350,13,2.5,65,'Barilla','макароны pasta'],
  ['olive-oil','Оливковое масло',884,0,100,0], ['broccoli','Брокколи',34,2.8,0.4,6.6],
];
const normalize = (text: string) => text.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');
const catalog = rows.map(([id,name,kcal,p,f,c,brand,aliases]) => ({
  food: { source: { providerId: 'chebufit-development', foodId: id }, name, ...(brand ? { brand } : {}), basis: 'per100g',
    nutrients: { energyCentiKcal: Math.round(kcal*100), proteinMg: Math.round(p*1000), fatMg: Math.round(f*1000), carbsMg: Math.round(c*1000) } } satisfies CatalogFood,
  searchable: normalize([name,brand,aliases].filter(Boolean).join(' ')),
}));
const copy = (food: CatalogFood): CatalogFood => ({ ...food, source: { ...food.source }, nutrients: { ...food.nutrients } });
export function createDevelopmentFoodCatalog(): FoodCatalogProvider {
  return {
    disclosure: 'illustrativeNutrition',
    async searchFoods(query, context) {
      const words = normalize(query.text).split(/\s+/).filter(Boolean);
      const matching = words.length ? catalog.filter(item => words.every(word => item.searchable.includes(word))) : [];
      return { ok: true, value: { foods: matching.slice(0, context?.limit ?? 30).map(item => copy(item.food)) } };
    },
    async getSuggestions() { return { ok: true, value: catalog.slice(0, 6).map(item => copy(item.food)) }; },
  };
}
