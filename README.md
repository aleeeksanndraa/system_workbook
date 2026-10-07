# SYSTEM — Sasha's private Blog OS

A static GitHub Pages frontend with a private Supabase backend and OpenAI-powered analysis.

## Included

- Private email/password login
- Workbook library
- Cross-device autosave
- Voice dictation
- AI summary per page/section
- Whole-workbook summary
- Persistent MY BRAIN
- Semantic memory/search with pgvector
- ASK MY BRAIN grounded in Sasha's saved answers
- Idea Vault
- Generation of any requested number of ideas in batches
- Source references back to workbook answers
- Separation between Sasha's raw answers and AI interpretation

## Architecture

- GitHub Pages: static UI only
- Supabase: Auth + Postgres + pgvector + Edge Functions
- OpenAI API: summaries, chat, idea generation, embeddings and audio transcription

The OpenAI secret key is never placed in GitHub Pages.

Read `DEPLOY.md` for setup.
## Course update (2026-10-07)

The canonical course order is defined in `course-order.js`. Additional existing
materials follow the eleven course workbooks. Workbook slugs and IDs are retained.
The private Supabase import restores the source text for workbooks 8–11 across
4 / 9 / 9 / 7 sections. Color perception is reference material; its nine writing
fields are explicitly site notes, not questions attributed to the course author.
Existing answer fields remain attached to the same question IDs.

Earlier imports created parallel copies of sections. Verified source sections
are recognized by their `Источник: ` provenance prefix. Unanswered older copies
remain in the database but are omitted from navigation and progress; answered
older sections remain visible after the verified sections. No answer is migrated,
rewritten, or deleted. AI summaries are rendered separately from course sources
and raw answers. Existing AI indexing and summary endpoints are unchanged.

### Private content import

Course PDFs and reviewed JSON/SQL belong in ignored `private-import/`. Never add
them to the public repository. `scripts/course-import.template.sql` updates
existing workbook/section metadata, adds missing fields, and asserts that all
answer rows and previous question/section IDs survive the transaction unchanged.
It is repeatable using stable section slugs and question source keys.

Prepare SQL from a reviewed private payload with:

```
node scripts/prepare-course-import.js private-import/reviewed.json USER_UUID
```

The payload has four workbook objects with `slug`, `title`, `subtitle`,
`source_file`, `position`, and `sections`; each section has `slug`, `title`,
`description`, `position`, and `new_questions`. Each new question has `prompt`,
`help_text`, and `position`. The target is an existing authenticated user.
Execute the generated private SQL in the project's authenticated SQL editor.
Do not run automatic legacy seeds to update existing libraries.

### Validation and deployment

```
npm test
npm run build
```

GitHub Pages publishes only `dist/`, which is built from an explicit public asset
allowlist. Private imports, tests, and SQL never enter the deployed artifact.
The save queue serializes updates, flushes on section/navigation/summary actions,
retains failed writes for retry, and warns before closing with unsaved edits.
Failed edits remain in memory until retried; there is no offline database.
