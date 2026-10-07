// Run only for accounts missing the initial library. Existing course content is
// maintained by reviewed private imports, never overwritten on page load.
export async function ensureWorkbooks(sb,userId){
 const count=async()=>{const r=await sb.from('workbooks').select('id',{count:'exact',head:true}).eq('user_id',userId);if(r.error)throw r.error;return r.count||0;};
 const invoke=async name=>{const r=await sb.functions.invoke(name,{body:{}});if(r.error)throw r.error;if(r.data?.error)throw new Error(r.data.error);};
 let n=await count();
 if(n===0){await invoke('seed_workbooks');n=await count();}
 if(n<7){await invoke('seed_remaining_workbooks');n=await count();}
 if(n<11)await invoke('seed_new_materials');
}
