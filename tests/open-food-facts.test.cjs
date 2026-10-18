const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=p=>require(path.join(process.env.CHEBUFIT_BUILD,p));
const fixtures=require('./fixtures/open-food-facts/responses.json');
const {createOpenFoodFactsProvider}=load('infrastructure/food-catalog/OpenFoodFactsProvider.js');
const {mapOpenFoodFactsProduct,isOffBarcode}=load('infrastructure/food-catalog/openFoodFactsMapping.js');
const {createFoodSearchController}=load('features/food-catalog/application/FoodSearchController.js');
const {catalogFoodToSnapshot,previewCatalogFood}=load('features/food-catalog/domain/catalogFood.js');
const {createFoodAddOperation}=load('application/nutrition/addCatalogFood.js');
const {createKeyValueRecentFoodsRepository}=load('infrastructure/food-catalog/KeyValueRecentFoodsRepository.js');
const {createKeyValueNutritionRepository}=load('infrastructure/nutrition/KeyValueNutritionRepository.js');
const {createKeyValueOrangeWalletRepository}=load('infrastructure/rewards/KeyValueOrangeWalletRepository.js');
const {rewardWaterGoalReached}=load('application/rewards/waterGoalRewards.js');
const n=load('features/nutrition/index.js'),r=load('features/rewards/index.js');
const ok=x=>{assert.equal(x.ok,true,JSON.stringify(x));return x.value},clone=x=>structuredClone(x),languages=['ru','en','nl'];
const map=x=>mapOpenFoodFactsProduct(x,languages),response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers});
function provider(body={products:[fixtures.legacy]},options={}) {
 let time=100000,calls=[];
 const config={userAgent:'ChebuFit/1.0 (https://github.com/Ruslon69/ChebuFit)',languages,countryCode:'nl',now:()=>time,
 fetch:async(url,init)=>{calls.push({url:new URL(url),init});return response(body)},...options};
 return {p:createOpenFoodFactsProvider(config),calls,advance:ms=>{time+=ms}};
}
test('A–H/O/P: legacy and v3 map explicit kcal, grams, brand, identity and language fallback',()=>{
 const food=map(fixtures.legacy);assert.equal(food.name,'Тунец в собственном соку');assert.equal(food.brand,'John West');assert.equal(food.barcode,fixtures.legacy.code);
 assert.deepEqual(food.nutrients,{energyCentiKcal:11000,proteinMg:25000,fatMg:1000,carbsMg:0});
 assert.equal(map({...fixtures.legacy,product_name_ru:''}).name,'Tuna in spring water');
 const noBrand=clone(fixtures.legacy);delete noBrand.brands;assert.equal(map(noBrand).brand,undefined);
 assert.deepEqual(map(fixtures.v3).nutrients,{energyCentiKcal:53900,proteinMg:6300,fatMg:30900,carbsMg:57500});
});
test('I–M: missing is not zero; malformed, negative, infinite, absurd or incomplete products are omitted',()=>{
 for(const key of ['energy-kcal_100g','proteins_100g','fat_100g','carbohydrates_100g']) {
  const missing=clone(fixtures.legacy);delete missing.nutriments[key];assert.equal(map(missing),null,key);
  for(const bad of[-1,NaN,Infinity,'bad','',null,true,'1e2','0x10',[],{}]){const product=clone(fixtures.legacy);product.nutriments[key]=bad;assert.equal(map(product),null,key+String(bad));}
 }
 for(const product of[null,[],{}, {...fixtures.legacy,code:''},{...fixtures.legacy,product_name_ru:'',product_name:''}, {...fixtures.legacy,nutriments:{...fixtures.legacy.nutriments,'energy-kcal_100g':1001}}, {...fixtures.legacy,nutriments:{...fixtures.legacy.nutriments,proteins_100g:101}}])assert.equal(map(product),null);
 const oil={...fixtures.legacy,nutriments:{'energy-kcal_100g':900,proteins_100g:0,fat_100g:100,carbohydrates_100g:0}};assert.ok(map(oil));
 assert.ok(map({...oil,nutriments:{...oil.nutriments,'energy-kcal_100g':'900.0'}}));
});
test('H: kJ-only and prepared/volume profiles never become kcal per100g',()=>{
 const product=clone(fixtures.legacy);delete product.nutriments['energy-kcal_100g'];assert.equal(map(product),null);
 for(const per of ['100ml','serving']){const p=clone(fixtures.v3);p.nutrition.aggregated_set.per=per;assert.equal(map(p),null);}
 for(const patch of [{preparation:'prepared'},{nutrients:{'energy-kj':{value:460,unit:'kJ'}}}]){const p=clone(fixtures.v3);Object.assign(p.nutrition.aggregated_set,patch);assert.equal(map(p),null);}
 const p=clone(fixtures.v3);p.nutrition.aggregated_set.nutrients['energy-kcal'].unit='kJ';assert.equal(map(p),null);
 for(const changes of[{product_quantity_unit:'ml'},{quantity:'1 L'},{serving_quantity_unit:'ml'},{nutrition_data_per:'100ml'}])assert.equal(map({...fixtures.legacy,...changes}),null);
 const normalized=clone(fixtures.legacy);normalized.nutrition_data_per='serving';normalized.nutriments['energy-kcal_serving']=999;assert.equal(map(normalized).nutrients.energyCentiKcal,11000);
});
test('legacy unit/modifier safeguards and context overrides are explicit',async()=>{
 for(const [key,value] of [['proteins_unit','mg'],['fat_modifier','<'],['energy-kcal_unit','kJ']]){const p=clone(fixtures.legacy);p.nutriments[key]=value;assert.equal(map(p),null);}
 const f=provider({product:fixtures.v3});ok(await f.p.getByBarcode(fixtures.v3.code,{languages:['en','nl'],countryCode:'BE'}));assert.equal(f.calls[0].url.searchParams.get('lc'),'en');assert.equal(f.calls[0].url.searchParams.get('cc'),'be');
});
test('names are sanitized; malformed current schema cannot silently fall back to legacy',()=>{
 assert.equal(map({...fixtures.legacy,product_name_ru:'<b>Тунец</b>\n рыба'}).name,'Тунец рыба');
 assert.equal(map({...fixtures.legacy,product_name_ru:'undefined',product_name:'en:raw-taxonomy',generic_name:'Еда'}).name,'Еда');
 assert.equal(map({...fixtures.legacy,nutrition:{}}),null);
 const p=clone(fixtures.v3);p.nutrition.aggregated_set.nutrients.proteins.modifier='<';assert.equal(map(p),null);
});
test('N/Q/R: bounded fields/page, valid results deduplicate, quality filtering preserves relevance',async()=>{
 const rows=[fixtures.legacy,fixtures.legacy,{...fixtures.legacy,nutriments:{}},...Array.from({length:40},(_,i)=>({...fixtures.legacy,code:String(5000000000000+i)}))];
 const f=provider({products:rows});const foods=ok(await f.p.searchFoods({text:'  John West  '},{limit:99})).foods;
 assert.equal(foods.length,20);assert.equal(foods[0].barcode,fixtures.legacy.code);assert.equal(new Set(foods.map(f=>f.barcode)).size,20);
 const url=f.calls[0].url;assert.equal(url.pathname,'/cgi/search.pl');assert.equal(url.searchParams.get('search_terms'),'John West');assert.equal(url.searchParams.get('page_size'),'25');
 const fields=url.searchParams.get('fields').split(',');assert.ok(fields.includes('nutriments'));assert.ok(fields.includes('nutrition.aggregated_set'));assert.ok(fields.includes('product_name_ru'));
 for(const unwanted of['ingredients','packagings','knowledge_panels','images'])assert.equal(fields.includes(unwanted),false);
 assert.equal(f.calls[0].init.credentials,'omit');assert.match(f.calls[0].init.headers['User-Agent'],/^ChebuFit\//);
});
test('S/T: empty, tiny and symbol-only queries do not use network; Cyrillic is preserved',async()=>{
 const f=provider();for(const text of['','  ','б','!','--'])assert.equal((await f.p.searchFoods({text})).error,'invalidQuery');assert.equal(f.calls.length,0);
 ok(await f.p.searchFoods({text:'тунец'}));assert.equal(f.calls[0].url.searchParams.get('search_terms'),'тунец');
});
test('V/W: request spacing and 429/503 cooldown respect Retry-After, with no automatic retries',async()=>{
 const f=provider();ok(await f.p.searchFoods({text:'Tilda'}));assert.equal((await f.p.searchFoods({text:'Milka'})).error,'rateLimited');assert.equal(f.calls.length,1);f.advance(12000);ok(await f.p.searchFoods({text:'Milka'}));
 for(const [status,error] of[[429,'rateLimited'],[503,'server']]){
 let calls=0;const p=provider({}, {fetch:async()=>{calls++;return response({},status,{'Retry-After':'90'})}});
 const result=await p.p.searchFoods({text:'Milk'});assert.equal(result.error,error);assert.equal(result.retryAfterMs,90000);
 assert.equal((await p.p.searchFoods({text:'Other'})).error,'rateLimited');assert.equal(calls,1);
 p.advance(90000);await p.p.searchFoods({text:'Milk'});assert.equal(calls,2);
 }
});
test('U/X: network, timeout, malformed JSON/shape and cancellation remain distinct',async()=>{
 for(const [fetch,error] of[[async()=>{throw Error('offline')},'network'],[async()=>new Response('{bad'),'malformedResponse'],[async()=>response(fixtures.malformed),'malformedResponse']]){
 assert.equal((await provider({}, {fetch}).p.searchFoods({text:'John'})).error,error);
 }
 const pending=(_,init)=>new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(Error('aborted'))));
 assert.equal((await provider({}, {fetch:pending,timeoutMs:5}).p.searchFoods({text:'John'})).error,'timeout');
 const abort=new AbortController(),f=provider();abort.abort();assert.equal((await f.p.searchFoods({text:'John'},{signal:abort.signal})).error,'cancelled');assert.equal(f.calls.length,0);
});
test('Y/Z: exact v3.6 barcode reads, contextual language/market, not-found and incomplete product',async()=>{
 const f=provider({status:'success',product:fixtures.v3});assert.ok(isOffBarcode(fixtures.v3.code));assert.equal(ok(await f.p.getByBarcode(fixtures.v3.code)).barcode,fixtures.v3.code);
 assert.equal(f.calls[0].url.pathname,'/api/v3.6/product/'+fixtures.v3.code);assert.equal(f.calls[0].url.searchParams.get('cc'),'nl');assert.equal(f.calls[0].url.searchParams.get('lc'),'ru');
 assert.equal(ok(await provider({}, {fetch:async()=>response({},404)}).p.getByBarcode(fixtures.v3.code)),null);
 assert.equal(ok(await provider(fixtures.notFound).p.getByBarcode(fixtures.v3.code)),null);
 assert.equal((await provider({product:{code:fixtures.v3.code}}).p.getByBarcode(fixtures.v3.code)).error,'invalidFood');
 for(const code of['','abc','123','00000000','1234567890123?x=1'])assert.equal((await provider().p.getByBarcode(code)).error,'invalidBarcode');
});
test('remote policy never sends requests while typing; explicit submit, stale cancellation, retry and prior results',async()=>{
 let calls=0,resolve;const p={searchPolicy:{trigger:'submit',minimumLength:2},getSuggestions:async()=>({ok:true,value:[]}),searchFoods:async()=>{calls++;return new Promise(r=>{resolve=r})}};
 const c=createFoodSearchController(p);await c.start();for(const q of['J','Jo','John'])c.setQuery(q);assert.equal(calls,0);assert.equal(c.getSnapshot().status,'ready');
 const pending=c.submit();c.submit();assert.equal(calls,1);resolve({ok:true,value:{foods:[map(fixtures.legacy)]}});await pending;
 assert.equal(c.getSnapshot().status,'results');c.setQuery('Tilda');assert.equal(calls,1);assert.equal(c.getPrevious().foods.length,1);
 const stale=c.submit();c.setQuery('Milka');resolve({ok:false,error:'network'});await stale;assert.equal(c.getSnapshot().status,'ready');
 c.setQuery('  ');await c.submit();assert.equal(c.getSnapshot().status,'initial');assert.equal(calls,2);c.dispose();
});
test('rate-limit state retains typed reason/cooldown and previous good foods',async()=>{
 let count=0;const c=createFoodSearchController({searchPolicy:{trigger:'submit',minimumLength:2},getSuggestions:async()=>({ok:true,value:[]}),searchFoods:async()=>++count===1?{ok:true,value:{foods:[map(fixtures.legacy)]}}:{ok:false,error:'rateLimited',retryAfterMs:60000}});
 c.setQuery('John');await c.submit();c.setQuery('Tilda');await c.submit();assert.equal(c.getSnapshot().error,'rateLimited');assert.ok(c.getSnapshot().retryAt>Date.now());await c.retry();assert.equal(count,2);assert.equal(c.getPrevious().foods.length,1);c.dispose();
});
test('AA–AM: OFF selection/preview, persistent snapshot/recents, offline re-add, reward anti-farm and Water coexist',async()=>{
 const data=new Map(),storage={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{data.set(k,v)}};let id=0;
 const day='2026-10-18',stamp='2026-10-18T12:00:00+02:00';
 const nutrition=()=>n.createNutritionService({...createKeyValueNutritionRepository(storage,'real'),identity:'off-diary'},{now:()=>stamp,nextId:()=>`off-${++id}`});
 const wallet=()=>r.createOrangeWalletService({...createKeyValueOrangeWalletRepository(storage,'developmentDemo'),identity:'off-wallet'},{now:()=>stamp});
 const recents=()=>createKeyValueRecentFoodsRepository(storage,'real'),food=ok(await provider().p.searchFoods({text:'John'})).foods[0];
 assert.deepEqual(ok(previewCatalogFood(food,100)),food.nutrients);assert.equal(ok(previewCatalogFood(food,250)).energyCentiKcal,27500);
 assert.deepEqual(ok(await wallet().loadWallet()).balance,248);
 const add=(f=food)=>createFoodAddOperation({nutrition:nutrition(),wallet:wallet(),recents:recents()}).submit({food:f,localDate:'2026-10-17',meal:'dinner',quantityGrams:250,rewardContext:{localDay:day,occurredAt:stamp}});
 const first=ok(await add());assert.equal(first.notice.amount,17);assert.equal(first.notice.kind,'celebration');assert.equal(first.change.entry.meal,'dinner');assert.equal(first.change.entry.localDate,'2026-10-17');
 const snapshot=first.change.entry.food;assert.equal(snapshot.source.provider,'open-food-facts');assert.equal(snapshot.source.externalId,food.barcode);assert.equal(snapshot.source.barcode,food.barcode);
 food.nutrients.energyCentiKcal=999;assert.equal(snapshot.nutrients.energyCentiKcal,11000);assert.equal(ok(await nutrition().getDay('2026-10-17')).summary.totals.energyCentiKcal,27500);
 const recent=ok(await recents().load())[0].food;assert.equal(recent.nutrients.energyCentiKcal,11000);
 const offline=provider({}, {fetch:async()=>{throw Error('offline')}});assert.equal((await offline.p.searchFoods({text:'John'})).error,'network');
 assert.equal(ok(await add(recent)).notice,null);ok(await nutrition().deleteEntry('2026-10-17',first.change.entry.id));assert.equal(ok(await add(recent)).notice,null);
 assert.equal(ok(await wallet().loadWallet()).balance,265);assert.equal(ok(await rewardWaterGoalReached(wallet(),{localDay:day,occurredAt:stamp})).amount,2);
 assert.equal(ok(await recents().load()).length,1);assert.equal(ok(await nutrition().getDay('2026-10-17')).diary.entries.length,2);
});
