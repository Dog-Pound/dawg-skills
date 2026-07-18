# Minimal Execution

Every line in the diff earns its slot. Sister discipline to [Punchy](../../punchy/SKILL.md) for words and [minimum complexity](common.md#minimum-complexity) for design choices.

## Priority

1. **Correct** — acceptance criteria, edge cases, and regressions covered.
2. **No new debt** — no TODO hacks, suppressed lints, duplicate patterns, or speculative abstractions.
3. **Smallest surface** — fewest files, lines, and hunks that satisfy 1 and 2.

## Audit

Use this table when a change introduces a module or has a nontrivial placement choice:

| Test | Question |
|---|---|
| Necessity | Does this hunk solve the requested problem? |
| Completeness | Would removing it break correctness? |
| Debt | Does it create future obligation? |
| Smaller | Is there an equivalent fix with fewer moving parts? |
| Stage alignment | Does a new file match an existing stage or layer? Could it live in the owning module? |

Cut hunks that fail **Necessity** or **Smaller**. Keep hunks required by **Completeness**.

## Failure patterns

| Pattern | Failure |
|---|---|
| Symptom patch | Root cause remains. |
| Drive-by refactor | Outside the request boundary. |
| One-caller abstraction | Adds debt and moving parts. |
| Incomplete minimal | Sacrifices correctness. |
| Deleting coverage to shrink the diff | Sacrifices completeness. |

## Plan names are not modules

Plans describe intent, not file or class names. Search for the existing owner with the same stores, routes, handlers, or dependencies. Compare extending it with handler-inline logic and a new module. Extend the owner unless correctness requires a new boundary.

Every new file needs a one-line **Smaller** justification such as “three callers share read and write.” Labels such as “admin operations” or “clean separation” do not justify a file.
