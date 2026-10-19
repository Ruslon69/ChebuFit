const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const root = process.env.CHEBUFIT_BUILD;
const domain = require(path.join(root,'features/workouts/index.js'));
const { builtinExercises } = require(path.join(root,'features/workouts/data/builtinExercises.js'));
const { createLocalExerciseCatalog } = require(path.join(root,'features/workouts/application/LocalExerciseCatalog.js'));
const { exerciseCatalog: catalog } = require(path.join(root,'application/workouts/exerciseCatalog.js'));
const p = require(path.join(root,'features/workouts/model/exercisePresentation.js'));
const { getExerciseMessages } = require(path.join(root,'features/workouts/model/messages.js'));
const ids = rows => rows.map(e=>e.id);
const bench = catalog.getById('barbell-bench-press');
test('curated catalog has 60 unique stable machine identities and polished Russian content',()=>{
  assert.equal(builtinExercises.length,60);assert.equal(new Set(ids(builtinExercises)).size,60);
  for(const e of builtinExercises){assert.equal(domain.parseExerciseId(e.id),e.id);assert.ok(e.content.ru.name.trim().length > 0);assert.equal(e.content.ru.name,e.content.ru.name.trim());assert.ok(e.aliases.some(a=>/[a-z]/i.test(a)));}
});
test('every muscle reference is controlled, primary nonempty and primary/secondary sets disjoint',()=>{
  for(const e of catalog.getAll()){
    assert.ok(e.primaryMuscles.length);const secondary=e.secondaryMuscles??[];
    for(const group of [e.primaryMuscles,secondary]){assert.equal(new Set(group).size,group.length);for(const m of group)assert.ok(domain.muscles.includes(m));}
    assert.ok(secondary.every(m=>!e.primaryMuscles.includes(m)));
  }
});
test('equipment and tracking references are valid; supported categories need not fabricate exercise variants',()=>{
  for(const e of catalog.getAll()){assert.ok(e.equipment.length);assert.equal(new Set(e.equipment).size,e.equipment.length);assert.ok(e.equipment.every(x=>domain.equipmentTypes.includes(x)));assert.ok(domain.trackingTypes.includes(e.trackingType));}
  assert.deepEqual(bench.equipment,['barbell','bench']);
});
test('every exercise has 3–5 original nonempty steps and optional concise cues',()=>{
  for(const e of catalog.getAll()){assert.ok(e.content.ru.instructions.length>=3&&e.content.ru.instructions.length<=5);assert.ok(e.content.ru.instructions.every(s=>s.trim().length>10));assert.ok((e.content.ru.tips??[]).every(s=>s.trim().length>0));}
});
test('bodyweight and duration do not require fictitious external weights',()=>{
  for(const id of ['push-up','pull-up','hanging-leg-raise']){const e=catalog.getById(id);assert.equal(e.trackingType,'reps');assert.ok(e.equipment.includes(id==='push-up'?'bodyweight':'pullUpBar'));}
  assert.equal(catalog.getById('plank').trackingType,'duration');assert.deepEqual(catalog.getById('plank').equipment,['bodyweight']);
});
test('read model is detached and immutable; accidental duplicate identities are rejected',()=>{
  const source=structuredClone([bench]);const local=createLocalExerciseCatalog(source);source[0].content.ru.name='Changed';source[0].equipment.push('other');
  assert.equal(local.getAll()[0].content.ru.name,bench.content.ru.name);assert.deepEqual(local.getAll()[0].equipment,['barbell','bench']);
  assert.ok(Object.isFrozen(local.getAll()));assert.ok(Object.isFrozen(local.getAll()[0].content.ru.instructions));
  assert.throws(()=>createLocalExerciseCatalog([bench,bench]),/Duplicate/);
  assert.equal(createLocalExerciseCatalog([{...bench,content:{ru:bench.content.ru,en:undefined}}]).getById(bench.id).content.ru.name,bench.content.ru.name);
});
test('empty queries return complete deterministic Russian alphabetical catalog',()=>{
  const all=catalog.getAll();assert.deepEqual(ids(catalog.search()),ids(all));assert.deepEqual(ids(catalog.search({text:'   '})),ids(all));
  for(let i=1;i<all.length;i++)assert.ok(all[i-1].content.ru.name.localeCompare(all[i].content.ru.name,'ru')<=0);
  assert.deepEqual(ids(catalog.search()),ids(catalog.search()));
});
test('Russian exact name outranks other partial presses',()=>{
  assert.equal(catalog.search({text:'Жим штанги лёжа'})[0].id,bench.id);
  assert.ok(catalog.search({text:'жим'}).length>=8);
  assert.ok(catalog.search({text:'тяга'}).length>=7);
});
test('case, surrounding whitespace and е/ё normalize only search, never identity or display content',()=>{
  assert.deepEqual(ids(catalog.search({text:' ЖИМ '})),ids(catalog.search({text:'жим'})));
  assert.deepEqual(ids(catalog.search({text:'лежа'})),ids(catalog.search({text:'лёжа'})));
  assert.equal(catalog.getById(bench.id).content.ru.name,'Жим штанги лёжа');
});
test('English and common aliases find Russian exercises, including partial matches',()=>{
  assert.ok(ids(catalog.search({text:'bench'})).includes(bench.id));
  assert.ok(ids(catalog.search({text:' BENCH PRESS '})).includes('incline-barbell-bench-press'));
  assert.equal(catalog.search({text:'rdl'})[0].id,'romanian-deadlift');assert.equal(catalog.search({text:'молотки'})[0].id,'hammer-curl');
});
test('name prefixes rank ahead of name substrings and aliases; arbitrary queries are empty',()=>{
  const rows=catalog.search({text:'жим'});let partial=false;
  for(const e of rows){if(!e.content.ru.name.toLocaleLowerCase('ru').startsWith('жим'))partial=true;else assert.equal(partial,false);}
  assert.deepEqual(catalog.search({text:'zzzxxyy123'}),[]);
});
test('muscle filter includes primary and secondary groups, as the UI explains',()=>{
  const rows=catalog.search({muscle:'chest'});assert.ok(rows.length);assert.ok(rows.every(e=>e.primaryMuscles.includes('chest')||e.secondaryMuscles?.includes('chest')));
  assert.ok(ids(rows).includes('close-grip-bench-press'));
  assert.ok(catalog.search({muscle:'forearms'}).length>0);
});
test('equipment filtering requires the chosen item while preserving multi-item requirements',()=>{
  assert.ok(catalog.search({equipment:'bench'}).every(e=>e.equipment.includes('bench')));
  assert.ok(ids(catalog.search({equipment:'barbell'})).includes(bench.id));
});
test('muscle and equipment combine with AND; chest + dumbbell and back + cable are useful',()=>{
  for(const [muscle,equipment] of [['chest','dumbbells'],['back','cable']]){const rows=catalog.search({muscle,equipment});assert.ok(rows.length>=3);assert.ok(rows.every(e=>e.equipment.includes(equipment)&&(e.primaryMuscles.includes(muscle)||e.secondaryMuscles?.includes(muscle))));}
  assert.deepEqual(catalog.search({muscle:'calves',equipment:'pullUpBar'}),[]);
});
test('search + filters combine; resetting filters restores the same catalog without modifying source',()=>{
  const before=JSON.stringify(catalog.getAll());const rows=catalog.search({text:'жим',muscle:'chest',equipment:'dumbbells'});assert.equal(rows.length,2);
  assert.deepEqual(ids(catalog.search({text:'',muscle:undefined,equipment:undefined})),ids(catalog.getAll()));assert.equal(JSON.stringify(catalog.getAll()),before);
});
test('empty catalog and zero-result queries return clean empty states',()=>{
  const empty=createLocalExerciseCatalog([]);assert.deepEqual(empty.getAll(),[]);assert.deepEqual(empty.search({text:'жим'}),[]);assert.equal(empty.getById(bench.id),null);
});
test('routes carry stable ID; unknown, malformed, repeated and translated parameters fail safely',()=>{
  assert.deepEqual(p.exerciseRoute(bench.id),{pathname:'/exercises/[id]',params:{id:'barbell-bench-press'}});
  assert.equal(p.resolveExercise(catalog,bench.id).id,bench.id);
  for(const raw of [undefined,null,[],[bench.id],{},123,'Жим штанги лёжа','../plank','plank?x=1','nonexistent-exercise',''])assert.equal(p.resolveExercise(catalog,raw),null);
});
test('detail/row projection renders name, primary/secondary muscles, equipment, instructions and tracking',()=>{
  const v=p.presentExercise(bench,'ru');assert.equal(v.id,bench.id);assert.equal(v.name,'Жим штанги лёжа');assert.deepEqual(v.primaryMuscles,['Грудь']);assert.deepEqual(v.secondaryMuscles,['Трицепс','Плечи']);assert.deepEqual(v.equipment,['Штанга','Скамья']);assert.equal(v.tracking,'Вес и повторения');assert.deepEqual(v.instructions,bench.content.ru.instructions);
  const isolated=p.presentExercise(catalog.getById('leg-extension'),'ru');assert.deepEqual(isolated.secondaryMuscles,[]);assert.deepEqual(isolated.tips,[]);
  assert.equal(p.presentExercise(catalog.getById('plank'),'ru').tracking,'Время');
});
test('localized content can change independently of IDs and metadata; Russian remains an explicit fallback',()=>{
  const localized={...bench,content:{...bench.content,en:{name:'Bench press',instructions:['Set up','Lower','Press']}}};assert.equal(domain.exerciseContent(localized,'en').name,'Bench press');assert.equal(localized.id,bench.id);assert.equal(domain.exerciseContent(bench,'en').name,bench.content.ru.name);
  for(const locale of ['ru','en']){const copy=getExerciseMessages(locale);for(const m of domain.muscles)assert.ok(copy.muscles[m]);for(const e of domain.equipmentTypes)assert.ok(copy.equipmentLabels[e]);}
});
test('catalog, queries, detail and projections operate with no network or storage calls',()=>{
  const original=global.fetch;let calls=0;global.fetch=()=>{calls++;throw Error('Must remain offline')};
  try{for(const e of catalog.search({text:'bench'})){const resolved=p.resolveExercise(catalog,e.id);assert.ok(resolved);assert.ok(p.presentExercise(resolved,'ru').instructions.length);}assert.equal(calls,0);}finally{global.fetch=original;}
});

const media = require(path.join(root,'features/workouts/model/exerciseMedia.js'));
const assets = require(path.join(root,'shared/assets/exercises.js'));
const { formatExerciseCount } = require(path.join(root,'features/workouts/model/messages.js'));
test('all 60 Chebu illustration reservations use permanent numbers and canonical IDs; absent files are never required',()=>{
  assert.equal(Object.keys(assets.exerciseArtworkReservations).length,60);
  for(const e of catalog.getAll()){
    const key=`${e.catalogNumber}-${e.id}`;assert.equal(e.media.illustrationAssetKey,key);
    assert.equal(assets.exerciseArtworkReservations[key],`assets/exercises/app/${key}.png`);
    for(const context of ['detail','thumbnail','start','end'])assert.deepEqual(media.resolveExerciseArtwork(e.media,context,assets.exerciseImageAssets),{kind:'fallback'});
  }
});
test('one registered local illustration serves thumbnail and detail without duplicate assets',()=>{
  const reference=bench.media, registry={[reference.illustrationAssetKey]:17};
  for(const context of ['detail','thumbnail'])assert.deepEqual(media.resolveExerciseArtwork(reference,context,registry),{kind:'image',assetKey:reference.illustrationAssetKey,source:17});
  assert.deepEqual(media.resolveExerciseArtwork({...reference,thumbnailAssetKey:'bench-thumb'},'thumbnail',{...registry,'bench-thumb':18}),{kind:'image',assetKey:'bench-thumb',source:18});
  assert.equal(media.resolveExerciseArtwork({...reference,thumbnailAssetKey:'pending-thumb'},'thumbnail',registry).source,17);
  assert.equal(media.resolveExerciseArtwork({...reference,thumbnailAssetKey:'bench-thumb'},'detail',{...registry,'bench-thumb':18}).source,17);
});
test('absent, unknown or invalid handles safely fall back; external URI images are never accepted',()=>{
  const reference={illustrationAssetKey:'x'};
  for(const context of ['detail','thumbnail']){
    assert.deepEqual(media.resolveExerciseArtwork(undefined,context,{x:1}),{kind:'fallback'});
    assert.deepEqual(media.resolveExerciseArtwork(reference,context,{}),{kind:'fallback'});
    for(const x of [0,-1,1.5,Infinity,NaN,'https://example.org/image.png',{uri:'https://example.org/image.png'},undefined])
      assert.deepEqual(media.resolveExerciseArtwork(reference,context,{x}),{kind:'fallback'});
    assert.deepEqual(media.resolveExerciseArtwork({illustrationAssetKey:'toString'},context,{}),{kind:'fallback'});
  }
});
test('media stays detached/immutable and never changes routing, names or instructions',()=>{
  const source=structuredClone(bench),local=createLocalExerciseCatalog([source]);source.media.illustrationAssetKey='changed';
  const exercise=local.getById(bench.id);assert.equal(exercise.media.illustrationAssetKey,bench.media.illustrationAssetKey);assert.ok(Object.isFrozen(exercise.media));
  for(const e of [exercise,{...exercise,media:undefined}]){
    const v=p.presentExercise(e,'ru');assert.equal(v.name,bench.content.ru.name);assert.deepEqual(v.instructions,bench.content.ru.instructions);assert.deepEqual(p.exerciseRoute(v.id),p.exerciseRoute(bench.id));
  }
  const long=catalog.getById('bulgarian-split-squat');assert.equal(p.presentExercise(long,'ru').name,'Болгарские сплит-приседания');
});
test('artwork contract has bounded font-independent geometry and needs zero network calls',()=>{
  assert.equal(media.exerciseArtworkLayout.thumbnailSize,44);assert.ok(media.exerciseArtworkLayout.heroMaxHeight<=200);assert.ok(media.exerciseArtworkLayout.heroAspectRatio>1);
  const original=global.fetch;global.fetch=()=>{throw Error('Artwork must be local')};
  try{for(const e of catalog.getAll())assert.equal(media.resolveExerciseArtwork(e.media,'detail',assets.exerciseImageAssets).kind,'fallback');}finally{global.fetch=original;}
});
test('quiet default count uses natural Russian plural forms; filtered count stays explicit',()=>{
  for(const [n,label] of [[0,'упражнений'],[1,'упражнение'],[2,'упражнения'],[5,'упражнений'],[11,'упражнений'],[12,'упражнений'],[14,'упражнений'],[21,'упражнение'],[22,'упражнения'],[36,'упражнений'],[111,'упражнений']])assert.equal(formatExerciseCount(n,'ru',false),`${n} ${label}`);
  assert.equal(formatExerciseCount(3,'ru',true),'Найдено: 3');assert.equal(formatExerciseCount(1,'en',false),'1 exercise');assert.equal(formatExerciseCount(36,'en',false),'36 exercises');
});

test('count formatting also works on Hermes runtimes without Intl.PluralRules',()=>{
  const original=Intl.PluralRules;Intl.PluralRules=undefined;
  try{assert.equal(formatExerciseCount(36,'ru',false),'36 упражнений');}finally{Intl.PluralRules=original;}
});

const approved = require('./fixtures/exercise-catalog-v1.json');
const { exerciseIdAliases, retiredExerciseIds } = require(path.join(root,'features/workouts/data/exerciseCompatibility.js'));
test('approved v1 manifest matches all 60 numbers, names, muscles, equipment and tracking choices',()=>{
  assert.deepEqual(builtinExercises.map(e=>e.catalogNumber).sort(),Array.from({length:60},(_,i)=>`EX-${String(i+1).padStart(3,'0')}`));
  for(const row of approved){
    const e=catalog.getById(row.id);assert.ok(e);assert.equal(e.catalogNumber,row.catalogNumber);assert.equal(e.content.ru.name,row.name);
    for(const key of ['primaryMuscles','secondaryMuscles','equipment','trackingType'])assert.deepEqual(e[key],row[key],`${row.catalogNumber} ${key}`);
    assert.equal(catalog.getById(row.requestedId),e);
  }
});
test('catalog numbers survive reorder, alphabetical sort, search and filters; EX-061+ is supported',()=>{
  const reverse=createLocalExerciseCatalog([...builtinExercises].reverse());
  for(const e of catalog.getAll())assert.equal(reverse.getById(e.id).catalogNumber,e.catalogNumber);
  for(const e of catalog.search({text:'жим',group:'chest',equipment:'dumbbells'}))assert.equal(reverse.getById(e.id).catalogNumber,e.catalogNumber);
  for(const value of ['EX-001','EX-060','EX-061','EX-999','EX-1000'])assert.equal(domain.parseExerciseCatalogNumber(value),value);
  for(const value of ['EX-000','EX-1','EX-0001','EX-1.5','EX--1','EX-NaN',undefined])assert.equal(domain.parseExerciseCatalogNumber(value),null);
  assert.throws(()=>createLocalExerciseCatalog([bench,{...bench,id:'another-exercise'}]),/Duplicate exercise catalog number/);
  assert.throws(()=>createLocalExerciseCatalog([{...bench,catalogNumber:'EX-000'}]),/Invalid exercise catalog number/);
});
test('existing canonical IDs are retained; approved alternate slugs do not create duplicate rows or numbers',()=>{
  assert.equal(Object.keys(exerciseIdAliases).length,9);assert.equal(catalog.getAll().length,60);
  for(const [alias,id] of Object.entries(exerciseIdAliases))assert.equal(catalog.getById(alias),catalog.getById(id));
  const aliases={alternate:bench.id};const local=createLocalExerciseCatalog([bench],aliases);aliases.alternate='plank';assert.equal(local.getById('alternate').id,bench.id);
  assert.throws(()=>createLocalExerciseCatalog([bench],{[bench.id]:bench.id}),/Invalid exercise identity alias/);
  assert.throws(()=>createLocalExerciseCatalog([bench],{alternate:'missing'}),/Invalid exercise identity alias/);
  assert.throws(()=>createLocalExerciseCatalog([bench],{'bad id':bench.id}),/Invalid exercise identity alias/);
  for(const id of retiredExerciseIds)assert.equal(catalog.getById(id),null);
});
test('all detailed primary muscles map to eight canonical user groups; Farmer carry has explicit extra discovery',()=>{
  assert.equal(domain.exerciseGroups.length,8);
  for(const e of catalog.getAll())assert.ok(domain.exerciseGroups.includes(domain.primaryExerciseGroup(e)));
  assert.equal(domain.primaryExerciseGroup(catalog.getById('farmers-walk')),'core');
  assert.ok(ids(catalog.search({group:'fullBody'})).includes('farmers-walk'));
  assert.ok(ids(catalog.search({group:'core'})).includes('farmers-walk'));
  assert.equal(catalog.search({group:'chest'}).length,8);assert.equal(catalog.search({group:'legs'}).length,13);
  assert.equal(catalog.search({group:'arms'}).length,10);
  for(const g of domain.exerciseGroups)assert.ok(catalog.search({group:g}).every(e=>domain.matchesExerciseGroup(e,g)));
});
test('detailed filters retain secondary muscles and combine with group/equipment/search using AND',()=>{
  assert.ok(ids(catalog.search({muscle:'rearShoulders'})).includes('barbell-row'));
  assert.ok(ids(catalog.search({muscle:'hipFlexors'})).includes('hanging-knee-raise'));
  assert.ok(ids(catalog.search({muscle:'posteriorChain'})).includes('conventional-deadlift'));
  const rows=catalog.search({group:'chest',muscle:'shoulders',equipment:'dumbbells',text:'жим'});assert.equal(rows.length,2);
  assert.ok(rows.every(e=>domain.primaryExerciseGroup(e)==='chest'&&e.secondaryMuscles.includes('shoulders')&&domain.matchesEquipment(e,'dumbbells')));
  assert.deepEqual(catalog.search({group:'chest',equipment:'pullUpBar'}),[]);
  assert.deepEqual(ids(catalog.search({group:undefined,muscle:undefined,equipment:undefined})),ids(catalog.getAll()));
});
test('one-of equipment alternatives are searchable by each valid item, without requiring both',()=>{
  for(const [id,items] of [['t-bar-row',['machine','barbell']],['preacher-curl',['barbell','ezBar']],['goblet-squat',['dumbbells','kettlebell']]]){
    const e=catalog.getById(id);for(const item of items){assert.ok(domain.matchesEquipment(e,item));assert.ok(ids(catalog.search({equipment:item})).includes(id));}
    assert.equal(domain.matchesEquipment(e,'cable'),false);
  }
  assert.ok(domain.matchesEquipment(catalog.getById('preacher-curl'),'preacherBench'));
  assert.equal(domain.filterEquipmentTypes.includes('machineOrBarbell'),false);
});
test('English aliases and whitespace normalization cover new movements and approved examples',()=>{
  for(const [query,number] of [['bench','EX-001'],['RDL','EX-042'],['планка','EX-055'],['front squat','EX-036'],['arnold','EX-019'],['goblet','EX-041'],['farmer','EX-059'],['burpee','EX-060']])assert.ok(catalog.search({text:query}).some(e=>e.catalogNumber===number));
  assert.deepEqual(ids(catalog.search({text:' BARBELL   BENCH  PRESS '})),ids(catalog.search({text:'barbell bench press'})));
  const deadlifts=catalog.search({text:'deadlift'});assert.ok(deadlifts.some(e=>e.catalogNumber==='EX-042'));assert.ok(deadlifts.some(e=>e.catalogNumber==='EX-045'));
});
test('optional static start/end phases remain absent-safe, detached and local-only',()=>{
  const reference={...bench.media,phaseAssetKeys:{start:'bench-start',end:'bench-end'}};
  assert.deepEqual(media.resolveExerciseArtwork(reference,'start',{'bench-start':21}),{kind:'image',assetKey:'bench-start',source:21});
  assert.deepEqual(media.resolveExerciseArtwork(bench.media,'start',{[bench.media.illustrationAssetKey]:21}),{kind:'fallback'});
  assert.deepEqual(media.resolveExerciseArtwork(reference,'end',{'bench-end':{uri:'https://example.org/end.png'}}),{kind:'fallback'});
  const e={...bench,media:reference};const local=createLocalExerciseCatalog([e]);reference.phaseAssetKeys.start='changed';assert.equal(local.getById(bench.id).media.phaseAssetKeys.start,'bench-start');assert.ok(Object.isFrozen(local.getById(bench.id).media.phaseAssetKeys));
});
test('presentation exposes permanent number and localized group; all group/taxonomy labels exist',()=>{
  const v=p.presentExercise(bench,'ru');assert.equal(v.catalogNumber,'EX-001');assert.equal(v.group,'chest');assert.equal(v.groupLabel,'Грудь');
  for(const locale of ['ru','en']){const copy=getExerciseMessages(locale);for(const g of domain.exerciseGroups)assert.ok(copy.groups[g]);for(const m of domain.muscles)assert.ok(copy.muscles[m]);for(const e of domain.equipmentTypes)assert.ok(copy.equipmentLabels[e]);}
  assert.equal(formatExerciseCount(60,'ru',false),'60 упражнений');assert.equal(formatExerciseCount(8,'ru',true),'Найдено: 8');
});
