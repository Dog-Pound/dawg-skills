# Implementation Standards

Language-neutral code quality. Stack references add mechanics; repository conventions decide syntax and placement.

## Names and contracts

Names, types, and signatures expose the contract without implementation lookup.

- Name values for their domain role: `invoice_rows`, not `data`; `retry_deadline`, not `timeout` when the distinction matters.
- Type public inputs, outputs, and models in typed languages.
- Narrow untyped escape hatches at their boundary and state the external reason when one remains.
- Use domain types when primitives have different rules or units.
- Mark public and private surfaces with the language's native mechanism.
- Keep one stable public import path per symbol.

Short local names are appropriate when a small scope supplies their meaning.

## Functions and control flow

A function represents one coherent operation at one abstraction level. Split when independent reasons to change, failure policies, or effects are tangled.

- Use guards and named operations when they clarify the main path.
- Choose the clearest native control flow: exhaustive match, short conditional, polymorphism, or dispatch table.
- Pair resource and transaction lifecycles structurally with their cleanup.
- Keep helpers beside the state or operation they serve.

Self-documenting names, types, and control flow carry the explanation. Comments preserve non-obvious constraints, tradeoffs, protocol quirks, and measured reasons.

## Documentation

Public documentation records contract details signatures cannot express: invariants, effects, ordering, errors, performance, or threading behavior.

Persistent architecture documentation lives in ADRs. A repository with domain language may keep a concise `CONTEXT.md` glossary. README remains human-facing and thin: purpose, setup or run commands, and essential links. Product-required artifacts use their product-defined location; working plans, research notes, handoffs, and duplicate architecture explanations stay outside the repository.

Track future work in the repository's issue system. A permitted TODO includes enough ownership or locator context to be actionable.

Load [Punchy](../../punchy/SKILL.md) for comments, documentation, specifications, commit messages, and reports.

## Verification

Verify behavior at the narrowest meaningful public seam, then broaden in proportion to blast radius. Cover important failures, effects, and boundary serialization; compilation alone is insufficient.

Evidence replaces confidence.
