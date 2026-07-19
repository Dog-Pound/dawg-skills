# Testing Standards

Language-neutral test-design authority. Workflow skills own process; language and framework overlays own runner syntax, markers, directories, and boundary-specific fixtures.

## Model material risk

Choose tests against a named failure risk:

- **Impact** — what users, data, money, security, or operations lose if it occurs.
- **Plausibility** — how likely the implementation, integration, or environment is to produce it.
- **Detection gap** — how likely existing checks and observability are to miss it before harm.

Prioritize risks high on these dimensions. A green suite is evidence against the modeled risks, not proof of total reliability. Record material residual risk when faithful proof is unavailable or deliberately deferred.

## Choose the seam by failure mode

| Proof level | Scope | Proves |
|---|---|---|
| Unit | One public module contract with controlled inputs | Local behavior and edge cases |
| Integration | Crosses one or more real in-process or infrastructure boundaries | Components are wired and exchange the right data |
| E2E | Full deployed stack, browser, or live system boundary | A critical user journey works in its real shape |

Unit, integration, and E2E are the proof levels. Regression names a test's purpose; smoke names a fast subset. Evals are a separate discipline for probabilistic quality.

Use the cheapest seam that fails for the risk under test with enough production fidelity. Crossing two internal modules is integration even when it runs quickly; exercising an HTTP-shaped function in memory is not automatically E2E.

Optimize for confidence per test, not test count or coverage percentage. Add the smallest set that distinguishes consequential behaviors, boundaries, and failure modes; remove tests that duplicate the same evidence.

Before adding a test, name the behavior, observable seam, and failure it should catch. The test belongs at that seam when a plausible broken implementation fails it and lower-level coverage cannot prove the same contract more cheaply.

## Environment ownership

A hermetic test owns or controls every input and dependency needed for repeatable execution. An external-dependent test names the service, environment, data, credentials, availability, cleanup, and failure owner it relies on. Accidental network, clock, process, filesystem, locale, environment-variable, or shared-state dependence is a defect.

Substitutes prove behavior shared by their enforced contract; they do not prove production wiring, configuration, permissions, protocol quirks, quotas, or vendor compatibility. A production-specific risk requires the production implementation or the provider's official test environment.

For each material third-party boundary, select risk-appropriate evidence:

- hermetic tests for owned outcomes such as request construction, response translation, retries, and failure handling;
- external compatibility tests for the real protocol and current provider behavior; and
- E2E for critical journeys whose risk survives lower seams.

Select only layers justified by the risk.

## Arrange, act, compare

Make expected values independent from the output under test.

```text
input = controlledInput()
expected = ExpectedResult(...)

actual = publicEntrypoint(input)

verify actual == expected
```

Derive expected values from the contract or controlled dependency input—not by rereading the implementation's source or copying fields from `actual`.

Prefer whole-value equality when the full result is deterministic and meaningful.

One behavior—not one assertion—is the unit of a test. For a unit test, that means one input/output contract, not one field. Prefer a direct `result == expected` comparison. When the behavior has several observations, compare one transparent tuple, record, DTO, map, or existing result object; keep assertions visible in the test.

An integration test proves behavior across a critical seam. Use multiple assertions when response, persisted state, emitted effects, or other observations jointly prove that behavior; otherwise prefer one structured comparison.

Use the strongest meaningful assertion:

- exact values for deterministic output;
- typed error plus stable message/code when failure is the contract;
- structural or bounded assertions only for genuinely nondeterministic output; and
- a golden file for large third-party-generated output where the complete diff is the review surface.

Inject clocks, random generators, and ID factories when their values are part of the behavior. When injection adds more design cost than signal, assert the stable contract around the nondeterministic field.

## Behavioral tests

Consolidate related fields into one expected structure; split unrelated outcomes. An integration behavior may span every observable facet of the selected seam.

```text
test("report summarizes statuses and totals") {
  expected = { statuses: [ACTIVE, PENDING], total: 42 }
  actual = summarize(rows)
  verify actual == expected
}
```

Name tests after behavior and conditions, not internal method calls. A refactor that preserves the public contract should not force test renames.

## Public contracts

Exercise public functions, methods, routes, events, rendered behavior, or outbound effects. Private helpers are implementation; reach them through the owning public contract unless the helper has become a real module boundary.

Avoid implementation mirrors: call-order assertions, private names, or mock counts are valid only when ordering or cardinality is itself an externally visible contract.

## Test doubles

| Double | Use |
|---|---|
| Stub/fake | Supply controlled data or a deterministic in-memory boundary |
| Mock/recorder | Observe an outbound effect that has no cheaper public observation |

Replace dependencies at the narrowest owned boundary. Keep one real boundary per integration test when possible so failures identify the broken contract.

For outbound effects such as email or HTTP, assert the recorded request or resulting state. Assert call count only when duplicate delivery is a product failure.

## Table-driven tests

When arrange/act/compare repeats with only inputs and expected outputs changing, use the runner's parameterized/table form. Each row remains one named behavior; the body remains one contract.

## Shared setup

Keep setup local while one test owns it. Promote factories, builders, and fixtures to the nearest shared test owner after a second use. Shared setup exposes intent through domain names and returns fresh mutable state per test.

Prefer builders and public APIs over shared seed state. Parallel tests isolate mutable state, namespace external resources by worker, and clean up only what they own.

## Integration tests

An integration test makes its real boundary explicit: application graph, database schema, filesystem artifact, message broker, or outbound HTTP adapter. Stubbing other boundaries keeps the failure focused.

Use production serialization, migrations, and adapters at the selected real boundary. Do not mock the database library while claiming to test database integration.

Name the critical seam and the behavior or failure it owns. Common consequential seams include persistence, serialization, external adapters, queues, filesystems, packaging, authentication, transactions, retries, ordering, and partial failure. Do not test every interface mechanically.

## E2E and smoke

Write E2E when all three gates pass:

1. production failure blocks a critical user or business journey;
2. lower layers cannot catch the failure; and
3. the team owns environment, data, artifacts, and flake repair.

Keep a fast smoke subset for deployment health and a broader suite for scheduled or release validation when runtime cost requires the split.

- Create isolated test data through supported interfaces.
- Poll asynchronous outcomes with a bounded timeout instead of sleeping.
- Sandbox vendors unless the vendor boundary is the contract under test.
- Capture logs, traces, responses, screenshots, or HAR before teardown.
- Fix deterministic flakes at the root. Quarantine only as a short, owned incident response with an expiry.

## Evals

Use evals for probabilistic behavior. Define representative and adversarial cases, explicit grader criteria, and an acceptance threshold. Test deterministic eval datasets, runners, aggregation, and graders with ordinary unit or integration tests.

## Generative and structural searchlights

Use property-based testing when a broad input space has stable invariants, algebraic properties, round trips, parser boundaries, or many interacting edge cases. Use model-based testing when state transitions or operation sequences can be checked against a simpler domain model. Example tests remain clearer for a small, known case set.

Coverage is a searchlight for unexamined behavior, not a quality target. Inspect consequential uncovered paths and branch gaps; a percentage cannot establish correctness.

Use mutation testing only when a stable, consequential unit suite may assert too weakly and the expected diagnostic value justifies its runtime and maintenance cost. Surviving mutants prompt review of the risk model or assertion, not mechanical test multiplication.

Treat unexpected warnings as failures or explicit review items. Filter a warning only when its cause is understood and the filter is narrow, owned, and time-bounded when temporary.

## Distribution and defaults

When distribution is part of the contract, prove the consumer path:

```text
source tree
  → built release artifact
  → isolated regular install
  → installed entry point
  → primary command with real defaults
  → observable result
```

Run outside the checkout when source shadowing is possible. Editable installs, test-only overrides, injected configuration, imports, and `--help` do not prove packaged contents or default behavior.

An install using `--no-deps` or separately supplied runtime dependencies proves the artifact path, not a regular consumer install. Report the regular-install seam blocked when dependency resolution cannot run.

## Failure patterns

| Pattern | Why it lies | Replacement |
|---|---|---|
| Existence-only assertion | Wrong output still passes | Compare the expected value or shape |
| Coverage test | Executes lines without proving behavior | Name and assert the contract |
| Implementation mirror | Refactors break while behavior survives | Test the public seam |
| Layer mismatch | Proves a different risk than claimed | Move to the owning layer |
| Shared mutable seed | Order and parallelism change results | Create namespaced data per run |
| Fixed readiness sleep | Timing differs across environments | Poll the observable condition with timeout |
| Conditional assertion | A branch can skip verification | One explicit expected outcome per case |

## Import boundaries

Use an import/dependency fitness test only after the boundary is stable and important enough to enforce. Keep each forbidden edge named and machine-checkable in test or CI tooling, never as a runtime guard in production code.
