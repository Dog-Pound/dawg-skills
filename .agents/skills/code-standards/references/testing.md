# Testing Standards

Test quality Single Source of Truth — top-level sibling to [`common.md`](common.md).

## Test levels by scope

Classify tests by **what they touch**, not how fast they run.

| Level | Scope | Example |
|---|---|---|
| **Unit** | One module; public interface only | `modulePublicEntrypoint(input)` → expected output |
| **Integration** | Crosses module boundaries in-process | In-process HTTP client hitting router + handler + injected deps |
| **E2E** | Full stack or external systems | Live API, browser, real database |

A test that imports two internal modules and wires them together is integration even if it finishes in milliseconds. Tag cross-unit tests by scope; tag syntax → language overlay.

## Layer job matrix

Pick layer by **failure mode**, not assertion strength.

| Layer | Proves | Does not prove |
|---|---|---|
| **Unit** | Module behavior on controlled inputs | Correct prod config or bundled artifact shipped |
| **Integration** | Route → handler → store/service → JSON; DB/HTTP boundaries | Artifact identity, column inventory, env constants |
| **E2E** | Critical user journeys on live stack; `<5%` of total test count | Endpoint coverage; every metadata field; duplicate integration coverage |

Cross-link: [common.md § No raw dicts, no magic strings](common.md#no-raw-dicts-no-magic-strings).

## Integration flavors

One `@pytest.mark.integration` marker; two flavors:

| Flavor | Real boundary | Stub OK at edge |
|---|---|---|
| **In-process** | `TestClient` + lifespan; route → handler → store → JSON; bundled artifact on disk | In-memory stores, store-reset helper for readiness |
| **External-dep** (when added) | Postgres + rollback; `respx` at httpx boundary | Everything except that boundary |

Integration ≠ mock-free. **Narrow:** one real boundary; stub everything else at the edge. Over-mock = every collaborator faked → unit test in costume. Signal: *if the real boundary breaks, does this test fail?*

| Boundary | In-process route tests today | Stub OK |
|---|---|---|
| HTTP + app graph | `TestClient(build_app())` | — |
| Bundled model/config artifact | On disk | — |
| Domain persistence | — | `InMemory*Store` |
| Readiness scenarios | — | Store-reset helper, `InMemoryModelStore(unloaded)` |
| Postgres | N/A | When added: real SQL only — never mock session |

When DB, queues, or outbound HTTP ship: use testcontainers + Alembic migrations, `respx` or wrapper fakes, wait-with-timeout (not `sleep`), builders-not-seeds. Zero flake budget → [§Flake](#e2e).

## Route integration

HTTP wiring tests: one `(status, body) == expected`. Build `expected` from the **dependency the handler uses**, via the response DTO — not hardcoded prod data, not a re-read of the file the store already loaded.

Timestamps and runtime IDs: derive from store/service in `expected`, not from the response (self-referential `expected.ts = response.body.ts` passes when both are wrong). Freeze time in unit tests when determinism is the behavior.

```text
// bad — inventories bundled artifact on route
verify client.get("/v1/model").body.feature_count == 27

// good — route wiring: same path as handler
expected = ResponseDto.fromDomain(getDomainStore().getMetadata()).toJson()
verify (response.status, response.json()) == (200, expected)

// good — bundled inventory: contract test or promotion script, not route
```

## Source-of-truth in expected values

| Situation | Pattern |
|---|---|
| Route returns store/service state | Expected from that dependency via response DTO — see [Route integration](#route-integration) |
| Spec: "field X from configured file" | Unit test on the loader — not route test |
| Spec: "bundled artifact must be v1" | Contract test, promotion script, or CI checksum |
| Reviewer asks for pinned inventory on route | Contract test — not integration route |

**Do** hardcode in unit tests when the fixture is the source of truth.

## Agent-era failures

Common patterns that produce green suites and broken software:

- **Liar tests** — checks so weak (`is not null`, `length > 0`) that wrong implementations pass. Fix: compare `actual` to a constructed `expected`.
- **Implementation mirror** — tests verify internal call order, private method names, or mock interaction counts instead of observable behavior. Fix: test the public contract; rename tests to describe behavior, not mechanism.
- **Coverage theater** — tests written to hit lines, not behaviors. Fix: one behavior per test; delete tests that duplicate the same rule at a different layer.
- **Layer mismatch** — route test asserts inventory or asset identity (e.g. `feature_count == 27`). Fix: contract test, promotion script, or CI; route tests stay on wiring.
- **Mislabeled TestClient as E2E** — in-process HTTP is integration. Fix: relabel `@pytest.mark.integration`; reserve `@pytest.mark.e2e` for live stack.
- **E2E coverage theater** — one test per endpoint on live stack. Fix: critical journeys only; route wiring stays integration.
- **Flake tolerance on browser/network E2E** — `@retry`, quarantine, or "known flaky." Fix: zero flake budget — fix root cause or delete (see [§E2E Flake](#e2e) for the SSOT rule).
- **Shared mutable seed data** — E2E tests depend on manual DB state. Fix: create via API, UUID-namespace per run.
- **`sleep` for readiness** — fixed delay instead of polling. Fix: a project polling helper or bounded poll with timeout.
- **Slow E2E suite gating PRs** — 30-min suite blocks merges. Fix: smoke post-deploy, full E2E nightly.

## E2E

Write E2E only when **all three** gates pass:

- **Critical journey** — production failure would block users or revenue; not already covered by unit + integration.
- **Unit + integration can't catch** — failure mode needs live stack, browser, or real external boundary.
- **Willing to maintain** — team owns data setup, env, and flake fixes; no orphan suite.

**Test data**

- Create via API — never depend on shared seed rows or manual DB state.
- Namespace with UUIDs — names, emails, org slugs unique per run; parallel-safe.

**Determinism**

- Poll with timeout using the project's polling helper or a bounded poll; never use `sleep` for readiness.
- Sandbox externals — stub or point at test doubles; no live vendor calls in CI.

**Flake**

- Zero tolerance — fix root cause or delete the test.
- No `@retry`, no permanent quarantine, no "known flaky" backlog.

Browser E2E → [react-typescript.md § Frontend testing](react-typescript.md#frontend-testing).

## Smoke vs full E2E

**Smoke** — post-deploy gate, `<2` min:

- Mark with `@pytest.mark.smoke` on tests in `tests/<package>/e2e/` — no sibling `tests/smoke/` directory.
- Run: `pytest -m smoke` after deploy.

**Full E2E** — nightly or pre-release:

- Run: `pytest -m "e2e and not smoke"`.

**Synthetic prod smoke** — schedule smoke against prod with a dedicated synthetic user; no vendor-specific account list in docs.

**E2E checklist** — anti-patterns and fixes → [§Agent-era failures](#agent-era-failures).

- [ ] All three when-to-write gates pass
- [ ] Tagged `@pytest.mark.e2e` (smoke tests also `@pytest.mark.smoke`)
- [ ] Lives under `tests/<package>/e2e/` — not `tests/smoke/`
- [ ] Data created via API; UUID-namespaced
- [ ] Polls with timeout — no `sleep`
- [ ] Externals sandboxed in CI
- [ ] Zero `@retry` and zero quarantine
- [ ] `<5%` of total test count
- [ ] Smoke runs post-deploy; full E2E nightly/pre-release
- [ ] Browser journeys cross-linked to frontend testing overlay

## Stubs and mocks

| Kind | Role | Assert |
|---|---|---|
| **Stub** | Returns canned data — no side effects | Never assert call count or `called` |
| **Mock** | Simulates outbound side effect (HTTP, email) | Assert observable outcome, not interaction count |

**Anti-patterns**

| Pattern | Fix |
|---|---|
| Assert `stub.foo.called` | Test return value instead |
| `sleep` / polling in unit test | Deterministic fake or dependency override |
| Conditional assert | One code path per test |
| Unit test >100ms | Move to integration or shrink fixture |

## One behavior per test

Each test verifies one input/output pair. Name the test so it reads as a sentence describing the input and expected behavior; follow the project's test-naming idiom. If a test verifies multiple unrelated properties, split it into multiple tests.

```text
// bad: three behaviors in one test
test("report service produces summary, totals, and row count") {
  result = ReportService(settings).run()
  verify result.summaryPath.exists()
  verify result.totalAmount == 1000
  verify result.rowCount == 40
}

// good: one behavior per test, clear name
test("report service writes summary output") { ... }
test("report service total matches input sum") { ... }
test("report service row count matches input") { ... }
```

**Reconcile with expensive fixtures:** "One behavior" means one I/O contract, not one field or attribute. When a fixture is expensive (runs a full pipeline, calls an external service), don't fragment into one-property-per-test for basic structural checks — consolidate into a single `result == expected`. "Report produces the expected status set and totals" is one behavior, not four weak membership tests.

```text
// bad: four weak tests for one behavior
test("has status active", summary) { verify summary.statuses.contains(Status.ACTIVE) }
test("row count non-zero", summary) { verify summary.rowCount > 0 }

// good: one test, full expected shape
test("report summary", summary) {
  result = { statuses: sort(summary.statuses), rowCount: summary.rowCount }
  expected = { statuses: sort([Status.ACTIVE, Status.PENDING]), rowCount: 42 }
  verify result == expected
}
```

## Assert hierarchy

Default: **one behavior, prefer one `actual == expected`** with structured expected values.

Multi-assert OK when facets of the **same outcome** and a single equality is awkward — still one behavior. Split when properties are independent ("and" in the test name).

Do not scatter weak checks (`is not null`, `> 0`) across attributes — build `expected` and compare.

Documented exceptions — use only when equality on the whole result is awkward:

| Exception | When | Pattern |
|---|---|---|
| Expected error | Error type/message is the behavior | expect invocation throws ValidationError |
| Status + body | HTTP wiring tests | verify (statusCode, parsedBody) == (422, expectedBody) |
| Stochastic floor | Non-deterministic output (e.g. model AUC) | verify score >= floor — deterministic values still use `==` |

```text
// bad: implicit checks spread across attributes
test("processor groups by key") {
  records = Processor().run(rows)
  recordsByKey = indexBy(records, r => r.key)
  verify recordsByKey["A"].count == 2
  verify recordsByKey["B"].count == 1
}

// good: build the expected, compare equality
test("processor groups by key") {
  rows = [inputRow("A"), inputRow("A"), inputRow("B")]
  expectedCounts = { "A": 2, "B": 1 }

  actualCounts = mapValues(
    Processor().run(rows),
    r => ({ key: r.key, count: r.count })
  )

  verify actualCounts == expectedCounts
}
```

The pattern states the expected shape up front, catches unintended side effects (extra keys, wrong types) automatically, and reads as arrange → act → verify without scanning for checks.

### Weak assertions are not `result == expected`

Default: every unit test's final assertion is whole-value `result == expected`. Partial-field, membership (`in`), or attribute-picking asserts are blockers, not style choices.

Only two exceptions:

1. `pytest.raises` (or equivalent) — the exception IS the expected value; assert on the match pattern, not a whole-object comparison.
2. Nondeterministic fields (timestamps, generated ids) — echo the actual value into the expected object with a `# nondeterministic; echoed` comment, then sanity-check that field separately (e.g. `tzinfo`). No freezing libraries for a single test.

The following are anti-patterns — they prove something happened, not that the right thing happened:

```text
// bad: existence checks
verify count > 0
verify result != null
verify items.length > 0

// bad: membership checks when you know the full set
verify names.contains(Status.B)
verify columns.contains("feature_a")

// good: verify the concrete expected value
verify count == 4997
verify names == [Status.A, Status.B]
verify columns == ["feature_a", "feature_b", "feature_c"]
```

## Golden files for third-party-generated output

Output produced by a library you don't control (markdown renderers, PDF extractors, serializers) is tested by equality against a committed golden file — not by fragment/`contains` asserts scattered over the output.

- Goldens live in `expected/` next to the fixtures; test body is `assert result == ConversionResult(markdown=golden("name.md"), warnings=[])`.
- Re-blessing a golden is a conscious, reviewable commit — library upgrades churn goldens on purpose; the diff **is** the review.
- Fragment asserts (`"| Client |" in markdown`) prove a substring survived, not that the output is right — they silently pass through reordered, duplicated, or truncated output.

## Public API only

Tests call **public** functions, methods, and route endpoints. Never call private helpers (e.g. `obj._privateMethod()`) — test through the module's public entrypoint.

```text
// bad: testing private merge logic through internal access
test("merge delta combines scores") {
  verify service._mergeDelta(a, b) == expected
}

// good: test through public entrypoint
test("service normalizes rows") {
  verify service.run(input) == expected
}
```

Route handlers and exported entrypoints are public; private helpers inside a module are not test targets.

## Table-driven tests

When the same `actual == expected` pattern repeats across inputs, use a table of cases instead of copy-pasting tests with one input swap. Each row is one behavior; the test body stays identical.

Principle: one test function (or equivalent), many input/expected pairs, no duplicated arrange/act logic. Table syntax and runner mechanics → language overlay.

## Shared test setup

Reusable factories, builders, sample data, and any helper used by more than one test belong in a **shared test setup location**, not inline next to tests. A test file should contain tests, not test infrastructure.

- Shared setup for unit tests in a package → one shared location for that package's unit tests.
- Shared setup for integration tests → one shared location for that package's integration tests.
- Inline helper inside a test file is allowed only when it's used by exactly one test in that file.

Exact directory layout, file names, and injection mechanics → language overlay.

```text
// bad: builder defined inline, used by every test in the file
function inputRow(key, ...) { ... }

test("processor handles first key") { inputRow("A") ... }
test("processor handles second key") { inputRow("B") ... }

// good: builder lives in shared test setup and is injected per test
// shared-setup/rowFactory(...)
test("processor handles first key", rowFactory) {
  rows = [rowFactory(key: "A")]
  ...
}
```

## No comments on test constants or fixtures

The fixture or constant name carries the intent. If it doesn't, rename. Do not annotate test data with explanatory prose — it drifts the moment the data changes.

## Import boundary tests

Opt-in fitness function — only when layer edges are **stable**. While layout is still moving, skip.

One forbidden edge per contract; failure names the rule. Enforce at test/CI — not with runtime import guards in production code. Tooling (Import Linter, dependency-cruiser, ArchUnit, etc.) → language overlay.

```text
// bad — runtime guard in production code
if (callerIsCatalog(importingModule)) {
  throw new Error("billing must not import catalog")
}

// good — one named contract per forbidden edge (enforced by CI tooling)
// rule: billing must not import catalog
// sources = myapp.services.billing
// forbidden = myapp.services.catalog
```

## Test names describe the behavior, not the mechanism

`decided label wins over excluded` — good (states the rule).
`choose label row returns decided first` — bad (describes the implementation).

When the implementation changes, behavior-named tests stay valid; mechanism-named tests have to be renamed.
