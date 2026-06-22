# BUILD_SPEC.md — Zero-AI Website Build Spec

Technical spec for the study app. Zero AI runtime, fully offline, localStorage only. Read alongside `CURRICULUM.md` (content), `ALGORITHMS.md` (logic), `DATA_SCHEMA.md` (data shapes).

## Design principle when there is no AI

AI would have done four things: generate, grade, explain, roleplay. Removing it, replace each with:

1. **Curated static content** — pre-baked seed JSON (vocab, clause library, grammar reference, checklists).
2. **Self-input + self-assessment** — the user inputs and self-checks via structured rubrics instead of a grader.
3. **Algorithms instead of intelligence** — SRS, quiz-from-bank, simple pattern matching. No model needed.

What is genuinely lost: on-demand explanation and free-form grading. Compensate with self-check rubrics and external reference links (dictionary, Reddit, wiki). Free-form roleplay conversation is dropped entirely; the curriculum routes that to real human partners and VTuber/Reddit input.

## Modules

### 1. Dashboard / Progress
- Current phase (1/2/3), day-in-plan, this-week hours (Focused vs Immersion bar)
- 3 milestone checkboxes
- Streak counter
- Pure localStorage.

### 2. Vocabulary SRS (core — Anki replacement)
- Loads seed `vocab.json` (400+ words: business, legal, ai-tech, genshin-lore, identityv-skill, vtuber-slang, cross-domain) with meaning/example/tag.
- User can add words + tags.
- SM-2 spaced repetition (see ALGORITHMS.md).
- Fields: word, meaning, example, source, tag.
- **Replaces "explain this word":** a button opening an external dictionary (Cambridge / Merriam-Webster / Longman) in a new tab with the word pre-queried (URL from `external-links.json`).
- Slang counter: warn user to add slang only after 3+ sightings (immersion rule); track a sightings count field.

### 3. Contract Clause Library (Analyzer replacement)
- Loads seed `clauses.json`: standard clauses (NDA, payment terms, termination, indemnification, governing law, SLA, DPA), each with a plain explanation and obligation (shall/must) vs right (may) markup, pre-written.
- Legal-connector glossary: hereinafter, notwithstanding, whereas, pursuant to, subject to, provided that.
- Confusing word-pair table: terminate/expire, breach/default, warranty/guarantee, liable/responsible.
- **User self-practice:** paste own clause → no AI parse, but a guided checklist to answer themselves: Who are the parties? Where does "shall" appear? Is there a termination condition? Compare against library clauses.
- Link to SEC EDGAR for real contracts.

### 4. Writing Practice + Self-Rubric (Grader replacement)
- Prompts from curriculum: 100-word summary, business email, NDA clause.
- Textarea + word counter.
- **Replaces AI grading:** a self-check rubric after writing — grammar (subject-verb agreement, tense, articles), register (formal/informal fit), structure, intended vocabulary used. Loaded from `rubrics.json`.
- Stores all writing as a log to review progress over time.
- Common-error reference from `errors.json` (frequent Thai-learner mistakes: articles, plurals, tense) for self-comparison.
- Optional external link: paste into Grammarly free / LanguageTool (user-initiated, new tab).

### 5. Immersion Logger
- Log: source (Niyeko / Azeru / Genshin / Identity V / VCT / osu / Reddit), minutes, phrases captured. Sources seeded from `immersion-sources.json`.
- Button to push a captured phrase into the vocab module.
- VTuber compare tab: Niyeko vs Azeru — free-text notes on accent/style differences.
- Direct links to each subreddit / channel (from seed).

### 6. Quiz (from bank, not AI-generated)
- Generates quizzes from in-app vocab algorithmically (see ALGORITHMS.md):
  - multiple choice: correct word + 3 random distractors from same tag
  - fill-in: hide the word inside its example sentence
  - matching: word ↔ meaning
- Select tag + question count.
- Scores feed back into SRS (frequent misses surface more often).

### 7. Grammar & Reference (static)
- Renders `grammar.json`: Phase-1 grammar (conditionals, modals shall/may/must/will legal meanings, passive, relative clauses) with business/contract examples.
- Collapsible sections.
- Cross-domain word table: deploy / scale / meta / grind / performance across contexts.

### 8. Study Planner
- Sample weekday/weekend schedules from curriculum.
- User ticks completed activities → feeds Progress.
- Reminds of the 6–7 Focused / 4–5 Immersion weekly split.

## AI vs Zero-AI comparison

| Feature | AI version | Zero-AI version |
|---|---|---|
| Explain a word | on-demand generate | dictionary link + seed example |
| Analyze a clause | AI parses any clause | curated library + self-checklist |
| Grade writing | auto grade + diff | self-rubric + external grammar tool |
| Generate quiz | live generation | algorithm from bank |
| Tutor chat | roleplay | dropped → real language partner |
| Cost | API/quota | 0 |
| Offline | no | full |

## Build sequence

1. Scaffold Vite + React + Tailwind + simple view switcher for 8 modules.
2. localStorage data layer + JSON export/import.
3. Wire seed JSON imports from `src/data/`.
4. Vocabulary SRS + Dashboard (core). **Verify offline before continuing.**
5. Quiz engine (algorithm).
6. Grammar/Reference + Clause Library (static render).
7. Writing Practice + self-rubric.
8. Immersion Logger + VTuber compare.
9. Study Planner + progress wiring.
10. Polish: mobile (380px), streak, progress charts.

No network call after deploy. Hosting-agnostic; opening the static build from a file works identically.
