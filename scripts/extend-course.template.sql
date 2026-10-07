begin;
select pg_advisory_xact_lock(hashtext('system-course-20261007'));
create temporary table system_saved_answers on commit drop as select * from public.answers;
create temporary table system_saved_summaries on commit drop as select * from public.section_summaries;
create temporary table system_saved_brain on commit drop as select * from public.brain_entries;
create temporary table system_saved_questions on commit drop as select * from public.questions;
create temporary table system_saved_sections on commit drop as select * from public.sections;
create temporary table system_saved_workbooks on commit drop as select * from public.workbooks;
do $migration$
declare uid uuid; b jsonb; s jsonb; q jsonb; wb uuid; sec uuid;
 payload jsonb := $payload$__PRIVATE_PAYLOAD__$payload$::jsonb;
begin
 select id into strict uid from auth.users where id='__TARGET_USER_ID__'::uuid;
 for b in select value from jsonb_array_elements(payload) loop
  select id into wb from public.workbooks where user_id=uid and slug=b->>'slug';
  if wb is null then
   insert into public.workbooks(user_id,slug,title,subtitle,source_file_name,position)
   values(uid,b->>'slug',b->>'title',b->>'subtitle',b->>'source_file',(b->>'position')::int) returning id into wb;
  end if;
  for s in select value from jsonb_array_elements(b->'sections') loop
   select id into sec from public.sections where user_id=uid and workbook_id=wb and slug=s->>'slug';
   if sec is null then
    insert into public.sections(user_id,workbook_id,slug,title,description,position)
    values(uid,wb,s->>'slug',s->>'title',s->>'description',(s->>'position')::int) returning id into sec;
   end if;
   for q in select value from jsonb_array_elements(s->'new_questions') loop
    if not exists(select 1 from public.questions where user_id=uid and source_key=q->>'source_key') then
     insert into public.questions(user_id,workbook_id,section_id,source_key,prompt,help_text,input_type,position)
     values(uid,wb,sec,q->>'source_key',q->>'prompt',q->>'help_text','textarea',(q->>'position')::int);
    end if;
   end loop;
  end loop;
 end loop;
 if exists(select * from system_saved_answers except select * from public.answers) or exists(select * from public.answers except select * from system_saved_answers) then raise exception 'Answers changed'; end if;
 if exists(select * from system_saved_summaries except select * from public.section_summaries) or exists(select * from public.section_summaries except select * from system_saved_summaries) then raise exception 'Summaries changed'; end if;
 if exists(select * from system_saved_brain except select * from public.brain_entries) or exists(select * from public.brain_entries except select * from system_saved_brain) then raise exception 'AI memory changed'; end if;
 if exists(select * from system_saved_questions except select * from public.questions) or exists(select * from system_saved_sections except select * from public.sections) or exists(select * from system_saved_workbooks except select * from public.workbooks) then raise exception 'Existing course records changed'; end if;
 if (select count(*) from public.workbooks where user_id=uid and position between 1 and 26) <> 26 then raise exception 'Expected 26 course materials'; end if;
end $migration$;
commit;
