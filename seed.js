import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const cfg=window.SYSTEM_CONFIG||{};
if(cfg.SUPABASE_URL&&cfg.SUPABASE_PUBLISHABLE_KEY){
  const sb=createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
  const run=async(session)=>{
    if(!session||sessionStorage.getItem("system-seed-v1")==="done") return;
    try{
      const {count}=await sb.from("workbooks").select("id",{count:"exact",head:true}).eq("user_id",session.user.id);
      if((count||0)===0){
        const {data,error}=await sb.functions.invoke("seed_workbooks",{body:{}});
        if(error||data?.error) throw error||new Error(data.error);
        sessionStorage.setItem("system-seed-v1","done");
        location.reload();
      } else sessionStorage.setItem("system-seed-v1","done");
    }catch(e){console.error("SYSTEM workbook import failed",e)}
  };
  sb.auth.getSession().then(({data})=>run(data.session));
  sb.auth.onAuthStateChange((_e,s)=>setTimeout(()=>run(s),0));
}
