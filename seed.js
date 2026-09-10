import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const cfg=window.SYSTEM_CONFIG||{};
if(cfg.SUPABASE_URL&&cfg.SUPABASE_PUBLISHABLE_KEY){
  const sb=createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
  const run=async(session)=>{
    if(!session||localStorage.getItem("system-seed-v2")==="done") return;
    try{
      const {count}=await sb.from("workbooks").select("id",{count:"exact",head:true}).eq("user_id",session.user.id);
      if((count||0)===0){
        const a=await sb.functions.invoke("seed_workbooks",{body:{}});
        if(a.error||a.data?.error) throw a.error||new Error(a.data.error);
      }
      const {count:after}=await sb.from("workbooks").select("id",{count:"exact",head:true}).eq("user_id",session.user.id);
      if((after||0)<7){
        const b=await sb.functions.invoke("seed_remaining_workbooks",{body:{}});
        if(b.error||b.data?.error) throw b.error||new Error(b.data.error);
      }
      localStorage.setItem("system-seed-v2","done");
      location.reload();
    }catch(e){console.error("SYSTEM workbook import failed",e)}
  };
  sb.auth.getSession().then(({data})=>run(data.session));
  sb.auth.onAuthStateChange((_e,s)=>setTimeout(()=>run(s),0));
}
