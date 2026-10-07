import {mkdir,copyFile,rm} from 'node:fs/promises';
const files=['index.html','app.js','config.js','seed.js','mobile.js','styles.css','mobile-fixes.css','favicon.svg','course-order.js','save-queue.js'];
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of files)await copyFile(file,'dist/'+file);
console.log(`Built ${files.length} public assets. Private imports are excluded.`);
