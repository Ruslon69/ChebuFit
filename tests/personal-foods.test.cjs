const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=p=>require(path.join(process.env.CHEBUFIT_BUILD,p));
const {createPersonalFoodService}=load('features/personal-foods/application/PersonalFoodService.js');
const {createKeyValuePersonalFoodRepository}=load('infrastructure/personal-foods/KeyValuePersonalFoodRepository.js');
const {decodePersonalFoodState}=load('features/personal-foods/application/PersonalFoodRepository.js');
const {parsePersonalFood,parsePersonalFoodInput,personalFoodToCatalog,personalFoodProviderId,reconcilePersonalRecents,searchPersonalFoods}=load('features/personal-foods/domain/personalFood.js');
const {personalFoodDraft,validatePersonalFoodDraft,parseNutrientDraft}=load('features/personal-foods/model/form.js');
const {createPersonalFirstFoodCatalog,resolvePersonalCatalogFood}=load('features/food-catalog/application/PersonalFirstFoodCatalog.js');
const {createFoodSearchController}=load('features/food-catalog/application/FoodSearchController.js');
const {createBarcodeLookupController}=load('features/food-catalog/application/BarcodeLookupController.js');
const {catalogFoodToSnapshot,previewCatalogFood}=load('features/food-catalog/domain/catalogFood.js');
const {parseAddFoodContext}=load('features/nutrition/model/diaryPresentation.js');
const {createKeyValueRecentFoodsRepository}=load('infrastructure/food-catalog/KeyValueRecentFoodsRepository.js');
const {createFoodAddOperation}=load('application/nutrition/addCatalogFood.js');
const {createKeyValueNutritionRepository}=load('infrastructure/nutrition/KeyValueNutritionRepository.js');
const {createKeyValueOrangeWalletRepository}=load('infrastructure/rewards/KeyValueOrangeWalletRepository.js');
const n=load('features/nutrition/index.js'),r=load('features/rewards/index.js');
const ok=x=>{assert.equal(x.ok,true,JSON.stringify(x));return x.value};
const input={name:'Домашний йогурт',brand:'Мой бренд',nutrients:{energyCentiKcal:8500,proteinMg:8500,fatMg:2000,carbsMg:7000}};
const stamp='2026-10-18T12:00:00Z',day='2026-10-18',rewardContext={localDay:day,occurredAt:stamp};
let sequence=0;
function fixture(){
 const data=new Map(),scope='personal-test-'+(++sequence);let ids=0,time=stamp,fail=false;
 const storage={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{if(fail)throw Error('disk unavailable');data.set(k,v)}};
 const repository=()=>({...createKeyValuePersonalFoodRepository(storage,'real'),identity:scope});
 const service=()=>createPersonalFoodService(repository(),{now:()=>time,nextId:()=>`${scope}-${++ids}`});
 const personal=service();let entryId=0;
 const nutrition=()=>n.createNutritionService({...createKeyValueNutritionRepository(storage,'real'),identity:scope+'-diary'},{now:()=>time,nextId:()=>`entry-${scope}-${++entryId}`});
 const wallet=()=>r.createOrangeWalletService({...createKeyValueOrangeWalletRepository(storage,'developmentDemo'),identity:scope+'-wallet'},{now:()=>time});
 const recents=createKeyValueRecentFoodsRepository(storage,'real');
 const add=(food,changes={})=>createFoodAddOperation({nutrition:nutrition(),wallet:wallet(),recents,resolveFood:food=>resolvePersonalCatalogFood(food,personal)}).submit({food,localDate:'2026-10-17',meal:'dinner',quantityGrams:100,rewardContext,...changes});
 return{data,storage,repository,service,personal,nutrition,wallet,recents,add,fail:v=>{fail=v},time:v=>{time=v}};
}
function remote(result={ok:false,error:'network'}){let searches=0,lookups=0;return{get searches(){return searches},get lookups(){return lookups},provider:{searchPolicy:{trigger:'submit',minimumLength:2},getSuggestions:async()=>({ok:true,value:[]}),searchFoods:async()=>{searches++;return result},getByBarcode:async()=>{lookups++;return result}}}}

test('A–L: exact comma/dot decimal input, zero nutrients and canonical bounds; no NaN/Infinity/negative/missing data',()=>{
 const draft={name:' Йогурт ',brand:' ',barcode:' 0012345678905 ',energy:'85,50',protein:'8.5',fat:'0',carbs:'7,125'};
 const parsed=ok(validatePersonalFoodDraft(draft));assert.equal(parsed.name,'Йогурт');assert.equal(parsed.brand,undefined);assert.equal(parsed.barcode,'0012345678905');
 assert.deepEqual(parsed.nutrients,{energyCentiKcal:8550,proteinMg:8500,fatMg:0,carbsMg:7125});
 for(const field of['energy','protein','fat','carbs'])for(const value of['',' ','-1','NaN','Infinity','12g','1e2','1,2.3','1001'])assert.equal(validatePersonalFoodDraft({...draft,[field]:value}).ok,false,field+value);
 for(const name of['','  ','a'.repeat(201),'abc\nline'])assert.equal(validatePersonalFoodDraft({...draft,name}).ok,false);
 assert.equal(parseNutrientDraft('.5',3,100000),500);assert.equal(parseNutrientDraft('0.001',3,100000),1);assert.equal(parseNutrientDraft('85.555',2,100000),null);
 assert.equal(parsePersonalFoodInput({...input,nutrients:{...input.nutrients,fatMg:0.1}}).ok,false);
 for(const value of[NaN,Infinity,-1,100001])assert.equal(parsePersonalFoodInput({...input,nutrients:{...input.nutrients,energyCentiKcal:value}}).ok,false);
 assert.equal(parsePersonalFoodInput({...input,nutrients:{energyCentiKcal:0,proteinMg:0,fatMg:0,carbsMg:0}}).ok,true);
 assert.equal(parsePersonalFoodInput({...input,nutrients:{energyCentiKcal:100000,proteinMg:100000,fatMg:0,carbsMg:0}}).ok,true);
 assert.equal(validatePersonalFoodDraft({...draft,barcode:'not-a-code'}).ok,false);
});

test('P/Q/R: production and development catalogs start empty, no seed, create and reload preserve exact identity/precision',async()=>{
 const f=fixture();assert.deepEqual(ok(await f.personal.getAll()),[]);assert.equal(f.data.size,0);
 const food=ok(await f.personal.create({...input,barcode:'0012345678905'}));assert.ok(food.id);assert.equal(food.barcode,'0012345678905');
 assert.deepEqual(ok(await f.service().getById(food.id)),food);assert.deepEqual(ok(await f.service().getAll()),[food]);
 assert.equal(JSON.parse(f.data.get('@chebufit/personal-foods/real')).schemaVersion,1);
 assert.equal(ok(await createPersonalFoodService(createKeyValuePersonalFoodRepository(f.storage,'developmentDemo'),{now:()=>stamp,nextId:()=> 'dev'}).getAll()).length,0);
 const catalog=personalFoodToCatalog(food);assert.deepEqual(catalog.source,{providerId:personalFoodProviderId,foodId:food.id});assert.equal(catalog.basis,'per100g');
 assert.equal(ok(catalogFoodToSnapshot(catalog)).source.provider,personalFoodProviderId);
});

test('B/N/O/S/T/W: edit preserves ID/createdAt, updates metadata, commits before subscription and delete survives reload',async()=>{
 const f=fixture();let events=0;const unsub=f.personal.subscribe(()=>{events++;assert.ok(f.data.has('@chebufit/personal-foods/real'))});
 const food=ok(await f.personal.create(input));f.time('2026-10-19T10:00:00Z');
 const changed=ok(await f.service().update(food.id,{...input,name:'Обновлённый йогурт',nutrients:{...input.nutrients,energyCentiKcal:9500}}));
 assert.equal(changed.id,food.id);assert.equal(changed.createdAt,food.createdAt);assert.notEqual(changed.updatedAt,food.updatedAt);
 assert.deepEqual(ok(await f.service().getById(food.id)),changed);ok(await f.personal.delete(food.id));assert.equal(ok(await f.service().getById(food.id)),null);
 assert.equal(events,3);unsub();assert.equal((await f.personal.update(food.id,input)).error,'notFound');
});

test('M/AJ: normalized personal barcodes are unique, including zero-padded aliases; collision returns existing product without overwriting',async()=>{
 const f=fixture(),one=ok(await f.personal.create({...input,barcode:'012345678905'}));
 const collision=await f.personal.create({...input,name:'Other',barcode:'0012345678905'});assert.equal(collision.error,'duplicateBarcode');assert.equal(collision.existing.id,one.id);
 const two=ok(await f.personal.create({...input,name:'No barcode'}));assert.equal((await f.personal.update(two.id,{...input,barcode:one.barcode})).error,'duplicateBarcode');
 ok(await f.personal.update(one.id,{...input,barcode:one.barcode}));ok(await f.personal.delete(one.id));assert.equal(ok(await f.personal.create({...input,barcode:one.barcode})).barcode,one.barcode);
});

test('U: corrupt/unsupported storage, duplicate identities, malformed nutrition and provenance fail safely without replacement',async()=>{
 const f=fixture(),food=ok(await f.personal.create(input)),key='@chebufit/personal-foods/real';
 const valid=JSON.parse(f.data.get(key));
 const badStates=['{broken',JSON.stringify({...valid,schemaVersion:2}),JSON.stringify({...valid,mode:'developmentDemo'}),JSON.stringify({...valid,foods:[food,food]}),JSON.stringify({...valid,foods:[{...food,nutrients:{...food.nutrients,proteinMg:-1}}]}),JSON.stringify({...valid,foods:[{...food,createdAt:'not a date'}]})];
 for(const raw of badStates){f.data.set(key,raw);assert.equal((await f.service().getAll()).ok,false);assert.equal((await f.service().create(input)).ok,false);assert.equal(f.data.get(key),raw)}
 assert.equal(decodePersonalFoodState({...valid,foods:[{...food,id:'one',barcode:'012345678905'},{...food,id:'two',barcode:'0012345678905'}]},'real').error,'corruptData');
 assert.equal(parsePersonalFood({...food,id:'bad/id'}).ok,false);assert.equal(parsePersonalFood({...food,updatedAt:'2025-01-01T00:00:00Z'}).ok,false);
});

test('V/W: concurrent creates/edits/deletes across services share a local queue; failed save emits no success and queue recovers',async()=>{
 const f=fixture();let updates=0;f.personal.subscribe(()=>{updates++});f.personal.subscribe(()=>{throw Error('subscriber')});
 const foods=(await Promise.all(Array.from({length:20},(_,i)=>f.service().create({...input,name:`Food ${i}`})))).map(ok);assert.equal(ok(await f.personal.getAll()).length,20);
 await Promise.all([f.personal.update(foods[0].id,{...input,name:'Updated'}),f.service().create(input),f.service().delete(foods[1].id)]).then(v=>v.forEach(ok));
 const final=ok(await f.personal.getAll());assert.equal(final.length,20);assert.equal(final.find(x=>x.id===foods[0].id).name,'Updated');
 const count=updates;f.fail(true);assert.equal((await f.personal.create(input)).error,'storageUnavailable');assert.equal(updates,count);f.fail(false);ok(await f.personal.create(input));
 const rawInput={...input,nutrients:{...input.nutrients}};const pending=f.personal.create(rawInput);rawInput.name='mutated';rawInput.nutrients.energyCentiKcal=99999;assert.equal(ok(await pending).name,input.name);
});

test('X–AE: deterministic local name/prefix/brand search, case/partial matching, no duplicates and no dependency on OFF availability',async()=>{
 const f=fixture(),a=ok(await f.personal.create({...input,name:'Йогурт',brand:'Dairy Brand'})),b=ok(await f.personal.create({...input,name:'Домашний йогурт'})),c=ok(await f.personal.create({...input,name:'Кефир',brand:'Йог бренд'}));
 assert.deepEqual(ok(await f.personal.search(' ЙОГ ')).map(x=>x.id),[a.id,b.id,c.id]);assert.equal(ok(await f.personal.search('dairy'))[0].id,a.id);
 const external=remote(),provider=createPersonalFirstFoodCatalog(external.provider,f.personal),search=createFoodSearchController(provider);
 search.setQuery('йог');assert.equal(external.searches,0);await search.submit();assert.equal(search.getSnapshot().status,'error');assert.equal(ok(await f.personal.search('йог')).length,3);
 ok(await f.personal.delete(a.id));assert.equal(ok(await f.personal.search('йог')).length,2);search.dispose();
});

test('AF–AK: personal barcode overrides OFF and works offline with zero remote calls; unknown code falls through without bypassing provider gates',async()=>{
 const f=fixture(),food=ok(await f.personal.create({...input,barcode:'5012345678900'})),external=remote(),provider=createPersonalFirstFoodCatalog(external.provider,f.personal);
 assert.equal(ok(await provider.getByBarcode(food.barcode)).source.foodId,food.id);assert.equal(external.lookups,0);
 assert.equal((await provider.getByBarcode('5011157888101')).error,'network');assert.equal(external.lookups,1);
 assert.equal(ok(await provider.getByBarcode(food.barcode)).nutrients.energyCentiKcal,8500);assert.equal(external.lookups,1);
 const f2=fixture(),zero=ok(await f2.personal.create({...input,barcode:'012345678905'}));assert.equal(ok(await createPersonalFirstFoodCatalog(remote().provider,f2.personal).getByBarcode('0012345678905')).source.foodId,zero.id);
 const abort=new AbortController();abort.abort();assert.equal((await provider.getByBarcode(food.barcode,{signal:abort.signal})).error,'cancelled');assert.equal((await provider.getByBarcode('abc')).error,'invalidBarcode');assert.equal(external.lookups,1);
});

test('AL–AR: old 100 kcal snapshot stays 100 after edit to 120 and catalog deletion; future Add resolves canonical nutrition',async()=>{
 const f=fixture(),food=ok(await f.personal.create({...input,nutrients:{...input.nutrients,energyCentiKcal:10000}})),catalog=personalFoodToCatalog(food);
 const first=ok(await f.add(catalog));assert.equal(first.change.entry.food.nutrients.energyCentiKcal,10000);
 f.time('2026-10-18T12:01:00Z');const edited=ok(await f.personal.update(food.id,{...input,nutrients:{...input.nutrients,energyCentiKcal:12000}}));
 const second=ok(await f.add(catalog));assert.equal(second.change.entry.food.nutrients.energyCentiKcal,12000);assert.equal(first.change.entry.food.nutrients.energyCentiKcal,10000);
 const before=ok(await f.nutrition().getDay('2026-10-17'));ok(await f.personal.delete(edited.id));assert.deepEqual(ok(await f.nutrition().getDay('2026-10-17')),before);
 assert.equal((await f.add(catalog)).ok,false);assert.equal(ok(await f.nutrition().getDay('2026-10-17')).diary.entries.length,2);
});

test('AS–AU: only committed Add creates Recent; edits reconcile to canonical values, deletion filters and cleans reference without changing diary',async()=>{
 const f=fixture(),food=ok(await f.personal.create(input)),catalog=personalFoodToCatalog(food);assert.deepEqual(ok(await f.recents.load()),[]);
 ok(await f.add(catalog));const recent=ok(await f.recents.load());assert.equal(recent.length,1);
 ok(await f.personal.update(food.id,{...input,name:'New name',nutrients:{...input.nutrients,energyCentiKcal:9500}}));
 const current=reconcilePersonalRecents(recent,ok(await f.personal.getAll()));assert.equal(current[0].food.name,'New name');assert.equal(current[0].food.nutrients.energyCentiKcal,9500);assert.equal(current[0].addedAt,recent[0].addedAt);
 const diary=ok(await f.nutrition().getDay('2026-10-17'));ok(await f.personal.delete(food.id));assert.deepEqual(reconcilePersonalRecents(recent,ok(await f.personal.getAll())),[]);
 ok(await f.recents.remove(catalog.source));assert.deepEqual(ok(await f.recents.load()),[]);assert.deepEqual(ok(await f.nutrition().getDay('2026-10-17')),diary);
});

test('AV–BB: create/edit/search/lookup/delete grant zero; real Add alone grants +17 once, historical date uses action day and correction cannot farm',async()=>{
 const f=fixture(),initial=ok(await f.wallet().loadWallet()),food=ok(await f.personal.create({...input,barcode:'5012345678900'}));
 ok(await f.personal.search('йог'));ok(await f.personal.getByBarcode(food.barcode));ok(await f.personal.update(food.id,input));assert.deepEqual(ok(await f.wallet().loadWallet()),initial);
 const first=ok(await f.add(personalFoodToCatalog(food)));assert.equal(first.notice.amount,17);assert.equal(first.notice.kind,'celebration');
 const earned=ok(await f.wallet().loadWallet());assert.equal(earned.balance,265);assert.ok(earned.state.ledger.every(e=>e.grant.localDay===day));
 ok(await f.nutrition().deleteEntry('2026-10-17',first.change.entry.id));assert.equal(ok(await f.add(personalFoodToCatalog(food))).notice,null);
 ok(await f.personal.delete(food.id));assert.deepEqual(ok(await f.wallet().loadWallet()),earned);
});

test('BC–BH: OFF not-found → canonical barcode prefill → create → same scanner selection/preview/Add retains historical context',async()=>{
 const f=fixture(),external=remote({ok:true,value:null}),provider=createPersonalFirstFoodCatalog(external.provider,f.personal),context={date:'2026-10-17',meal:'lunch'};
 assert.deepEqual(parseAddFoodContext(context,day),context);const scanner=createBarcodeLookupController(provider,context);await scanner.submit('5012345678900','manual');assert.equal(scanner.getSnapshot().status,'notFound');
 const code=scanner.getSnapshot().lookupCode,draft={...personalFoodDraft(undefined,code),name:'Домашний йогурт',energy:'85',protein:'8,5',fat:'2.0',carbs:'7'};
 const food=ok(await f.personal.create(ok(validatePersonalFoodDraft(draft)))),catalog=personalFoodToCatalog(food);
 assert.deepEqual(ok(previewCatalogFood(catalog,250)),{energyCentiKcal:21250,proteinMg:21250,fatMg:5000,carbsMg:17500});
 const added=ok(await f.add(catalog,{localDate:context.date,meal:context.meal,quantityGrams:250}));assert.equal(added.change.entry.localDate,context.date);assert.equal(added.change.entry.meal,context.meal);assert.equal(added.change.entry.food.source.barcode,code);
 scanner.reset();await scanner.submit(code,'manual');assert.equal(scanner.getSnapshot().status,'found');assert.equal(external.lookups,1);
 const upce=createBarcodeLookupController(createPersonalFirstFoodCatalog(remote({ok:true,value:null}).provider,f.personal),context);await upce.submit('04252614','camera','upc_e');assert.equal(upce.getSnapshot().lookupCode,'042100005264');
});

test('failed personal save never feeds diary; failed diary Add retains saved food, drafts and prior data without fake reward or Recent',async()=>{
 const f=fixture(),balance=ok(await f.wallet().loadWallet());f.fail(true);assert.equal((await f.personal.create(input)).ok,false);f.fail(false);assert.deepEqual(ok(await f.personal.getAll()),[]);
 const food=ok(await f.personal.create(input));f.fail(true);assert.equal((await f.add(personalFoodToCatalog(food))).ok,false);f.fail(false);
 assert.deepEqual(ok(await f.personal.getById(food.id)),food);assert.deepEqual(ok(await f.wallet().loadWallet()),balance);assert.deepEqual(ok(await f.recents.load()),[]);assert.equal(ok(await f.nutrition().getDay('2026-10-17')).diary.entries.length,0);
});

test('one Save/Add operation cannot duplicate diary entries or feedback; offline personal selection is independent of remote provider',async()=>{
 const f=fixture(),food=ok(await f.personal.create(input)),catalog=personalFoodToCatalog(food),operation=createFoodAddOperation({nutrition:f.nutrition(),wallet:f.wallet(),recents:f.recents,resolveFood:food=>resolvePersonalCatalogFood(food,f.personal)});
 const inputAdd={food:catalog,localDate:day,meal:'breakfast',quantityGrams:250,rewardContext};
 const results=await Promise.all(Array.from({length:20},()=>operation.submit(inputAdd)));results.forEach(ok);
 assert.equal(ok(await f.nutrition().getDay(day)).diary.entries.length,1);assert.equal(new Set(results.map(r=>r.value.notice.id)).size,1);
 assert.equal(ok(await f.recents.load()).length,1);assert.equal(ok(await f.wallet().loadWallet()).balance,265);
});

test('personal barcode reads stay offline through remote 503/429; corrupt local state cannot silently fall back to conflicting OFF data',async()=>{
 const f=fixture(),food=ok(await f.personal.create({...input,barcode:'5012345678900'}));
 for(const error of['network','server','rateLimited']){const external=remote({ok:false,error,retryAfterMs:60000}),provider=createPersonalFirstFoodCatalog(external.provider,f.personal);assert.equal(ok(await provider.getByBarcode(food.barcode)).source.foodId,food.id);assert.equal(external.lookups,0)}
 const external=remote({ok:true,value:null});f.data.set('@chebufit/personal-foods/real','{bad');assert.equal((await createPersonalFirstFoodCatalog(external.provider,f.personal).getByBarcode(food.barcode)).error,'corruptData');assert.equal(external.lookups,0);
});

test('concurrent duplicate barcode creates have one winner; update can clear barcode without rewriting any diary snapshot',async()=>{
 const f=fixture();const candidates=await Promise.all([f.personal.create({...input,barcode:'012345678905'}),f.service().create({...input,barcode:'0012345678905'})]);
 assert.equal(candidates.filter(x=>x.ok).length,1);assert.equal(candidates.filter(x=>x.error==='duplicateBarcode').length,1);
 const food=ok(candidates.find(x=>x.ok));ok(await f.add(personalFoodToCatalog(food)));const before=ok(await f.nutrition().getDay('2026-10-17'));
 ok(await f.personal.update(food.id,input));assert.equal(ok(await f.personal.getByBarcode(food.barcode)),null);assert.deepEqual(ok(await f.nutrition().getDay('2026-10-17')),before);
});
