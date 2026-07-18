# Common Code Standards

Language-neutral baseline. Stack overlays add mechanics; repository patterns decide concrete placement.

## Start from the owner

Trace the requested behavior through its callers, data boundaries, and effects. Search for the module that already owns the relevant invariant or dependencies. Extend that owner when it keeps the interface coherent; create a boundary only when the existing owner cannot hide the new complexity cleanly.

Plans, tickets, and workflow stages describe intent. They do not automatically justify matching files, classes, services, or layers.

## Names and contracts

Names, types, and signatures should expose the contract without requiring implementation lookup.

- Name values for their domain role: `invoice_rows`, not `data`; `retry_deadline`, not `timeout` when the distinction matters.
- Type public inputs, outputs, and model fields in typed languages. Keep escape hatches at the untyped boundary and explain why they are necessary.
- Use domain types when primitive values have different rules or units.
- Mark the public/internal boundary with the language's normal mechanism.
- Keep one stable public import path per symbol. Re-export through an intentional package API or import from the owning module, not both.

Short local names are fine when their meaning is obvious from a small scope. Do not inflate names to repeat context the module already supplies.

## Functions and control flow

A function should represent one coherent operation at one level of abstraction. Split it when independent reasons to change, failure policies, or effects are tangled—not to satisfy a line-count rule.

- Prefer guards and extracted named operations when they make the main path easier to scan.
- Use the language's clearest native control flow. An exhaustive match, a short conditional, polymorphism, or a dispatch table can each be right.
- Keep resource and transaction lifecycles structurally paired with context managers, scoped callbacks, or equivalent constructs when the language supports them.
- Put helpers with the state or operation they serve. A private method, module-private function, or small local function is chosen by repository idiom and ownership, not dogma.

Comments do not compensate for tangled control flow. Make the code legible first.

## Deep modules

A deep module exposes a small, stable interface while hiding meaningful policy, data structure, integration, or lifecycle complexity. Depth is a value-to-interface ratio, not a request for large files or speculative behavior.

Prefer boundaries that:

- hide volatile decisions from callers;
- make the common case simple;
- prevent invalid or dangerous call sequences;
- keep invariants beside the state and behavior that enforce them;
- translate infrastructure details into domain-level outcomes; and
- let an implementation change without rewriting callers.

Avoid shallow wrappers that merely rename another API, one-caller abstractions that add navigation without hiding complexity, and pass-through layers created only to match an architecture diagram.

Keep cohesive internals together until independent ownership, reuse, deployment, or change cadence earns a split. A deep module may be one function, one file, or a package; directory depth is not module depth.

## Ownership and dependencies

Things that change together should have one owner. Shared-looking code stays separate when its rules or owners can diverge; repeated logic with one authority should be centralized before it drifts.

- Depend on narrow public contracts, not another module's internals.
- Introduce an interface when multiple implementations, a volatile external boundary, or an important test seam earns it.
- Keep dependency wiring and lifecycle registration in the repository's composition root.
- Avoid service locators and hidden mutable globals. Pass dependencies explicitly using the stack's established injection style.
- Keep constants, query keys, schemas, and configuration with the domain or boundary that owns their meaning. Promote them to shared infrastructure only after ownership is genuinely shared.

Circular dependencies usually reveal misplaced ownership. Resolve the ownership problem before adding indirection solely to break the cycle.

## Data and boundaries

Validate untrusted input once at the boundary and convert it into typed internal data. Raw maps are acceptable at wire and storage edges; do not let unvalidated, shape-implicit data spread across modules.

Model outcomes separately when callers act differently—for example:

- success;
- invalid input;
- valid request with no result;
- internal invariant failure; and
- external dependency failure.

Do not collapse expected absence into an exception or hide operational failure as an empty result. Preserve the original cause and add actionable context when translating errors across a boundary.

## Effects and retry safety

Make externally visible effects explicit. Before automatic retry, use the mechanism appropriate to the boundary: idempotency keys, uniqueness constraints, transactions, leases, deduplication, or reconciliation.

- Define who owns commit, rollback, cleanup, and cancellation.
- Keep state transitions explicit and reject invalid transitions.
- Make partial failure observable and recoverable.
- Do not hold database transactions or locks across slow network calls unless correctness requires it and the trade-off is documented.
- Separate pure decision logic from effects when doing so makes correctness easier to test or reason about.

## Concurrency and async work

Concurrency must have a correctness contract, not timing assumptions.

- Identify shared state and its owner.
- Bound parallelism and queues.
- Propagate cancellation and deadlines.
- Define ordering and duplicate-delivery semantics.
- Make background work durable when losing the process would otherwise lose an accepted obligation.

Use sequential execution when it is simpler and meets the latency or throughput requirement.

## Comments and documentation

Code explains what; comments preserve non-obvious why: constraints, trade-offs, protocol quirks, or measured reasons. Delete narration, stale history, review context, and comments that merely restate the code.

Public documentation should record contract details the signature cannot express, such as invariants, side effects, ordering, errors, performance, or threading behavior. Keep it as short as the contract allows; there is no universal line limit.

Track future work in the repository's normal issue system. A TODO is acceptable only when the repository permits it and it includes enough ownership or locator context to be actionable.

Load [Punchy](../../punchy/SKILL.md) when producing comments, documentation, specifications, commit messages, or reports.

## Minimum complexity

Among correct designs, choose the one a new maintainer can understand and change with the fewest concepts and moving parts. Complexity is earned by a concrete requirement, failure mode, or measured constraint.

Avoid:

- speculative extension points and configuration;
- generic frameworks for one concrete case;
- duplicated caches or sources of truth;
- convenience wrappers that obscure the underlying contract;
- drive-by restructuring outside the request boundary; and
- new dependencies when the platform or existing stack already solves the problem adequately.

Do not minimize the diff by weakening correctness, tests, types, observability, or recovery. Apply the full [minimal execution audit](minimal-execution.md) to nontrivial placement choices and new modules.

## Verification

Verify behavior at the narrowest meaningful public seam, then broaden checks in proportion to blast radius. A change is not complete because it compiles: important failure paths, effects, and boundary serialization must also match the contract.

Report checks that failed or could not run. Never silently replace verification with confidence.
