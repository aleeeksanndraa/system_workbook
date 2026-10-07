import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=['index.html','app.js','config.js','seed.js','mobile.js','styles.css','mobile-fixes.css','favicon.svg','course-order.js','save-queue.js'];
const sources=await Promise.all(files.map(file=>readFile(file,'utf8')));
const version=createHash('sha256').update(sources.join('\n')).digest('hex').slice(0,12);
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(let i=0;i<files.length;i++){
  // A release uses one version across local modules and styles, so browser/CDN
  // caches cannot mix the old independent seed module with the new app.
  const source=sources[i].replace(/(["'])\.\/([a-z-]+\.(?:js|css|svg))\1/g,(match,quote,path)=>`${quote}./${path}?v=${version}${quote}`);
  await writeFile('dist/'+files[i],source);
}
console.log(`Built ${files.length} public assets (${version}). Private imports are excluded.`);
