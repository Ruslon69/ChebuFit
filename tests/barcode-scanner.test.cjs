const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=p=>require(path.join(process.env.CHEBUFIT_BUILD,p));
const {normalizeFoodBarcode,foodBarcodeTypes}=load('features/food-catalog/domain/barcode.js');
const {createBarcodeLookupController}=load('features/food-catalog/application/BarcodeLookupController.js');
const {cameraPermissionState,shouldMountScanner}=load('features/food-catalog/model/scannerPresentation.js');
const {createFoodAddOperation}=load('application/nutrition/addCatalogFood.js');
const {previewCatalogFood}=load('features/food-catalog/domain/catalogFood.js');
const {parseAddFoodContext}=load('features/nutrition/model/diaryPresentation.js');
const {createKeyValueNutritionRepository}=load('infrastructure/nutrition/KeyValueNutritionRepository.js');
const {createKeyValueOrangeWalletRepository}=load('infrastructure/rewards/KeyValueOrangeWalletRepository.js');
const {createKeyValueRecentFoodsRepository}=load('infrastructure/food-catalog/KeyValueRecentFoodsRepository.js');
const {createOpenFoodFactsProvider}=load('infrastructure/food-catalog/OpenFoodFactsProvider.js');
const n=load('features/nutrition/index.js'),r=load('features/rewards/index.js');
const {legacy}=require('./fixtures/open-food-facts/responses.json');
const ok=x=>{assert.equal(x.ok,true,JSON.stringify(x));return x.value},context={date:'2026-10-17',meal:'dinner'},stamp='2026-10-18T12:00:00+02:00';
const food={source:{providerId:'open-food-facts',foodId:'5011157888101'},barcode:'5011157888101',name:'Pure Basmati rice',brand:'Tilda',basis:'per100g',nutrients:{energyCentiKcal:14300,proteinMg:2900,fatMg:1900,carbsMg:28200}};
const provider=lookup=>({getByBarcode:lookup,searchFoods:async()=>({ok:true,value:{foods:[]}}),getSuggestions:async()=>({ok:true,value:[]})});
test('A–I: EAN/UPC strings preserve zeroes, trim only outer whitespace and reject invalid input',()=>{
 for(const code of['5011157888101','01234565','012345678905','00012345600012'])assert.deepEqual(normalizeFoodBarcode(' '+code+' '),{displayCode:code,lookupCode:code});
 for(const bad of['','  ','abc','123','123456789','123456789012345',5011157888101,null,'501 1157888101','https://food.test/5011157888101','00000000','1e12'])assert.equal(normalizeFoodBarcode(bad),null);
 assert.deepEqual(foodBarcodeTypes,['ean13','ean8','upc_a','upc_e']);assert.equal(normalizeFoodBarcode('5011157888101','qr'),null);
 // Expo iOS may supply a 12-digit UPC-A with an ean13 type. Do not lose the code.
 assert.equal(normalizeFoodBarcode('012345678905','ean13').lookupCode,'012345678905');
});
test('D/E/J: explicit UPC-E expands to UPC-A; untyped EAN-8 is never guessed',()=>{
 assert.deepEqual(normalizeFoodBarcode('04252614','upc_e'),{displayCode:'04252614',lookupCode:'042100005264'});
 assert.equal(normalizeFoodBarcode('04252614').lookupCode,'04252614');
 for(const [code,expected]of[['01234530','012300000450'],['01234540','012340000050'],['01234550','012345000050']])assert.equal(normalizeFoodBarcode(code,'upc_e').lookupCode,expected);
 assert.equal(normalizeFoodBarcode('24252614','upc_e'),null);
});
test('K/L/O: repeated and different camera callbacks cause exactly one lookup and one found transition',async()=>{
 let resolve,calls=0,found=0;const c=createBarcodeLookupController(provider(()=>{calls++;return new Promise(r=>{resolve=r})}),context);
 c.subscribe(()=>{if(c.getSnapshot().status==='found')found++});
 const first=c.submit(food.barcode,'camera','ean13');assert.equal(c.getSnapshot().status,'lookingUp');
 await Promise.all(Array.from({length:40},(_,i)=>c.submit(i%2?food.barcode:'01234565','camera','ean8')));assert.equal(calls,1);
 resolve({ok:true,value:food});await first;assert.equal(c.getSnapshot().status,'found');assert.equal(found,1);
 await c.submit(food.barcode,'camera','ean13');assert.equal(calls,1);
});
test('J/T/U: camera/manual share normalization and provider lookup; invalid and QR inputs use no network',async()=>{
 const codes=[];const c=createBarcodeLookupController(provider(async code=>{codes.push(code);return{ok:true,value:null}}),context);
 await c.submit('bad','manual');assert.equal(c.getSnapshot().status,'invalid');await c.submit('5011157888101','camera','qr');assert.equal(codes.length,0);
 await c.submit(' 04252614 ','manual','upc_e');c.reset();await c.submit(' 04252614 ','camera','upc_e');assert.deepEqual(codes,['042100005264','042100005264']);
});
test('M/N: not-found requires explicit rescan, failure requires retry; one new lookup each',async()=>{
 let calls=0;const c=createBarcodeLookupController(provider(async()=>{calls++;return calls===1?{ok:true,value:null}:calls===2?{ok:false,error:'network'}:{ok:true,value:food}}),context);
 await c.submit(food.barcode,'camera','ean13');assert.equal(c.getSnapshot().status,'notFound');await c.submit(food.barcode,'camera','ean13');assert.equal(calls,1);
 c.reset();await c.submit(food.barcode,'camera','ean13');assert.equal(c.getSnapshot().status,'error');await c.retry();assert.equal(c.getSnapshot().status,'found');assert.equal(calls,3);
});
test('Q/R/S: genuine not-found, malformed product, network/timeout/server/rate errors stay distinct',async()=>{
 for(const error of['network','timeout','server','rateLimited','invalidFood']){
 const c=createBarcodeLookupController(provider(async()=>({ok:false,error})),context);await c.submit(food.barcode,'manual');assert.equal(c.getSnapshot().status,'error');assert.equal(c.getSnapshot().error,error);
 }
 const c=createBarcodeLookupController(provider(async()=>({ok:true,value:{name:'broken'}})),context);await c.submit(food.barcode,'manual');assert.equal(c.getSnapshot().error,'invalidFood');
 const thrown=createBarcodeLookupController(provider(async()=>{throw Error('offline')}),context);await thrown.submit(food.barcode,'manual');assert.equal(thrown.getSnapshot().error,'network');
});
test('S: retries honor cooldown and explicit reset does not bypass provider limits',async()=>{
 let time=100000,calls=0;const off=createOpenFoodFactsProvider({userAgent:'ChebuFit/test',languages:['en'],countryCode:'nl',now:()=>time,fetch:async()=>{calls++;return new Response('{}',{status:429,headers:{'Retry-After':'60'}})}});
 const c=createBarcodeLookupController(off,context,()=>time);await c.submit(food.barcode,'manual');assert.equal(c.getSnapshot().error,'rateLimited');await c.retry();assert.equal(calls,1);
 c.reset();await c.submit('01234565','camera','ean8');assert.equal(calls,1);time+=60000;await c.retry();assert.equal(calls,2);
});
test('background/blur aborts lookup and ignores late results; returning does not implicitly lookup',async()=>{
 let resolve,signal,calls=0;const c=createBarcodeLookupController(provider(async(code,ctx)=>{calls++;signal=ctx.signal;return new Promise(r=>{resolve=r})}),context);
 const pending=c.submit(food.barcode,'manual');c.setActive(false);assert.equal(signal.aborted,true);resolve({ok:true,value:food});await pending;assert.equal(c.getSnapshot().status,'idle');
 await c.submit(food.barcode,'manual');assert.equal(calls,1);c.setActive(true);assert.equal(calls,1);
});
test('AD–AI: permission states and camera lifecycle always allow independent manual fallback',()=>{
 assert.equal(cameraPermissionState(null),'checking');assert.equal(cameraPermissionState({granted:false,canAskAgain:true,status:'undetermined'}),'request');
 assert.equal(cameraPermissionState({granted:true,canAskAgain:true,status:'granted'}),'granted');assert.equal(cameraPermissionState({granted:false,canAskAgain:true,status:'denied'}),'denied');assert.equal(cameraPermissionState({granted:false,canAskAgain:false,status:'denied'}),'settings');
 const input={focused:true,foreground:true,permission:'granted',unavailable:false,manual:false,lookupStatus:'idle'};assert.equal(shouldMountScanner(input),true);
 for(const changes of[{focused:false},{foreground:false},{permission:'checking'},{permission:'denied'},{unavailable:true},{manual:true},{lookupStatus:'found'},{lookupStatus:'lookingUp'},{lookupStatus:'error'},{lookupStatus:'notFound'}])assert.equal(shouldMountScanner({...input,...changes}),false);
});
test('P/V–AC: barcode → same selection preview/Add → persistent historical diary, Recent and existing rewards',async()=>{
 const data=new Map(),storage={getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{data.set(k,v)}};let id=0;
 const nutrition=()=>n.createNutritionService({...createKeyValueNutritionRepository(storage,'real'),identity:'scanner-diary'},{now:()=>stamp,nextId:()=>`scan-${++id}`});
 const wallet=()=>r.createOrangeWalletService({...createKeyValueOrangeWalletRepository(storage,'developmentDemo'),identity:'scanner-wallet'},{now:()=>stamp}),recents=()=>createKeyValueRecentFoodsRepository(storage,'real');
 assert.deepEqual(parseAddFoodContext(context,'2026-10-18'),context);
 const off=createOpenFoodFactsProvider({userAgent:'ChebuFit/test',languages:['en'],countryCode:'nl',fetch:async()=>new Response(JSON.stringify({status:'success',product:{...legacy,code:food.barcode}}))});
 const c=createBarcodeLookupController(off,context);await c.submit(' '+food.barcode+' ','manual');const selected=c.getSnapshot();assert.equal(selected.status,'found');assert.deepEqual(selected.context,context);
 assert.equal(ok(await wallet().loadWallet()).balance,248);assert.equal(ok(await recents().load()).length,0);assert.equal(ok(await nutrition().getDay(context.date)).diary.entries.length,0);
 assert.deepEqual(ok(previewCatalogFood(selected.food,100)),selected.food.nutrients);assert.equal(ok(previewCatalogFood(selected.food,250)).energyCentiKcal,27500);
 const add=()=>createFoodAddOperation({nutrition:nutrition(),wallet:wallet(),recents:recents()}).submit({food:selected.food,localDate:selected.context.date,meal:selected.context.meal,quantityGrams:250,rewardContext:{localDay:'2026-10-18',occurredAt:stamp}});
 const first=ok(await add());assert.equal(first.notice.amount,17);assert.equal(first.notice.kind,'celebration');assert.equal(first.change.entry.localDate,context.date);assert.equal(first.change.entry.meal,context.meal);assert.equal(first.change.entry.food.source.barcode,food.barcode);
 assert.equal(ok(await recents().load()).length,1);assert.equal(ok(await nutrition().getDay(context.date)).summary.totals.energyCentiKcal,27500);
 ok(await nutrition().deleteEntry(context.date,first.change.entry.id));assert.equal(ok(await wallet().loadWallet()).balance,265);assert.equal(ok(await add()).notice,null);assert.equal(ok(await wallet().loadWallet()).balance,265);
});
test('missing barcode capability and subscriber errors fail safely without navigation or reward coupling',async()=>{
 const c=createBarcodeLookupController({getSuggestions:async()=>({ok:true,value:[]}),searchFoods:async()=>({ok:true,value:{foods:[]}})},context);
 c.subscribe(()=>{throw Error('listener')});await c.submit(food.barcode,'manual');assert.equal(c.getSnapshot().error,'providerUnavailable');
});
