begin;
create temporary table system_before_answers on commit drop as select * from public.answers;
create temporary table system_before_question_ids on commit drop as select id from public.questions;
create temporary table system_before_section_ids on commit drop as select id from public.sections;
do $migration$
declare b jsonb; s jsonb; q jsonb; wb uuid; sec uuid; uid uuid; payload jsonb := $payload$__PRIVATE_PAYLOAD__$payload$::jsonb;
begin
select id into strict uid from auth.users where id='__TARGET_USER_ID__'::uuid;
perform pg_advisory_xact_lock(hashtext('system-course-20261007'));
for b in select value from jsonb_array_elements(payload) loop
 select id into strict wb from public.workbooks where user_id=uid and slug=b->>'slug';
 update public.workbooks set title=b->>'title',subtitle=b->>'subtitle',source_file_name=b->>'source_file',source_page=1,position=(b->>'position')::int where id=wb;
 for s in select value from jsonb_array_elements(b->'sections') loop
  select id into sec from public.sections where user_id=uid and workbook_id=wb and slug=s->>'slug';
  if sec is null then
   insert into public.sections(user_id,workbook_id,slug,title,description,position) values(uid,wb,s->>'slug',s->>'title',s->>'description',(s->>'position')::int) returning id into sec;
  else
   update public.sections set title=s->>'title',description=s->>'description',position=(s->>'position')::int where id=sec;
  end if;
  update public.questions set help_text='[MY NOTES] Поле для выполнения задания курса. Формулировка интерфейса сохранена из предыдущей версии.' || case when coalesce(help_text,'')='' then '' else E'\n' || help_text end where section_id=sec and coalesce(help_text,'') not like '[MY NOTES]%';
  for q in select value from jsonb_array_elements(s->'new_questions') loop
   if not exists(select 1 from public.questions where user_id=uid and source_key='course-20261007.'||(s->>'slug')||'.'||(q->>'position')) then
    insert into public.questions(user_id,workbook_id,section_id,source_key,prompt,help_text,input_type,position) values(uid,wb,sec,'course-20261007.'||(s->>'slug')||'.'||(q->>'position'),q->>'prompt',q->>'help_text','textarea',(q->>'position')::int);
   end if;
  end loop;
 end loop;
end loop;
update public.workbooks w set position=ordering.pos from (values ('raspakovka-lichnosti',1),('vizualnaya-ierarhiya',2),('analiz-ca',3),('foto-video',4),('analiz-konkurentov',5),('tablica-osoznannosti',6),('tipografika',7),('psihologiya-vnimaniya-triggeri',8),('koloristika',9),('psihologiya-vospriyatiya-cvetov',10),('psihologiya-prodazh',11),('kak-obshatsya-s-klientami',12)) as ordering(slug,pos) where w.user_id=uid and w.slug=ordering.slug;
if exists(select * from system_before_answers except select * from public.answers) or exists(select * from public.answers except select * from system_before_answers) then raise exception 'Answer preservation check failed';end if;
if exists(select id from system_before_question_ids except select id from public.questions) or exists(select id from system_before_section_ids except select id from public.sections) then raise exception 'Original IDs lost';end if;
end $migration$;
commit;
select w.position,w.title,count(distinct s.id) as verified_sections,count(q.id) as answer_fields from workbooks w join sections s on s.workbook_id=w.id and s.description like 'Источник: %' left join questions q on q.section_id=s.id group by w.id order by w.position;
