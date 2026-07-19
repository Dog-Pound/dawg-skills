# Hypothesis Standards

Repository versions, profiles, and test layout remain authoritative; guidance alone does not add Hypothesis or a plugin.

## Properties and strategies

Start from a domain contract: invariants, round trips, monotonicity, equivalence, normalization, idempotency, or valid state transitions. A property must be capable of falsifying a plausible broken implementation; restating the implementation adds no evidence.

Build strategies from domain-valid values and compose them at the same boundaries as the domain model. Generate invalid values deliberately for rejection contracts. Prefer built-in and compositional strategies; register a custom strategy only when repeated domain meaning earns one.

## Shrinking and replay

Preserve simple data and transparent assertions so Hypothesis can shrink to a minimal counterexample. Map values into valid shapes only when direct generation cannot express the contract.

Treat excessive filtering and health-check failures as strategy-design feedback. Generate valid data directly, reduce oversized examples, or isolate the slow boundary. Suppress a health check only for an understood, documented constraint that cannot be designed away.

Keep the failing example reproducible through Hypothesis's example database and reported seed or reproduction blob. Commit a deterministic regression example when it communicates the defect more clearly or protects it without relying on local database state.

## Stateful testing

Use rule-based state machines when failures emerge from operation sequences. Define operations at public seams, preconditions from valid domain states, and invariants over observable outcomes. Model idempotency, ordering, retries, and invalid transitions when those are material risks.

Keep the model simpler than the system under test and reset owned state between runs. Preserve Hypothesis's minimized failing operation trace as the primary diagnostic; add a fixed regression only when it improves durable intent.
