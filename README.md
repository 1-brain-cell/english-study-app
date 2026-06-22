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

## Deploying to GitHub (Ready to Push)

All source files are fully configured and ready to push to GitHub. 

To host the site live on **GitHub Pages**:
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete offline english study dashboard"
   ```
2. Create a blank repo on GitHub and push to `main`:
   ```bash
   git remote add origin https://github.com/your-username/english-study-app.git
   git branch -M main
   git push -u origin main
   ```
3. Enable Pages: Go to your repository **Settings** ➔ **Pages** ➔ under **Source** choose **GitHub Actions**. The [.github/workflows/deploy.yml](file:///C:/Users/User/Code/english-study-app/.github/workflows/deploy.yml) will automatically build and publish your site.

