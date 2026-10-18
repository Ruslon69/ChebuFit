const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const root=process.env.CHEBUFIT_BUILD;
const n=require(path.join(root,'features/nutrition/index.js'));
const {createKeyValueNutritionRepository}=require(path.join(root,'infrastructure/nutrition/KeyValueNutritionRepository.js'));
const {createOrangeWalletService}=require(path.join(root,'features/rewards/index.js'));
const {createKeyValueOrangeWalletRepository}=require(process.env.CHEBUFIT_WALLET_ADAPTER_BUILD);
const day='2026-10-18',next='2026-10-19',stamp='2026-10-18T23:30:00-03:00';
const food=()=>({foodId:'yogurt',name:'Греческий йогурт',brand:'Example',source:{provider:'custom',externalId:'yogurt-1',barcode:'1234567890123'},basis:'per100g',nutrients:{energyCentiKcal:12000,proteinMg:10000,fatMg:5000,carbsMg:8000}});
const ok=r=>{assert.equal(r.ok,true,JSON.stringify(r));return r.value};
let fixtures=0;
function fixture(mode='real'){
 const data=new Map(),identity='nutrition-test-'+(++fixtures);let id=0,now=stamp,failRead=false,failWrite=false,writes=0;
 const storage={async getItem(key){if(failRead)throw Error('read');return data.get(key)??null},async setItem(key,value){if(failWrite)throw Error('write');writes++;data.set(key,value)}};
 const repository=()=>({...createKeyValueNutritionRepository(storage,mode),identity});
 const service=()=>n.createNutritionService(repository(),{now:()=>now,nextId:()=>`entry-${++id}`,allowDevelopmentReset:true});
 const add=(grams=200,meal='breakfast',localDate=day)=>service().addEntry({localDate,meal,food:food(),quantityGrams:grams});
 return {data,storage,repository,service,add,key:`@chebufit/nutrition/${mode}`,clock:value=>{now=value},failRead:value=>{failRead=value},failWrite:value=>{failWrite=value},get writes(){return writes}};
}

test('A/D: real day is empty, targets are centralized 2845 / 185 / 65 / 380',async()=>{
 const f=fixture(),view=ok(await f.service().getDay(day));
 assert.deepEqual(view.diary.entries,[]);assert.deepEqual(view.summary.totals,n.sumNutrients([]).value);
 assert.deepEqual(view.targets,{energyCentiKcal:284500,proteinMg:185000,fatMg:65000,carbsMg:380000});
 assert.deepEqual(view.summary.remaining,view.targets);assert.equal(view.diary.localDate,day);
});
test('B/C: demo is one explicit day of snapshot entries; next day is empty and history is not fabricated',async()=>{
 const f=fixture('developmentDemo'),view=ok(await f.service().getDay(day));
 assert.equal(view.diary.entries.length,11);assert.ok(view.diary.entries.every(e=>e.food.basis==='per100g'&&e.quantity.unit==='g'));
 assert.deepEqual(ok(await f.service().getDay(day)),view);
 assert.equal(ok(await f.service().getDay(next)).diary.entries.length,0);
 const state=ok(await f.repository().load());assert.deepEqual(state.developmentSeed,{version:1,localDate:day});assert.equal(state.diaries.length,2);
 assert.equal(ok(await f.service().getHistory('2026-10-01','2026-10-17')).length,0);
 assert.equal(Object.hasOwn(state.diaries[0],'totals'),false);
 assert.deepEqual(view.summary.totals,{energyCentiKcal:194497,proteinMg:127570,fatMg:46978,carbsMg:241000});
 assert.deepEqual(Object.values(view.summary.meals).map(m=>m.energyCentiKcal),[51630,67977,54770,20120]);
});
test('E/F/Z/AD: 200g of per-100g yogurt persists correct totals and remaining values through reload',async()=>{
 const f=fixture(),added=ok(await f.add());
 assert.deepEqual(added.view.summary.totals,{energyCentiKcal:24000,proteinMg:20000,fatMg:10000,carbsMg:16000});
 assert.deepEqual(added.view.summary.remaining,{energyCentiKcal:260500,proteinMg:165000,fatMg:55000,carbsMg:364000});
 assert.deepEqual(added.fact,{type:'entryAdded',entryId:added.entry.id,localDate:day,meal:'breakfast',occurredAt:stamp});
 assert.deepEqual(ok(await f.service().getDay(day)),added.view);
});
test('G/H: identical foods have distinct entry IDs and concurrent adds across services all survive',async()=>{
 const f=fixture();const results=await Promise.all(Array.from({length:20},()=>f.add(100)));
 const ids=results.map(r=>ok(r).entry.id);assert.equal(new Set(ids).size,20);
 const view=ok(await f.service().getDay(day));assert.equal(view.diary.entries.length,20);assert.equal(view.summary.totals.energyCentiKcal,240000);
 assert.equal(new Set(view.diary.entries.map(e=>e.food.foodId)).size,1);
});
test('I/J/K/L/M/N/O: quantity edit, meal move and delete preserve identity/snapshot/other entries',async()=>{
 const f=fixture(),first=ok(await f.add()),other=ok(await f.add(100,'lunch')).entry;
 f.clock('2026-10-20T10:00:00Z');
 const edited=ok(await f.service().updateEntryQuantity(day,first.entry.id,150));
 assert.equal(edited.entry.id,first.entry.id);assert.equal(edited.entry.createdAt,first.entry.createdAt);assert.notEqual(edited.entry.updatedAt,first.entry.updatedAt);
 assert.deepEqual(edited.entry.food,first.entry.food);assert.equal(edited.view.summary.meals.breakfast.energyCentiKcal,18000);assert.equal(edited.fact,null);
 const moved=ok(await f.service().moveEntry(day,first.entry.id,'lunch'));
 assert.equal(moved.entry.id,first.entry.id);assert.equal(moved.entry.quantity.milliGrams,150000);assert.deepEqual(moved.entry.food,first.entry.food);
 assert.equal(moved.view.summary.meals.breakfast.energyCentiKcal,0);assert.equal(moved.view.summary.meals.lunch.energyCentiKcal,30000);assert.equal(moved.fact,null);
 const deleted=ok(await f.service().deleteEntry(day,first.entry.id));assert.equal(deleted.entry,null);assert.equal(deleted.fact,null);
 assert.deepEqual(deleted.view.diary.entries,[other]);assert.equal(deleted.view.summary.totals.energyCentiKcal,12000);
 assert.deepEqual(ok(await f.service().getDay(day)),deleted.view);
});
test('edit plus concurrent add cannot overwrite either result',async()=>{
 const f=fixture(),first=ok(await f.add()).entry;
 await Promise.all([f.service().updateEntryQuantity(day,first.id,150),f.add(100,'lunch')]);
 const view=ok(await f.service().getDay(day));assert.equal(view.diary.entries.length,2);
 assert.equal(view.diary.entries[0].quantity.milliGrams,150000);assert.equal(view.summary.totals.energyCentiKcal,30000);
});
test('snapshot is detached at call time, provider mutation/deletion cannot rewrite historical nutrition',async()=>{
 const f=fixture(),snapshot=food();const pending=f.service().addEntry({localDate:day,meal:'breakfast',food:snapshot,quantityGrams:200});
 snapshot.nutrients.energyCentiKcal=99999;snapshot.name='Changed';delete snapshot.source;
 const entry=ok(await pending).entry;assert.equal(entry.food.name,'Греческий йогурт');assert.equal(entry.food.nutrients.energyCentiKcal,12000);assert.equal(entry.food.source.provider,'custom');
 assert.equal(ok(await f.service().getDay(day)).summary.totals.energyCentiKcal,24000);
});
test('P/Q/R/S/T: invalid quantities, meals, snapshots and negative/fractional nutrients never save',async()=>{
 const f=fixture();
 for(const grams of [-1,0,NaN,Infinity,Number.MAX_SAFE_INTEGER,0.0001])assert.equal((await f.add(grams)).error,'invalidQuantity');
 for(const meal of ['Breakfast','завтрак',null])assert.equal((await f.add(100,meal)).error,'invalidMeal');
 const invalid=[s=>{s.nutrients.proteinMg=-1},s=>{s.nutrients.fatMg=1.5},s=>{s.nutrients.carbsMg=NaN},s=>{s.basis='perServing'},s=>{s.name=' '},s=>{s.foodId=''},s=>{s.source={provider:''}},s=>{delete s.nutrients}];
 for(const corrupt of invalid){const snapshot=food();corrupt(snapshot);assert.equal((await f.service().addEntry({localDate:day,meal:'breakfast',food:snapshot,quantityGrams:100})).error,'invalidSnapshot')}
 assert.equal(f.writes,0);
 const first=ok(await f.add());const before=f.writes;
 assert.equal((await f.service().updateEntryQuantity(day,first.entry.id,0)).error,'invalidQuantity');assert.equal((await f.service().moveEntry(day,first.entry.id,'invalid')).error,'invalidMeal');assert.equal(f.writes,before);
});
test('U: duplicate IDs within/across persisted days and generator collisions fail safely',async()=>{
 const f=fixture();const first=ok(await f.add());ok(await f.add(100,'lunch',next));const state=JSON.parse(f.data.get(f.key));
 state.diaries[1].entries[0].id=first.entry.id;assert.equal(n.decodeNutritionState(state,'real').ok,false);
 state.diaries.pop();state.diaries[0].entries.push(state.diaries[0].entries[0]);assert.equal(n.decodeNutritionState(state,'real').ok,false);
 const collision=n.createNutritionService(f.repository(),{now:()=>stamp,nextId:()=>first.entry.id});const before=f.data.get(f.key);
 assert.equal((await collision.addEntry({localDate:day,meal:'breakfast',food:food(),quantityGrams:100})).error,'duplicateEntryId');assert.equal(f.data.get(f.key),before);
});
test('V/W: corrupt JSON and newer schemas are preserved without silent replacement',async()=>{
 const f=fixture();for(const [raw,error]of[['invalid','corruptData'],['null','corruptData'],['{"schemaVersion":2}','unsupportedSchema']]){
 f.data.set(f.key,raw);assert.deepEqual(await f.service().getDay(day),{ok:false,error});assert.deepEqual(await f.add(),{ok:false,error});assert.equal(f.data.get(f.key),raw);
 }
});
test('schema validates entry date/meal/quantity/snapshot, target values, duplicates, timestamps and seed provenance',async()=>{
 const f=fixture();ok(await f.add());const baseline=JSON.parse(f.data.get(f.key));
 for(const change of [
 s=>{s.diaries[0].localDate='2026-02-30'},s=>{s.diaries[0].entries[0].localDate=next},s=>{s.diaries[0].entries[0].meal='wrong'},
 s=>{s.diaries[0].entries[0].quantity.milliGrams=0},s=>{s.diaries[0].entries[0].quantity.milliGrams=1.5},s=>{s.diaries[0].entries[0].quantity.unit='piece'},
 s=>{s.diaries[0].entries[0].food.nutrients.fatMg=-1},s=>{s.diaries[0].entries[0].food={}},s=>{s.targets.proteinMg=-1},s=>{s.targets.energyCentiKcal=0},
 s=>{s.diaries[0].entries[0].createdAt='bad'},s=>{s.diaries[0].updatedAt='2000-01-01T00:00:00Z'},s=>{s.diaries.push(s.diaries[0])},s=>{s.developmentSeed={version:1,localDate:day}},s=>{s.mode='developmentDemo'},
 ]){const state=structuredClone(baseline);change(state);assert.equal(n.decodeNutritionState(state,'real').ok,false);f.data.set(f.key,JSON.stringify(state));assert.equal((await f.service().getDay(day)).ok,false)}
});
test('X/Y: explicit local days survive UTC/year boundaries; previous days remain editable without rewriting other days',async()=>{
 const f=fixture(),first=ok(await f.add(200,'breakfast','2026-12-31')).entry;
 const nextView=ok(await f.service().getDay('2027-01-01'));assert.equal(nextView.diary.entries.length,0);
 ok(await f.service().updateEntryQuantity('2026-12-31',first.id,150));assert.deepEqual(ok(await f.service().getDay('2027-01-01')),nextView);
 assert.equal(ok(await f.service().getDay('2026-12-31')).summary.totals.energyCentiKcal,18000);
 const history=ok(await f.service().getHistory('2026-12-31','2027-01-01'));assert.deepEqual(history.map(d=>d.localDate),['2026-12-31','2027-01-01']);
 assert.equal(ok(await f.service().getHistory('2026-01-01','2026-01-07')).length,0);
});
test('AA: half-up fixed precision and repeated replay/recalculation are deterministic',async()=>{
 assert.deepEqual(ok(n.quantityFromGrams(1.2346)),{unit:'g',milliGrams:1235});
 const tiny={...food(),nutrients:{energyCentiKcal:1,proteinMg:1,fatMg:1,carbsMg:1}};
 const expected={energyCentiKcal:1,proteinMg:1,fatMg:1,carbsMg:1};
 assert.deepEqual(ok(n.entryNutrition({food:tiny,quantity:{unit:'g',milliGrams:50000}})),expected);
 const f=fixture(),first=ok(await f.add(33.333)).entry;const initial=ok(await f.service().getDay(day)).summary;
 for(let i=0;i<20;i++){ok(await f.service().updateEntryQuantity(day,first.id,66.666));ok(await f.service().updateEntryQuantity(day,first.id,33.333));assert.deepEqual(ok(await f.service().getDay(day)).summary,initial)}
});
test('AB/AC/AD: meal totals sum rounded entry units; day totals sum meals; remaining clamps at zero',async()=>{
 const f=fixture();ok(await f.add(100,'breakfast'));ok(await f.add(200,'lunch'));ok(await f.add(50,'snacks'));
 const view=ok(await f.service().getDay(day));const totals=ok(n.sumNutrients(view.diary.entries.map(e=>ok(n.entryNutrition(e)))));
 assert.deepEqual(totals,view.summary.totals);assert.deepEqual(ok(n.sumNutrients(Object.values(view.summary.meals))),totals);
 const over=ok(await f.add(3000,'dinner'));assert.deepEqual(over.view.summary.remaining,{energyCentiKcal:0,proteinMg:0,fatMg:0,carbsMg:112000});
});
test('AE/AF: seed/read/reload emit no add fact and never alter wallet; future add fact is returned only after persistence',async()=>{
 const f=fixture('developmentDemo'),wallet=createOrangeWalletService(createKeyValueOrangeWalletRepository(f.storage,'developmentDemo'),{now:()=>stamp});
 const original=ok(await wallet.loadWallet());const notices=[];const unsub=f.service().subscribe(()=>notices.push('changed'));
 const seeded=ok(await f.service().getDay(day));assert.equal(Object.hasOwn(seeded,'fact'),false);ok(await f.service().getDay(day));assert.deepEqual(notices,[]);
 const added=ok(await f.add());assert.equal(added.fact.type,'entryAdded');assert.deepEqual(notices,['changed']);
 ok(await f.service().updateEntryQuantity(day,added.entry.id,150));ok(await f.service().moveEntry(day,added.entry.id,'lunch'));ok(await f.service().deleteEntry(day,added.entry.id));
 assert.deepEqual(ok(await wallet.loadWallet()),original);unsub();
});
test('targets change remaining goals without changing historical entries or their snapshots',async()=>{
 const f=fixture(),added=ok(await f.add()),original=structuredClone(added.view.diary);
 const targets={...added.view.targets,energyCentiKcal:300000};ok(await f.service().setTargets(targets));targets.energyCentiKcal=1;
 const view=ok(await f.service().getDay(day));assert.deepEqual(view.diary,original);assert.equal(view.targets.energyCentiKcal,300000);assert.equal(view.summary.remaining.energyCentiKcal,276000);
  const zeroMacro={...view.targets,carbsMg:0};assert.equal(ok(await f.service().setTargets(zeroMacro)).carbsMg,0);assert.equal(ok(await f.service().getDay(day)).summary.remaining.carbsMg,0);
});
test('failed persistence publishes no add fact/update and leaves diary unchanged; queue recovers',async()=>{
 const f=fixture();const first=ok(await f.add());const before=f.data.get(f.key),updates=[];const unsub=f.service().subscribe(()=>updates.push(true));
 f.failWrite(true);assert.deepEqual(await f.add(),{ok:false,error:'storageUnavailable'});assert.equal((await f.service().updateEntryQuantity(day,first.entry.id,150)).ok,false);
 assert.deepEqual(updates,[]);assert.equal(f.data.get(f.key),before);f.failWrite(false);assert.equal(ok(await f.service().getDay(day)).diary.entries.length,1);assert.equal(ok(await f.add()).view.diary.entries.length,2);
 f.failRead(true);assert.equal((await f.service().getDay(day)).error,'storageUnavailable');f.failRead(false);unsub();
});
test('overflow rejects the whole edit/add without partially saving totals',async()=>{
 const f=fixture(),snapshot={...food(),nutrients:{energyCentiKcal:Number.MAX_SAFE_INTEGER,proteinMg:0,fatMg:0,carbsMg:0}};
 assert.equal((await f.service().addEntry({localDate:day,meal:'breakfast',food:snapshot,quantityGrams:1000})).error,'nutritionOverflow');assert.equal(f.writes,0);
 ok(await f.service().addEntry({localDate:day,meal:'breakfast',food:snapshot,quantityGrams:100}));const before=f.data.get(f.key);
 assert.equal((await f.service().addEntry({localDate:day,meal:'lunch',food:food(),quantityGrams:100})).error,'nutritionOverflow');assert.equal(f.data.get(f.key),before);
});
test('invalid dates, missing entries, targets, ID generators and disabled reset fail without phantom diaries',async()=>{
 const f=fixture();assert.equal((await f.add(100,'breakfast','2026-02-30')).error,'invalidLocalDate');
 for(const operation of [()=>f.service().updateEntryQuantity(day,'missing',100),()=>f.service().moveEntry(day,'missing','lunch'),()=>f.service().deleteEntry(day,'missing')])assert.equal((await operation()).error,'entryNotFound');
 assert.equal((await f.service().getHistory(next,day)).error,'invalidLocalDate');assert.equal((await f.service().setTargets({...n.defaultNutritionTargets,proteinMg:-1})).error,'invalidTargets');
 const service=n.createNutritionService(f.repository(),{now:()=>stamp,nextId:()=>''});assert.equal((await service.addEntry({localDate:day,meal:'lunch',food:food(),quantityGrams:100})).error,'invalidEntryId');
 assert.equal((await f.service().resetForDevelopment(day)).error,'resetDisabled');assert.equal(f.writes,0);
});
test('demo reset/isolation do not reseed deleted entries or another day during ordinary reads',async()=>{
 const f=fixture('developmentDemo'),view=ok(await f.service().getDay(day));
 for(const entry of view.diary.entries)ok(await f.service().deleteEntry(day,entry.id));assert.equal(ok(await f.service().getDay(day)).diary.entries.length,0);
 assert.equal(ok(await f.service().getDay(next)).diary.entries.length,0);assert.equal(ok(await f.service().resetForDevelopment(day)).diary.entries.length,11);
 assert.equal(ok(await f.service().getHistory(day,next)).length,1);
 const real=n.createNutritionService(createKeyValueNutritionRepository(f.storage,'real'),{now:()=>stamp,nextId:()=> 'real-id'});assert.equal(ok(await real.getDay(day)).diary.entries.length,0);
});
