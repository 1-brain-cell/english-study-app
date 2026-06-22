# SOURCES.md — Seed Data References

How the seed content was built and where to verify or expand it. The shipped app uses none of these at runtime; they are provenance for the curated data.

## Vocabulary (vocab.json)
- Business/finance/legal terms: standard business-English and contract usage. Verify definitions against Cambridge Dictionary, Merriam-Webster, Longman (URLs in external-links.json).
- AI/Tech terms: common ML/MLOps vocabulary (inference, fine-tuning, embedding, throughput, overfitting, pipeline). Cross-check with model-provider docs (OpenAI, Anthropic, Google Cloud) and arXiv abstracts.
- Game terms: drawn from each game's own English client and community usage — Genshin Impact (vision, ascension, archon), Identity V (decode, cipher, kite, tunnel), Valorant/VCT casts (rotate, clutch), osu! (FC, pp, acc).
- Slang: common Reddit/internet abbreviations (ngl, lowkey, cope) and VTuber-community usage (unhinged, comfy).

## Contract clauses (clauses.json)
- Clause structures follow standard commercial contract drafting conventions (confidentiality, payment, termination for cause, indemnification, governing law, SLA, DPA).
- Reference text: *Legal English* by Rupert Haigh (book in curriculum), and real public filings on SEC EDGAR full-text search (https://efts.sec.gov). For DPA language, the structure reflects common GDPR/PDPA processor obligations.
- These are illustrative teaching samples, not legal advice. For real drafting, compare against actual executed agreements on EDGAR and consult a lawyer.

## Grammar (grammar.json)
- Modal verb legal meanings (shall/may/must) follow standard legal-drafting guidance (the "shall vs must" debate is well documented in plain-language legal writing).
- Conditionals, passive, relative clauses: standard ESL/business-English grammar.

## Common errors (errors.json)
- Typical L1-Thai → English interference patterns: missing articles (Thai has none), unmarked plurals, tense (Thai marks time lexically not morphologically), subject-verb agreement, preposition collocations, indirect-question word order. Cross-check with ESL teaching references.

## Immersion sources (immersion-sources.json)
- **Niyeko**: confirmed Filipino EN VTuber, "Ice Mage / Party Leader" persona, chaotic high-energy style, ~117K Twitch followers, streams on twitch.tv/niyeko (verified June 2026).
- **Azeru**: EN VTuber known for a calmer, deeper voice-actor/ASMR-leaning delivery. The deliberate accent/pacing contrast with Niyeko is the pedagogical point. Verify the current channel link before relying on it (the YouTube search URL is used as a stable fallback).
- Game and subreddit URLs are official sites / official subreddits as of June 2026. Re-verify links periodically; URLs drift.

## Note on expansion
vocab.json ships ~40 cards as a representative starter across all tags. The curriculum targets 400 words. Expand by adding cards in the same schema (DATA_SCHEMA.md). If you use an external model to draft additions, do it as a one-time authoring step and commit the JSON — the app itself must stay AI-free at runtime.
