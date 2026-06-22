# DATA_SCHEMA.md — Seed Data Schemas

Shapes for every file in `src/data/`. The agent imports these statically; do not fetch.

## vocab.json
Array of cards.
```json
{
  "id": "string (stable, e.g. 'biz-001')",
  "word": "string",
  "meaning": "string (English; Thai gloss optional in parentheses)",
  "example": "string (one natural sentence using the word)",
  "tag": "business | legal | ai-tech | genshin-lore | identityv-skill | valorant | osu | vtuber-slang | cross-domain | reddit-slang",
  "source": "string (where it appears, optional)",
  "srs": { "interval": 0, "repetition": 0, "easeFactor": 2.5, "dueDate": null }
}
```

## clauses.json
Array of standard clauses.
```json
{
  "id": "string",
  "type": "NDA | payment | termination | indemnification | governing-law | SLA | DPA",
  "title": "string",
  "text": "string (the clause language, English)",
  "explanation_th": "string (plain Thai explanation, allowed here)",
  "obligations": ["string (shall/must items)"],
  "rights": ["string (may items)"],
  "watch_terms": ["string (risky/ambiguous words to flag)"]
}
```

## grammar.json
Array of reference sections.
```json
{
  "id": "string",
  "topic": "conditionals | modals | passive | relative-clauses | cross-domain-words | legal-connectors",
  "summary": "string",
  "points": ["string"],
  "examples": [{ "en": "string", "note": "string (context: business/contract)" }]
}
```

## rubrics.json
Array of rubrics keyed by writing type.
```json
{
  "id": "string",
  "writingType": "summary | email | clause",
  "items": [{ "id": "string", "check": "string (yes/no self-question)", "category": "grammar | register | structure | vocab" }]
}
```

## errors.json
Array of common Thai-learner errors.
```json
{
  "id": "string",
  "category": "articles | plurals | tense | preposition | word-order | subject-verb",
  "wrong": "string",
  "right": "string",
  "note_th": "string (why, in Thai)"
}
```

## external-links.json
Link templates. `{q}` is replaced with the URL-encoded query.
```json
{
  "dictionaries": [
    { "name": "Cambridge", "url": "https://dictionary.cambridge.org/dictionary/english/{q}" },
    { "name": "Merriam-Webster", "url": "https://www.merriam-webster.com/dictionary/{q}" },
    { "name": "Longman", "url": "https://www.ldoceonline.com/dictionary/{q}" }
  ],
  "grammarTools": [
    { "name": "LanguageTool", "url": "https://languagetool.org/" },
    { "name": "Grammarly", "url": "https://app.grammarly.com/" }
  ],
  "contracts": [
    { "name": "SEC EDGAR full-text search", "url": "https://efts.sec.gov/LATEST/search-index?q={q}" }
  ]
}
```

## immersion-sources.json
Array of immersion channels/communities.
```json
{
  "id": "string",
  "name": "string",
  "kind": "vtuber | game | esports | reddit",
  "url": "string",
  "note": "string (style/accent or content note)"
}
```
