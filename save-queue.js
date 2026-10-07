// Serialize writes to each answer. A late response cannot overwrite a newer edit.
export function createSaveQueue({write,onSaved=()=>{},onStatus=()=>{},delay=600}) {
  const entries=new Map();
  function enqueue(id,value,userId) {
    const key=userId+':'+id;
    const entry=entries.get(key)||{id,userId,revision:0};
    entry.value=value; entry.revision++; entry.status="saving…"; entries.set(key,entry);
    clearTimeout(entry.timer); onStatus(id,'saving…',userId);
    entry.timer=setTimeout(()=>run(key),delay);
  }
  async function run(key) {
    const e=entries.get(key); if(!e)return;
    clearTimeout(e.timer);
    if(e.running){await e.running;return entries.has(key)?run(key):undefined;}
    const revision=e.revision,value=e.value;
    e.running=(async()=>{
      try {
        await write(e.id,value,e.userId);
        onSaved(e.id,value,e.userId);
        if(e.revision===revision){entries.delete(key);onStatus(e.id,'saved',e.userId);}
      } catch(error) {e.status='save failed — retry';onStatus(e.id,e.status,e.userId);}
      finally {e.running=null;}
    })();
    await e.running;
    if(entries.has(key)&&e.revision!==revision)await run(key);
  }
  async function flush(){await Promise.all([...entries.keys()].map(run));return entries.size===0;}
  return {enqueue,flush,pendingStatus:(id,userId)=>entries.get(userId+':'+id)?.status,pendingValue:(id,userId)=>entries.get(userId+':'+id)?.value,hasPending:()=>entries.size>0};
}
