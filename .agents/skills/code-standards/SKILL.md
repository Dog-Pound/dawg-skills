---
name: code-standards
description: Code standards for every code task. Use for writing, fixing, refactoring, designing, reviewing, or testing code; load matching Python/FastAPI or React/TypeScript/Tailwind/TanStack Query references and compose with Ponytail. Running checks alone uses repository tooling.
---

# Code Standards

Cross-cutting quality baseline. Repository, language, framework, and domain instructions own their mechanics and override this skill on concrete conflict.

Load [Ponytail](../../ponytail/SKILL.md) for minimum-complexity discipline on every code task.

## Load the matching references

| Task | Load completely before inspecting code |
|---|---|
| Any code | [common.md](references/common.md) |
| Any tests | [testing.md](references/testing.md) |
| Python | [common.md](references/common.md) + [python.md](references/python.md) |
| FastAPI | [common.md](references/common.md) + [python.md](references/python.md) + [fastapi.md](references/fastapi.md) |
| React/TypeScript | [common.md](references/common.md) + [react-typescript.md](references/react-typescript.md) |
| Responsive Tailwind UI | [common.md](references/common.md) + [react-typescript.md](references/react-typescript.md) + [responsive-components.md](references/responsive-components.md) |
| TanStack Query | [common.md](references/common.md) + [react-typescript.md](references/react-typescript.md) + [tanstack-query.md](references/tanstack-query.md) |

Test work also loads [testing.md](references/testing.md); then add every matching language/framework reference above. Loading is complete only when every reference for the task is in context.

## Steps

1. Trace the requested behavior through every caller and boundary it touches. Locate the existing owner and established repository pattern. Done when the root change surface is named.
2. Choose the smallest root-cause change within that surface. For a new module or nontrivial placement choice, compare 2–3 placements and audit the final diff with [minimal execution](references/minimal-execution.md). Done when the chosen placement passes every applicable audit test.
3. Implement only the requested behavior. Done when the acceptance criteria and relevant edge cases are covered without drive-by edits.
4. Verify with the smallest relevant tests, linters, and type checks available in the repository. Done when checks pass or every unverified item and failure is reported.
