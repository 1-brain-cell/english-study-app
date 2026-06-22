# ALGORITHMS.md — Non-AI Logic

All "intelligence" the app needs, expressed as deterministic algorithms. No model calls.

## SM-2 spaced repetition

Each vocab card stores: `interval` (days), `repetition` (count), `easeFactor` (default 2.5), `dueDate`.

On review, the user grades recall quality `q` (0–5):
- 5 perfect, 4 correct after hesitation, 3 correct with difficulty, 2 wrong but familiar, 1 wrong, 0 blank.

Update:

```js
function sm2(card, q) {
  if (q < 3) {
    card.repetition = 0;
    card.interval = 1;
  } else {
    card.repetition += 1;
    if (card.repetition === 1) card.interval = 1;
    else if (card.repetition === 2) card.interval = 6;
    else card.interval = Math.round(card.interval * card.easeFactor);
  }
  card.easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );
  card.dueDate = addDays(today(), card.interval);
  return card;
}
```

Review queue = cards where `dueDate <= today`, sorted by `dueDate` ascending. New cards (no repetition) introduced at a daily cap (default 15) to avoid overload.

## Quiz generation from bank

No generation model. Build questions from existing vocab cards filtered by selected tag(s).

**Multiple choice:**
1. Pick a target card.
2. Distractors = 3 random other cards sharing a tag with the target (fallback to any tag if fewer than 3).
3. Question shows `meaning`, options are 4 `word`s. Or invert: show `word`, options are 4 `meaning`s.

**Fill-in-the-blank:**
1. Take the card's `example` sentence.
2. Replace occurrences of `word` (case-insensitive, whole-word) with `_____`.
3. Answer = `word`. Accept case-insensitive, trimmed match.

**Matching:**
1. Take N cards (default 5). Left column `word`, right column shuffled `meaning`. Match pairs.

**Scoring → SRS feedback:**
- Correct quiz answer = treat as recall `q=4`; wrong = `q=2`. Apply `sm2()` so misses resurface sooner.

## Clause self-check (no parsing model)

The "analyzer" is a fixed checklist rendered next to the user's pasted text. No NLP. The user answers; the app just records answers and lets them compare to library clauses. Questions:
- Identify the parties.
- Find every `shall` / `must` (obligations) and `may` (rights).
- Is there a termination trigger? A liability cap? A governing-law clause?
- Which standard library clause is this closest to?

Optionally do a trivial client-side keyword highlight (regex) for the legal connectors in `grammar.json` and the modal verbs — this is cosmetic string matching, not analysis.

## Writing self-rubric (no grader model)

Render the rubric from `rubrics.json` as a checklist after the user writes. Each item is a yes/no the user marks. The app computes a simple completion percentage and stores the draft + checklist in the writing log. No automated correction; the external-link button hands off to Grammarly/LanguageTool if the user wants machine checking.

## Streak + progress

- Streak: increment when any activity logged on a calendar day; reset if a day is missed.
- Weekly hours: sum logged minutes by mode (Focused/Immersion) within the current ISO week.
- Phase: derived from a user-set start date (`startDate + 0–8 weeks = Phase 1`, `8–16 = Phase 2`, `16–24 = Phase 3`), but user-overridable.
