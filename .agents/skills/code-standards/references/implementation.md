# Implementation Standards

Language-neutral code quality. Stack references add mechanics; repository conventions decide syntax and placement.

## Well-written prose

Code reads like well-written prose: the module supplies context, the class is the subject, methods are actions on that subject, functions name transformations or outcomes over their inputs, and whitespace separates logical phases.

## Names and contracts

Names, types, and signatures expose the contract without implementation lookup.

- Name values for their domain role: `invoice_rows`, not `data`; `retry_deadline`, not `timeout` when the distinction matters.
- Type public inputs, outputs, and models in typed languages.
- Narrow untyped escape hatches at their boundary and state the external reason when one remains.
- Use domain types when primitives have different rules or units.
- Mark public and private surfaces with the language's native mechanism.
- Keep one stable public import path per symbol.
- Let the package path supply context. Inside `api/handlers/`, prefer `user.py` to `user_handler.py`; keep exported class names explicit where they travel without that path.
- Name methods so `receiver.action(...)` states the behavior without reading the body.

Short local names are appropriate when a small scope supplies their meaning.

## Functions and control flow

A function represents one coherent paragraph: one purpose at one abstraction level, with enough substance to hide meaningful behavior. Split when independent owners, reasons to change, failure policies, or effects are tangled. Keep a short operation inline when extracting it would only rename obvious statements.

- Use guards and named operations when they clarify the main path.
- Choose the clearest native control flow: exhaustive match, short conditional, polymorphism, or dispatch table.
- Pair resource and transaction lifecycles structurally with their cleanup.
- Keep helpers beside the state or operation they serve.
- Separate logical phases with whitespace. Extract or guard when nesting hides the main path or mixes responsibilities; do not impose a language-neutral depth number.

Trace a defect through every caller to the owner of the broken invariant. Fix the root cause once at that owner and verify sibling callers rather than patching the reported symptom alone.

Self-documenting names, types, and control flow carry the explanation. Comments preserve non-obvious constraints, tradeoffs, protocol quirks, and measured reasons.

## Documentation

Code must remain as understandable with every docstring removed. Keep a docstring to one line normally and two lines maximum when a public contract needs information the signature cannot express. Comments explain non-obvious reasons, constraints, protocol quirks, and measured tradeoffs; they do not narrate behavior.

Persistent architecture documentation lives in ADRs. A repository with domain language may keep a concise `CONTEXT.md` glossary. README remains human-facing and thin: purpose, setup or run commands, and essential links. Product-required artifacts use their product-defined location; working plans, research notes, handoffs, and duplicate architecture explanations stay outside the repository.

Track future work in the repository's issue system. A permitted TODO includes enough ownership or locator context to be actionable.

Load [Punchy](../../punchy/SKILL.md) for comments, documentation, specifications, commit messages, and reports.

## Branches and review units

One branch and PR deliver one atomic feature, fix, chore, refactor, documentation change, or test change. Follow repository branch conventions; otherwise use an accurate conventional prefix such as `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, or `test/`.

Count every human-authored addition and deletion, including tests, configuration, migrations, and documentation. Target at most 600 changed lines. More than 1,000 requires evidence that the atomic change cannot be split safely, explicit PR rationale, and a reviewer-approved review strategy. Generated output does not count.

## Verification

Verify behavior at the narrowest meaningful public seam, then broaden in proportion to blast radius. Cover important failures, effects, and boundary serialization; compilation alone is insufficient.

Evidence replaces confidence.
