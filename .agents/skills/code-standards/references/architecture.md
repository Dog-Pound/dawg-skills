# Architecture Standards

Language-neutral invariants. Repository ADRs decide concrete topology and mechanics.

## Core entities and owners

Trace behavior through its callers, data boundaries, and effects to the module that owns the relevant invariant or dependencies. Extend that owner while it can keep a coherent interface; create a boundary when the existing owner can no longer hide the complexity cleanly.

Make core domain entities and their owners first-class and discoverable high enough in the repository tree to reveal the system's shape. Plans, tickets, workflow stages, and universal standards do not prescribe matching folders, classes, services, or layers.

## Deep modules

A deep module exposes a small, stable interface while hiding meaningful policy, data structure, integration, or lifecycle complexity. Depth is value-to-interface ratio, not directory depth, file length, or speculative behavior.

Prefer boundaries that:

- hide volatile decisions from callers;
- make the common case simple;
- prevent invalid or dangerous call sequences;
- keep invariants beside their state and behavior;
- translate infrastructure details into domain outcomes; and
- let implementations change without rewriting callers.

Keep cohesive internals together until independent ownership, reuse, deployment, or change cadence earns a split.

Shallow wrappers, pass-through layers, and one-caller abstractions add navigation without hiding complexity. Deepen the existing owner or keep the behavior inline.

## Ownership and dependencies

Things that change together have one owner. Repeated logic with one authority is centralized before it drifts; similar code with independently changing rules stays separate.

- Depend on narrow public contracts rather than another module's internals.
- Introduce an interface for multiple implementations, a volatile external boundary, or a meaningful test seam.
- Keep dependency wiring and lifecycle registration in the composition root.
- Pass dependencies explicitly through the repository's established injection style; keep mutable state with an explicit owner.
- Keep constants, schemas, query keys, and configuration with the owner of their meaning.

Circular dependencies usually reveal misplaced ownership. Resolve ownership before adding indirection solely to break the cycle.

## Design defaults

Default to objects and classes for domain behavior. Prefer composition to inheritance. Use functions for pure local transformations.

Use established patterns when their responsibilities exist:

- A Registry owns explicit registration, duplicate validation, stable-key lookup, and unknown-key failure across multiple implementations. Construct it at the composition root.
- A DAO is the persistence boundary and owns persistence operations and storage translation. Another persistence abstraction requires distinct authority or behavior.
- A DTO carries validated boundary data without business behavior.

Patterns are earned responsibilities, not mandatory layers. One implementation uses its concrete type; one lookup uses direct selection.

## Boundaries and outcomes

Validate untrusted input once at the boundary and convert it into typed internal data. Raw maps stay at wire and storage edges.

Model outcomes separately when callers act differently:

- success;
- unfulfilled outcome;
- invalid input;
- internal failure; and
- external failure.

Expected absence is an outcome, and operational failure stays a failure. Preserve the original cause and add actionable context when translating errors.

## Effects and concurrency

Make visible effects explicit. Retried effects use idempotency keys, uniqueness constraints, transactions, leases, deduplication, reconciliation, or an explicitly non-retrying policy.

- Define ownership of commit, rollback, cleanup, and cancellation.
- Keep state transitions explicit and reject invalid transitions.
- Make partial failure observable and recoverable.
- Keep slow network calls outside database transactions and locks unless correctness requires otherwise.
- Separate pure decisions from effects when that makes correctness easier to test or reason about.
- Identify shared state, bound parallelism and queues, propagate cancellation and deadlines, and define ordering and duplicate-delivery semantics.
- Make accepted background obligations durable when process loss would otherwise discard them.

Sequential execution is the default when it meets the required latency and throughput.

## Architecture decisions

Record a foundational ADR when a repository first establishes or materially changes its core entities, topology, or dependency direction. Accepted ADRs are invariants; an implementation that contradicts or materially extends one updates or supersedes it in the same PR.
