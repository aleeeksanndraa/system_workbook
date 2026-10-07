import {readFile,writeFile} from 'node:fs/promises';
import {COURSE_SLUGS,REFERENCE_SLUGS} from '../course-order.js';
const [input,userId,output='private-import/extend.sql']=process.argv.slice(2);
if(!input||! /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(userId||''))throw Error('Expected private JSON and target user UUID');
const books=JSON.parse(await readFile(input,'utf8')),keys=new Set();
if(!Array.isArray(books)||books.length!==14)throw Error('Expected materials 13–26');
for(const [index,b] of books.entries()){
 if(b.position!==index+13||b.slug!==COURSE_SLUGS[index+12]||!b.title||!b.source_file||!b.sections?.length)throw Error('Invalid canonical material');
 for(const s of b.sections){
  if(!s.slug||!s.title||!s.description?.startsWith('Источник: ')||!Array.isArray(s.new_questions))throw Error('Missing source section');
  if(REFERENCE_SLUGS.has(b.slug)&&s.new_questions.length)throw Error('Reference material must not add answer fields');
  for(const q of s.new_questions){if(!q.prompt||!q.source_key||keys.has(q.source_key))throw Error('Missing or duplicate question key');keys.add(q.source_key);}
 }
}
const payload=JSON.stringify(books);if(payload.includes('$payload$'))throw Error('Invalid delimiter');
const template=await readFile(new URL('./extend-course.template.sql',import.meta.url),'utf8');
await writeFile(output,template.replace('__PRIVATE_PAYLOAD__',payload).replace('__TARGET_USER_ID__',userId));
console.log(`Prepared 14 materials and ${keys.size} blank fields; no answers or AI writes.`);
