# GEMINI.md — Agent Instructions

> Primary instruction file for the Antigravity CLI agent building this project.
> Read this first. Then read `docs/BUILD_SPEC.md` and `docs/CURRICULUM.md` before writing any code.

## What you are building

A **zero-AI**, fully offline, client-side English-learning web app. The user is a Thai native speaker (data-analytics trainer, gamer) learning English for two tracks: (1) business / contract / AI-tech English, and (2) casual immersion via games and VTubers. The app is a personal study dashboard.

**Critical constraint: NO AI runtime.** The shipped app makes ZERO network calls and requires ZERO API keys. All "intelligence" is pre-baked into seed JSON files and replaced at runtime by algorithms (SRS, quiz generation), curated content, and self-assessment rubrics. Do not add any fetch/axios/LLM SDK calls in the app code.

## Hard rules

1. **No network calls in shipped code.** No API keys, no `.env` for runtime. The only acceptable external interaction is `window.open()` to a dictionary/Reddit/wiki link in a new tab (these are user-initiated, not background calls).
2. **localStorage is the only persistence.** Provide JSON export/import for backup.
3. **Seed data lives in `src/data/*.json`** and is imported statically. It is already provided in this repo — do not regenerate it unless asked.
4. **English is the language of the UI and all instruction.** Thai may appear only inside seed content where explicitly marked (e.g. clause explanations the user wrote for themselves). Default UI: English.
5. **Mobile-first responsive.** The user opens this on a phone during lunch breaks.
6. **No `<form>` tags causing full-page reload; use controlled inputs and onClick handlers.**

## Tech stack

- Vite + React + TailwindCSS, single-page app
- React state + localStorage only; no backend, no router library needed beyond a simple tab/view switcher (you may use react-router if preferred, but keep it client-only)
- Charts: a lightweight lib (recharts) is fine — it bundles, no network
- SRS: implement SM-2 yourself (see `docs/ALGORITHMS.md`)

## Build order

Follow `docs/BUILD_SPEC.md` section "Build sequence" exactly. Build core (Dashboard + Vocabulary SRS) first, verify it works offline, then layer the rest.

## Definition of done

- App runs with `npm run dev`, works fully with networking disabled (test: turn off wifi, reload, everything except external-link buttons still works).
- All 8 modules present and wired to localStorage.
- Seed data loads and is queryable.
- Export/import round-trips user data.
- Mobile layout verified at 380px width.

## File map

```
GEMINI.md              <- you are here (agent entry point)
README.md              <- human-facing project overview
docs/
  CURRICULUM.md        <- the learning plan (what the user studies)
  BUILD_SPEC.md        <- full technical spec for the app
  ALGORITHMS.md        <- SM-2 SRS + quiz generation logic, no-AI substitutions
  DATA_SCHEMA.md       <- shape of every seed JSON file
  SOURCES.md           <- references used to build seed data
src/data/
  vocab.json
  clauses.json
  grammar.json
  rubrics.json
  errors.json
  external-links.json
  immersion-sources.json
```

## Notes on the user's environment

The user runs multiple agents (Antigravity CLI with Gemini, Claude Code, Codex). This GEMINI.md is the canonical brief. If a `CLAUDE.md` or `AGENTS.md` is added later, keep them as thin pointers to this file to avoid drift.
