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

Run the loop for authorized code changes. Design and review tasks apply the loaded standards to their requested artifact and stop at that task boundary.

1. **Orient within the headlights.** Establish the desired outcome, current behavior, core entities, owners, deep modules, repository patterns, ADRs, callers, boundaries, effects, constraints, and affected files. Separate facts from unresolved decisions. Done when the real change surface and decision frontier are explicit.
2. **Decide before code.** Resolve every material decision against repository evidence. Explicit user decisions, accepted ADRs, and requirements with one valid interpretation are settled; a contradiction reopens only the affected branch. A ticket or specification supplies requirements; it does not prove that domain language, contracts, ownership, lifecycle, architecture, or consequential tradeoffs are settled. Apply domain fit, authority, ownership, lifecycle, then reason to change. Apply governing patterns and ADRs. Classify each material decision as a one-way or two-way door. Present no more than three genuine options with applicable pros and cons, a recommendation, why it wins, and why the decision belongs now. Resolve reversible choices simply when delay adds no value. A non-empty frontier stops here for the repository's required grill route; Plan begins after the user confirms shared understanding. Done when every material choice is resolved or explicitly returned to the user.
3. **Plan a production tracer.** Write a compact informal plan in the conversation; platform Plan mode and persistent plan documents are not required. Define the smallest production-shaped vertical slice that proves the decision. Declare its behavior, owning deep modules, public contracts, outcomes, effects, causal proof, acceptance criteria, and filesystem contract. Map every acceptance criterion to its governing decision, affected files, and verification seam. Include a representative contract, data shape, or control-flow sketch only when it makes a decision concrete. Done when every behavior, seam, outcome, effect, proof, acceptance criterion, and affected file is declared.
4. **Implement through deep modules.** Stay inside the tracer. Keep core entities first-class and discoverable, interfaces small, behavior hidden with its owner, and code self-documenting. Reuse repository patterns; introduce a new pattern only when the decision earned it. Done when every acceptance criterion has a corresponding implementation and the actual file set is accounted for.
5. **Verify the decision.** Execute the planned proof and reconcile every loaded rule against the implementation. Report only the tracer, proof, consequential decisions, and failed or skipped verification. Done when every acceptance criterion has evidence and every loaded rule is satisfied or has an explicit exception.
