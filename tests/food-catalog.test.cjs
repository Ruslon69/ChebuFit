const assert=require('node:assert/strict'),{test}=require('node:test'),path=require('node:path');
const root=process.env.CHEBUFIT_BUILD,load=p=>require(path.join(root,p));
const {createDevelopmentFoodCatalog}=load('infrastructure/food-catalog/DevelopmentFoodCatalog.js');
const {createFoodSearchController}=load('features/food-catalog/application/FoodSearchController.js');
const {catalogFoodIdentity,catalogFoodToSnapshot,parseCatalogFood,previewCatalogFood}=load('features/food-catalog/domain/catalogFood.js');
const {foodNutrientLine}=load('features/food-catalog/model/messages.js');
const {createKeyValueRecentFoodsRepository}=load('infrastructure/food-catalog/KeyValueRecentFoodsRepository.js');
const {createFoodAddOperation}=load('application/nutrition/addCatalogFood.js');
const {rewardFoodEntryAdded}=load('application/rewards/foodEntryRewards.js');
const {rewardWaterGoalReached}=load('application/rewards/waterGoalRewards.js');
const {createKeyValueNutritionRepository}=load('infrastructure/nutrition/KeyValueNutritionRepository.js');
const {createKeyValueOrangeWalletRepository}=load('infrastructure/rewards/KeyValueOrangeWalletRepository.js');
const n=load('features/nutrition/index.js'),r=load('features/rewards/index.js');
const {parseAddFoodContext,parseQuantityDraft}=load('features/nutrition/model/diaryPresentation.js');
const ok=r=>{assert.equal(r.ok,true,JSON.stringify(r));return r.value},day='2026-10-18',stamp='2026-10-18T14:00:00+02:00',context={localDay:day,occurredAt:stamp};
const provider=createDevelopmentFoodCatalog(),find=async q=>ok(await provider.searchFoods({text:q})).foods;
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function clock(){let id=0;const tasks=new Map();return{set(fn,ms){assert.equal(ms,300);tasks.set(++id,fn);return id},clear(id){tasks.delete(id)},run(){const pending=[...tasks.values()];tasks.clear();pending.forEach(fn=>fn())},get size(){return tasks.size}}}
let fixtures=0;
function fixture(){
 const data=new Map(),identity='food-add-'+(++fixtures);let id=0,fail=null;
 const storage={async getItem(k){return data.get(k)??null},async setItem(k,v){if(fail&&k.includes(fail))throw Error('disk');data.set(k,v)}};
 const nutrition=()=>n.createNutritionService({...createKeyValueNutritionRepository(storage,'real'),identity},{now:()=>stamp,nextId:()=>`${identity}-${++id}`});
 const wallet=()=>r.createOrangeWalletService({...createKeyValueOrangeWalletRepository(storage,'developmentDemo'),identity:identity+'-wallet'},{now:()=>stamp});
 const recents=()=>createKeyValueRecentFoodsRepository(storage,'developmentDemo');
 const operation=()=>createFoodAddOperation({nutrition:nutrition(),wallet:wallet(),recents:recents()});
 const add=async(input={})=>operation().submit({food:(await find('бан'))[0],localDate:day,meal:'breakfast',quantityGrams:170,rewardContext:context,...input});
 return{data,storage,nutrition,wallet,recents,operation,add,fail:value=>{fail=value}};
}
test('A/Q: route carries explicit historical date/meal; changing meal does not replace product or date',()=>{
 assert.deepEqual(parseAddFoodContext({date:'2026-10-17',meal:'dinner'},day),{date:'2026-10-17',meal:'dinner'});
 assert.equal(parseAddFoodContext({date:'2026-10-19',meal:'dinner'},day),null);
});
test('D/E/J/K: deterministic 26-food catalog supports Russian/brand partial, case-insensitive multiword matching',async()=>{
 assert.equal((await find('рис')).length,2);assert.equal((await find('TILDA'))[0].source.foodId,'tilda');
 assert.deepEqual(await find('тунец'),await find('ТУНЕЦ'));assert.equal((await find('john'))[0].brand,'John West');
 assert.equal((await find('tilda рис'))[0].source.foodId,'tilda');assert.equal((await find('бан'))[0].name,'Банан');
 assert.equal((await find('zzzz-no-food')).length,0);
 const food=(await find('tilda'))[0];assert.equal(foodNutrientLine(food.nutrients,'ru'),'150 ккал · Б 3,2 · Ж 1,1 · У 31,4');
 assert.equal(catalogFoodIdentity(food),'["chebufit-development","tilda"]');
 assert.equal(typeof provider.getByBarcode,'undefined');
});
test('B/C: empty and whitespace queries remain initial and never invoke search; suggestions are not history',async()=>{
 const scheduler=clock();let calls=0;
 const c=createFoodSearchController({...provider,async searchFoods(){calls++;return{ok:true,value:{foods:[]}}}},{scheduler});
 await c.start();assert.equal(c.getSnapshot().status,'initial');assert.equal(c.getSnapshot().foods.length,6);
 c.setQuery('   ');scheduler.run();await flush();assert.equal(c.getSnapshot().status,'initial');assert.equal(calls,0);c.dispose();
});
test('F: debounce coalesces rapid queries, trims input, and never lets old results replace newer results',async()=>{
 const scheduler=clock(),pending=new Map(),queries=[];
 const c=createFoodSearchController({...provider,searchFoods(q){queries.push(q.text);return new Promise(resolve=>pending.set(q.text,resolve))}},{scheduler});
 await c.start();c.setQuery('б');c.setQuery(' ба ');assert.equal(scheduler.size,1);assert.equal(queries.length,0);scheduler.run();
 c.setQuery(' tilda ');scheduler.run();assert.deepEqual(queries,['ба','tilda']);
 pending.get('tilda')({ok:true,value:{foods:await find('tilda')}});await flush();assert.equal(c.getSnapshot().foods[0].source.foodId,'tilda');
 pending.get('ба')({ok:true,value:{foods:await find('бан')}});await flush();assert.equal(c.getSnapshot().query,'tilda');c.dispose();
});
test('F: clearing/disposal cancels in-flight generation, including failures and slow suggestions',async()=>{
 const scheduler=clock();let resolveSearch,resolveSuggestions;
 const c=createFoodSearchController({searchFoods(){return new Promise(resolve=>{resolveSearch=resolve})},getSuggestions(){return new Promise(resolve=>{resolveSuggestions=resolve})}},{scheduler});
 void c.start();c.setQuery('бан');scheduler.run();c.setQuery('');resolveSearch({ok:false,error:'providerUnavailable'});await flush();assert.equal(c.getSnapshot().status,'initial');
 c.dispose();resolveSuggestions({ok:true,value:await find('бан')});await flush();assert.equal(c.getSnapshot().foods.length,0);
});
test('G/H/I: no results, provider failure, thrown failure and retry have deliberate async states',async()=>{
 const scheduler=clock();let attempt=0;
 const c=createFoodSearchController({...provider,async searchFoods(){attempt++;if(attempt===1)return{ok:false,error:'providerUnavailable'};if(attempt===2)throw Error('network');return{ok:true,value:{foods:[]}}}},{scheduler});
 await c.start();c.setQuery('missing');assert.equal(c.getSnapshot().status,'searching');scheduler.run();await flush();assert.equal(c.getSnapshot().status,'error');
 await c.retry();assert.equal(c.getSnapshot().status,'error');await c.retry();assert.equal(c.getSnapshot().status,'empty');c.dispose();
});
test('malformed provider response fails instead of displaying plausible fake food',async()=>{
 const scheduler=clock(),c=createFoodSearchController({...provider,async searchFoods(){return{ok:true,value:{foods:[{name:'bad'}]}}}},{scheduler});
 c.setQuery('bad');scheduler.run();await flush();assert.equal(c.getSnapshot().status,'error');c.dispose();
});
test('L–P: 100g default basis, positive decimal quantity, exact existing domain rounding and overflow protections',async()=>{
 const food=(await find('tilda'))[0];assert.deepEqual(ok(previewCatalogFood(food,100)),food.nutrients);
 assert.equal(parseQuantityDraft('150,5'),150.5);for(const grams of[0,-1,Infinity])assert.equal(previewCatalogFood(food,grams).ok,false);
 assert.deepEqual(ok(previewCatalogFood(food,250)),{energyCentiKcal:37500,proteinMg:8000,fatMg:2750,carbsMg:78500});
 const quantity=ok(n.quantityFromGrams(33.333));assert.deepEqual(ok(previewCatalogFood(food,33.333)),ok(n.entryNutrition({food:ok(catalogFoodToSnapshot(food)),quantity})));
});
test('S: snapshot conversion detaches provider nutrition and preserves source/brand/barcode',async()=>{
 const food={...(await find('tilda'))[0],barcode:'1234567890123'};const snapshot=ok(catalogFoodToSnapshot(food));
 assert.deepEqual(snapshot.source,{provider:'chebufit-development',externalId:'tilda',barcode:'1234567890123'});assert.equal(snapshot.brand,'Tilda');
 food.nutrients.energyCentiKcal=1;assert.equal(snapshot.nutrients.energyCentiKcal,15000);
 assert.equal(parseCatalogFood({...food,nutrients:{...food.nutrients,fatMg:-1}}).ok,false);
});
test('R–X/AB/AF/AG/AH: real Add persists correct snapshot/date/meal/quantity/totals and one +17 celebration from demo 248',async()=>{
 const f=fixture();assert.equal(ok(await f.wallet().loadWallet()).balance,248);
 const added=ok(await f.add());assert.equal(added.change.entry.localDate,day);assert.equal(added.change.entry.meal,'breakfast');assert.equal(added.change.entry.quantity.milliGrams,170000);
 assert.equal(added.change.view.summary.totals.energyCentiKcal,15130);
 assert.deepEqual(added.notice,{id:`food:${added.change.entry.id}`,amount:17,includesWelcome:true,kind:'celebration'});
 const wallet=ok(await f.wallet().loadWallet());assert.equal(wallet.balance,265);assert.deepEqual(wallet.state.ledger.map(e=>e.grant.eventType),['mealLogged','activeDayQualified','welcomeReward']);
 assert.equal(wallet.state.ledger.some(e=>e.grant.eventType==='plannedMealsCompleted'),false);
 assert.deepEqual(ok(await f.nutrition().getDay(day)),added.change.view);
});
test('Y: repeated/concurrent submission of one selection commits one entry, one recent, one reward batch',async()=>{
 const f=fixture(),operation=f.operation(),input={food:(await find('бан'))[0],localDate:day,meal:'breakfast',quantityGrams:170,rewardContext:context};
 const results=await Promise.all(Array.from({length:20},()=>operation.submit(input)));results.forEach(ok);
 assert.equal(new Set(results.map(r=>r.value.change.entry.id)).size,1);assert.equal(ok(await f.nutrition().getDay(day)).diary.entries.length,1);
 assert.equal(ok(await f.wallet().loadWallet()).state.ledger.length,3);assert.equal(ok(await f.recents().load()).length,1);
 assert.deepEqual(await operation.submit(input),results[0]);
});
test('Z/AA: seed, search, select/preview, cancel, read and relaunch never grant or fabricate recents',async()=>{
 const f=fixture(),wallet=ok(await f.wallet().loadWallet());
 const demo=n.createNutritionService({...createKeyValueNutritionRepository(f.storage,'developmentDemo'),identity:'seed-'+fixtures},{now:()=>stamp,nextId:()=> 'not-used'});
 ok(await demo.getDay(day));ok(await demo.getDay(day));const food=(await find('бан'))[0];ok(previewCatalogFood(food,170));
 assert.deepEqual(ok(await f.wallet().loadWallet()),wallet);assert.deepEqual(ok(await f.recents().load()),[]);
});
test('AC/AD/AI: delete/re-add, edit/move and persisted replay cannot farm rewards or reverse grants',async()=>{
 const f=fixture(),first=ok(await f.add()),earned=ok(await f.wallet().loadWallet());
 ok(await f.nutrition().updateEntryDetails(day,first.change.entry.id,{meal:'lunch',quantityGrams:150}));ok(await f.nutrition().deleteEntry(day,first.change.entry.id));
 assert.deepEqual(ok(await f.wallet().loadWallet()),earned);
 const second=ok(await f.add());assert.equal(second.notice,null);assert.equal(ok(await f.wallet().loadWallet()).balance,265);
 const replay=await rewardFoodEntryAdded(f.wallet(),first.change.fact,context);assert.equal(ok(replay).amount,0);assert.equal(r.createOrangeRewardNotice(replay,'replay'),null);
});
test('AE: next local action day grants +7 again, never another welcome',async()=>{
 const f=fixture();ok(await f.add());const tomorrow={localDay:'2026-10-19',occurredAt:'2026-10-19T12:00:00+02:00'};
 const added=ok(await f.add({localDate:'2026-10-19',rewardContext:tomorrow}));assert.equal(added.notice.amount,7);assert.equal(added.notice.kind,'micro');assert.equal(ok(await f.wallet().loadWallet()).balance,272);
});
test('AJ/AK: Water welcome/active day are respected; first Food adds only +2 and feedback is micro',async()=>{
 const f=fixture();assert.equal(ok(await rewardWaterGoalReached(f.wallet(),context)).amount,17);
 const added=ok(await f.add());assert.equal(added.notice.amount,2);assert.equal(added.notice.kind,'micro');assert.equal(added.notice.includesWelcome,false);
 assert.equal(ok(await rewardWaterGoalReached(f.wallet(),context)).amount,0);assert.equal(ok(await f.wallet().loadWallet()).balance,267);
});
test('historical meal/date persist exactly; action day is current and cannot be farmed by cycling diary dates',async()=>{
 const f=fixture();const first=ok(await f.add({localDate:'2026-10-15',meal:'dinner'}));
 assert.equal(first.change.entry.localDate,'2026-10-15');assert.equal(first.change.entry.meal,'dinner');assert.equal(first.notice.amount,17);
 const second=ok(await f.add({localDate:'2026-10-16',meal:'lunch'}));assert.equal(second.notice,null);
 const grants=ok(await f.wallet().loadWallet()).state.ledger;assert.ok(grants.every(e=>e.grant.localDay===day));
 assert.equal(ok(await f.nutrition().getDay(day)).diary.entries.length,0);
});
test('failed diary save grants nothing and records no recent; retry is safe',async()=>{
 const f=fixture(),operation=f.operation(),input={food:(await find('бан'))[0],localDate:day,meal:'breakfast',quantityGrams:170,rewardContext:context};
 f.fail('nutrition');assert.equal((await operation.submit(input)).ok,false);assert.equal(ok(await f.wallet().loadWallet()).balance,248);assert.deepEqual(ok(await f.recents().load()),[]);
 f.fail(null);assert.equal(ok(await operation.submit(input)).notice.amount,17);
});
test('wallet failure leaves committed food intact, no fake feedback, and same operation cannot add twice',async()=>{
 const f=fixture(),operation=f.operation(),input={food:(await find('бан'))[0],localDate:day,meal:'breakfast',quantityGrams:170,rewardContext:context};
 f.fail('orange-wallet');
 const first=ok(await operation.submit(input));
 assert.equal(first.change.view.diary.entries.length,1);
 assert.equal(first.rewardFailed,true);assert.equal(first.notice,null);assert.equal(ok(await f.recents().load()).length,1);
 assert.deepEqual(ok(await operation.submit(input)),first);assert.equal(ok(await f.nutrition().getDay(day)).diary.entries.length,1);
});
test('recent failure never undoes committed diary/rewards or asks user to repeat Add',async()=>{
 const f=fixture();f.fail('recent-foods');const added=ok(await f.add());assert.equal(added.recentSaved,false);assert.equal(added.notice.amount,17);assert.equal(added.change.view.diary.entries.length,1);
});
test('recents are persistent, newest-first, deduplicated by provider identity and bounded to 30',async()=>{
 const f=fixture(),banana=(await find('бан'))[0],tilda=(await find('tilda'))[0];
 ok(await f.add());ok(await f.add({food:tilda}));ok(await f.add());const recent=ok(await f.recents().load());
 assert.deepEqual(recent.map(r=>r.food.source.foodId),['banana','tilda']);
 for(let i=0;i<35;i++)ok(await f.recents().record({...banana,source:{...banana.source,foodId:'food-'+i}},stamp));
 const capped=ok(await f.recents().load());assert.equal(capped.length,30);assert.equal(capped[0].food.source.foodId,'food-34');
});
test('recent corrupt/unsupported data fails safely, preserves raw state, and demo/real stores stay isolated',async()=>{
 const f=fixture(),key='@chebufit/recent-foods/developmentDemo',food=(await find('бан'))[0];
 for(const raw of ['bad','null','{"schemaVersion":2}','{"schemaVersion":1,"foods":[{}]}']){
 f.data.set(key,raw);assert.equal((await f.recents().load()).ok,false);assert.equal((await f.recents().record(food,stamp)).ok,false);assert.equal(f.data.get(key),raw);
 }
 assert.deepEqual(ok(await createKeyValueRecentFoodsRepository(f.storage,'real').load()),[]);
});
test('provider duplicate identities collapse into one stable result; subscriber errors cannot corrupt search state',async()=>{
 const food=(await find('tilda'))[0],scheduler=clock();
 const c=createFoodSearchController({...provider,async searchFoods(){return{ok:true,value:{foods:[food,food]}}}},{scheduler});
 c.subscribe(()=>{throw Error('consumer')});c.setQuery('tilda');scheduler.run();await flush();
 assert.equal(c.getSnapshot().status,'results');assert.equal(c.getSnapshot().foods.length,1);c.dispose();
});
test('catalog normalization rejects invalid identity, barcode, image URL, serving, and fractional canonical nutrients',async()=>{
 const food=(await find('tilda'))[0];
 for(const changes of [{source:{providerId:'',foodId:'a'}},{barcode:''},{barcode:2},{imageUrl:'file:///private/file'},{serving:{label:'piece',grams:0}},{nutrients:{...food.nutrients,proteinMg:1.5}}])assert.equal(parseCatalogFood({...food,...changes}).ok,false);
});
