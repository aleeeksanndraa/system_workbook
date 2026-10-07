// Public metadata only. Course text and answers stay in the authenticated database.
export const COURSE_SLUGS = [
  'raspakovka-lichnosti', 'vizualnaya-ierarhiya', 'analiz-ca', 'foto-video',
  'analiz-konkurentov', 'tablica-osoznannosti', 'tipografika',
  'psihologiya-vnimaniya-triggeri', 'koloristika',
  'psihologiya-vospriyatiya-cvetov', 'psihologiya-prodazh'
];
export function orderWorkbooks(workbooks) {
  const rank = w => { const i = COURSE_SLUGS.indexOf(w.slug); return i < 0 ? 1000 + (w.position || 0) : i; };
  return [...workbooks].sort((a,b) => rank(a)-rank(b)).map((w,i) => ({...w,position:i+1}));
}
// Earlier seed functions created two copies of the same sections. Keep all rows
// and IDs in the database; show old sections as an appendix only if answered.
export function visibleSections(sections, questions, answers) {
  const verified = new Set(sections.filter(s => s.description?.startsWith('Источник: ')).map(s => s.workbook_id));
  const answered = new Set(answers.filter(a => a.value?.trim()).map(a => a.question_id));
  return sections.filter(s => !verified.has(s.workbook_id) || s.description?.startsWith('Источник: ') || questions.some(q => q.section_id===s.id && answered.has(q.id)))
    .sort((a,b) => Number(!a.description?.startsWith('Источник: '))-Number(!b.description?.startsWith('Источник: ')) || a.position-b.position || a.id.localeCompare(b.id))
    .map(s => verified.has(s.workbook_id) && !s.description?.startsWith('Источник: ') ? {...s,title:s.title+' · прежние ответы'} : s);
}
