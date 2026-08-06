---
name: punchy
description: Punchy writing discipline for every prose artifact. Use for documentation, comments, plans, reports, PR or commit messages, and user-facing explanations; compose with the primary task skill.
---

# Punchy

Every word earns its slot. Keep content that changes what a human or downstream agent will do or think; cut the rest.

## Classify

- **Human signal** — needed for the reader's next decision or action. Keep visible.
- **AI signal** — evidence, rationale, sources, or confidence that changes a downstream agent's action. Collapse when the surface supports it; otherwise place it after human signal.
- **Fluff** — updates nobody's state. Cut.

Extract signal from a noisy sentence before deleting it. Delete pure praise, pleasantries, self-narration, softening apologies, throat-clearing, and context the artifact already supplies.

| Before | After |
|---|---|
| “I checked the config and confirmed that the timeout is set to 30s as expected.” | “Verified: timeout = 30s in `config.yml`.” |
| “I think we should bump retries from 3 to 5 because cold starts take about 4 seconds.” | “Bump retries 3 → 5 (cold starts take ~4s).” |
| “I'm not certain, but this may affect staging too.” | “[low-confidence] Likely affects staging.” |

Keep confidence qualifiers only when they change the reader's response.

## Keep

- Action, owner, and deadline when known.
- Locator with enough context to decide whether to follow it.
- Severity or priority.
- Reproduction steps and concrete evidence.
- Decision-driving trade-offs.
- Low-confidence flags.
- Verification results whose value changes future action.

## Write

- Lead with the finding or outcome.
- Use active voice and one idea per bullet.
- Sort by severity or actionability.
- Use a table for comparisons with more than two rows or axes.
- Keep technical terms, errors, proper nouns, library names, and flags exact.
- Prefer the shortest wording that preserves meaning and register.
- Use `X → Y` when it makes causality clearer.
- Preserve code blocks verbatim.

Punchy means high signal, not minimum length.

## Audit before shipping

Run every sentence, bullet, and table row through all three tests:

1. **Action** — does it change what the next reader does or thinks? If not, cut it.
2. **Comprehension** — can the reader act or decide whether to investigate without opening a bare locator? If not, add the missing context.
3. **Reader** — is it human signal or downstream-agent signal? Place it accordingly.

The audit is complete when every retained unit passes all three tests.

When the surface supports collapsed content:

```markdown
<details>
<summary>Rationale / evidence</summary>

Evidence a downstream agent would act on.

</details>
```

Verification rule: `ran X, got Y` stays only when Y changes future action. Cut skill-loading narration and counts that only prove no finding.

## Scope

Punchy governs signal density. Consuming skills own finding schemas, severity vocabularies, platform layout, and artifact structure.
