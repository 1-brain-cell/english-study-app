# 🚀 LingoVault (English Study App)

> **Live Web App:** [🔗 Click here to study!](https://1-brain-cell.github.io/english-study-app/)

Hey there! 👋 This is a personal, fully offline English-learning web app that I built to help myself study English. It's tailored for my specific needs:
1. **Business / contract / AI-tech English** (focused study tracks)
2. **Casual immersion** via games (Genshin Impact, Identity V, Valorant esports, osu!), VTubers (Niyeko, Azeru), and Reddit.

I created this mainly for my own study, but if you happen to come across it and find it useful, **please feel free to use it, fork it, or clone it for yourself!** 💖 Everything runs 100% in your browser.

---

## 🌟 Why zero-AI?

I wanted something that runs forever for free, completely offline, with no limits and no API keys. All "intelligence" is pre-baked into seed data and driven by local algorithms (like the SM-2 Spaced Repetition System and local quiz generators) and self-assessment rubrics. If you need explanations or grammar checks, it easily links out to external dictionaries or LanguageTool/Grammarly.

## 🛠️ For the build agent

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

---

## 📢 Recent Updates

* **Global Font Size Boost**: Made text across the entire dashboard slightly larger and much easier to read during quick study breaks.
* **Refined Deployments**: Configured custom subpathing inside `vite.config.js` and synced deployment triggers with the default `master` branch.
* **Friendly README Guidelines**: Updated the repo description to invite anyone to clone, fork, or copy parts of LingoVault if they find it helpful.



