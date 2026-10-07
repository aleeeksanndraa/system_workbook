import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSE_SLUGS,orderWorkbooks,visibleSections} from '../course-order.js';
import {createSaveQueue} from '../save-queue.js';
test('canonical order keeps stable IDs and additional materials',()=>{
 const input=[...COURSE_SLUGS].reverse().map((slug,i)=>({slug,id:slug,position:i}));input.push({slug:'extra',id:'extra',position:2});
 const result=orderWorkbooks(input);assert.deepEqual(result.slice(0,11).map(w=>w.slug),COURSE_SLUGS);assert.equal(result[11].slug,'extra');assert.ok(result.every(w=>w.id===w.slug));
});
test('verified sections hide empty legacy copies, preserve answered legacy sections',()=>{
 const sections=[{id:'old',workbook_id:'w',position:1},{id:'current',workbook_id:'w',position:1,description:'Источник: source.pdf'},{id:'other',workbook_id:'other',position:1}];
 const q=[{id:'q',section_id:'old'}];
 assert.deepEqual(visibleSections(sections,q,[]).map(s=>s.id),['current','other']);
 assert.deepEqual(visibleSections(sections,q,[{question_id:'q',value:'my words'}]).map(s=>s.id),['current','old','other']);
});
test('rapid edits while a write is pending save newest value last',async()=>{
 const writes=[];let release;let started;
 const start=new Promise(r=>started=r);
 const q=createSaveQueue({delay:10000,write:async(id,v)=>{writes.push(v);if(v==='first'){started();await new Promise(r=>release=r)}}});
 q.enqueue('q','first','u');const flushing=q.flush();await start;q.enqueue('q','latest','u');release();await flushing;
 assert.deepEqual(writes,['first','latest']);assert.equal(q.hasPending(),false);
});
test('failed writes stay retryable and never report saved',async()=>{
 let fail=true;const saved=[],statuses=[];
 const q=createSaveQueue({delay:10000,write:async()=>{if(fail)throw Error('offline')},onSaved:(id,v)=>saved.push(v),onStatus:(id,v)=>statuses.push(v)});
 q.enqueue('q','answer','u');assert.equal(await q.flush(),false);assert.deepEqual(saved,[]);assert.match(statuses.at(-1),/failed/);
 fail=false;assert.equal(await q.flush(),true);assert.deepEqual(saved,['answer']);
});
test('queues are isolated by account',async()=>{
 const rows=[];const q=createSaveQueue({delay:10000,write:async(id,value,user)=>rows.push({id,value,user})});
 q.enqueue('q','a','alice');q.enqueue('q','b','bob');await q.flush();assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r.user).sort(),['alice','bob']);
});
import {ensureWorkbooks} from '../seed.js';
test('existing library is never re-seeded on another browser or account login',async()=>{
 const sb={from:()=>({select:()=>({eq:async()=>({count:12,error:null})})}),functions:{invoke:async()=>{throw Error('must not invoke')}}};await ensureWorkbooks(sb,'user');
});
test('a database failure is surfaced instead of seeding an apparently empty account',async()=>{
 const sb={from:()=>({select:()=>({eq:async()=>({count:null,error:Error('offline')})})})};await assert.rejects(ensureWorkbooks(sb,'user'),/offline/);
});
