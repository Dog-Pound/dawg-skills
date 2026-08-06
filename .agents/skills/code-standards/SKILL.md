---
name: code-standards
description: Code standards for every code task. Use for writing, fixing, refactoring, designing, reviewing, or testing code; compose the architecture and implementation invariants with every matching technology reference. Running checks alone uses repository tooling.
---

# Code Standards

Cross-cutting quality baseline. Repository, language, framework, and domain instructions own their mechanics and override this skill on concrete conflict.

Load [Ponytail](../ponytail/SKILL.md) for minimum-complexity discipline on every code task.

## Load references additively

Load every matching row completely before performing that branch. Rows accumulate.

| Condition | Authority |
|---|---|
| Every code task | [architecture.md](references/architecture.md) and [implementation.md](references/implementation.md) |
| Authorized code change or explicit file/module-placement review | [filesystem.md](references/filesystem.md) |
| Behavioral change, test selection, or test changes | [testing.md](references/testing.md) |
| Python | [python.md](references/python.md) |
| Pytest | [testing.md](references/testing.md) and [pytest.md](references/pytest.md) |
| Hypothesis present or explicitly requested | [testing.md](references/testing.md), [python.md](references/python.md), and [hypothesis.md](references/hypothesis.md) |
| Pydantic or pydantic-settings | [pydantic.md](references/pydantic.md) |
| FastAPI | [python.md](references/python.md), [pydantic.md](references/pydantic.md), and [fastapi.md](references/fastapi.md) |
| FastAPI tests | [testing.md](references/testing.md) and [fastapi-testing.md](references/fastapi-testing.md) |
| TypeScript | [typescript.md](references/typescript.md) |
| React | [react.md](references/react.md) |
| React tests | [testing.md](references/testing.md) and [react-testing.md](references/react-testing.md) |
| TanStack React Query | [react.md](references/react.md) and [tanstack-react-query.md](references/tanstack-react-query.md) |
| TanStack React Query tests | [testing.md](references/testing.md) and [tanstack-react-query-testing.md](references/tanstack-react-query-testing.md) |
| Responsive Tailwind UI | [tailwind-responsive.md](references/tailwind-responsive.md) |

## Execution loop

Run the full loop for nontrivial authorized code changes. Collapse trivial changes without skipping an applicable gate. Design and review tasks apply the loaded standards to their requested artifact and stop at that task boundary.

1. **Trace the work.** Read the issue or specification and trace current behavior end to end through callers, boundaries, effects, and affected files. Inspect nearby code for reusable owners and patterns. Done when the real change surface, current behavior, and unresolved decisions are explicit.
2. **Decide before code.** Resolve material decisions against repository evidence and state the smallest coherent design, ticket boundary, preserved behavior, and explicit non-goals. Classify one-way and two-way doors; resolve reversible choices simply. A non-empty consequential decision frontier stops here for the repository's required grill route. Done when every material choice is settled or returned to the user.
3. **Plan a production tracer.** Define the smallest production-shaped vertical slice, its owning deep modules, public contracts, outcomes, effects, acceptance criteria, filesystem contract, and proof seams. Done when every acceptance criterion maps to affected files and verification.
4. **Implement the tracer.** Stay inside the ticket and slice. Reuse repository patterns and introduce only earned abstractions. Done when every acceptance criterion has implementation and the actual file set is accounted for.
5. **Run focused checks.** Execute the narrowest meaningful checks for the changed behavior and reconcile failures before broad validation. Done when the slice's planned proof passes or a blocker is explicit.
6. **Pass the maintainability gate.** Review the changed files and diff as prose, independent of formatter and linter success. Block mixed responsibilities, giant functions or files, ambiguous boundary names, compressed control flow, weak whitespace, unclear ownership, and speculative abstractions. Done when each finding is fixed or has explicit ticket-backed justification.
7. **Run required validation.** Execute the full repository-required suite and CI-equivalent checks in proportion to blast radius. Done when they pass or every skipped or failed check is reported.
8. **Audit the final diff.** Reconcile it against ticket scope, preserved behavior, architecture, readability, naming, filesystem placement, test placement, and discrimination evidence. Remove unrelated cleanup. Done when every hunk and retained test proves the ticket or an explicit compatibility obligation.
9. **Publish last.** Commit, push, open a PR, or mark it ready only after the preceding gates pass. Done when the published change and its review map, when required, match the audited diff.
