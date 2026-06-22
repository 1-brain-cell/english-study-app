# English Study App

A personal, fully offline English-learning web app. Zero AI runtime, no API keys, no network calls after build. All data lives in your browser (localStorage) with JSON export/import for backup.

Built for a Thai native speaker learning two tracks:
1. **Business / contract / AI-tech English** (focused study)
2. **Casual immersion** via games (Genshin Impact, Identity V, Valorant esports, osu!) and VTubers (Niyeko, Azeru) and Reddit

## Why zero-AI

It runs forever for free, offline, with no quota and no keys. "Intelligence" is pre-baked into seed data and replaced by algorithms (spaced repetition, quiz generation from your own word bank) and self-assessment rubrics. On-demand explanation hands off to external dictionary links; grammar checking hands off to LanguageTool/Grammarly if you want it.

## For the build agent

Read **GEMINI.md** first, then `docs/BUILD_SPEC.md` and `docs/CURRICULUM.md`.

## Stack

Vite + React + TailwindCSS, localStorage only. Run:

```
npm install
npm run dev
```

## Modules

Dashboard · Vocabulary SRS · Contract Clause Library · Writing Practice (self-rubric) · Immersion Logger · Quiz · Grammar Reference · Study Planner

## Project layout

```
GEMINI.md              agent entry point
README.md              this file
docs/
  CURRICULUM.md        the learning plan
  BUILD_SPEC.md        technical spec
  ALGORITHMS.md        SRS + quiz logic
  DATA_SCHEMA.md       seed data shapes
  SOURCES.md           data provenance
src/data/
  vocab.json
  clauses.json
  grammar.json
  rubrics.json
  errors.json
  external-links.json
  immersion-sources.json
```

## Test for "done"

Turn off wifi, reload the app. Everything works except external-link buttons (dictionary, Reddit). That is the definition of done.

## Icons & Assets Reference

* **Icons**: Powered by [Lucide React](https://lucide.dev/) (an open-source community fork of Feather Icons). All active menus, badges, buttons, and state indicators import SVG components locally from `lucide-react`.
* **Seed Data**: Provenance details and references for vocabulary, legal contracts, and immersion sources are documented in [docs/SOURCES.md](file:///C:/Users/User/Code/english-study-app/docs/SOURCES.md).

## Deploying to GitHub Pages

This project is configured to automatically build and deploy to GitHub Pages via GitHub Actions on every push to the `master` branch.

* **Repository**: `https://github.com/1-brain-cell/english-study-app`
* **Live Site URL**: `https://1-brain-cell.github.io/english-study-app/`

### How it works:
1. **GitHub Actions Workflow**: The configuration in [.github/workflows/deploy.yml](file:///C:/Users/User/Code/english-study-app/.github/workflows/deploy.yml) triggers automatically whenever you push code to the `master` branch.
2. **One-time Settings Configuration**:
   - Go to your repository on GitHub: **Settings** ➔ **Pages**.
   - Under **Build and deployment** ➔ **Source**, select **GitHub Actions** from the dropdown menu.
   - Once selected, the workflow will automatically compile the React app and deploy the build outputs to GitHub Pages.


