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