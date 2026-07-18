# FastAPI Standards

Layers [`python.md`](python.md); link § to any upstream overlay as needed — never restate.

## Package layout

| Layer | Owns |
|---|---|
| `core/` | App wiring — lifespan, DI composition root, lifecycle registry, errors, logging |
| `models/` | Pydantic typed contracts — wire DTOs, settings, shared internal domain types; boundary conversion (`to_domain()` / `from_*()`) |
| `routers/` | HTTP routes only — delegate to handlers |
| `handlers/` | HTTP orchestration — DTO ↔ domain mapping, service invocation, response assembly |
| `services/` | Business logic, stores, pipelines — operates on domain types; no HTTP DTOs or request parsing |

- Flow: **router → handler → service**.
- **`core/` is set up once** — boot, holders, and all `Depends()` wiring. You configure it; you don't feature-develop in it.
- **`routers/`, `handlers/`, `services/`** — where product logic lives (routes, orchestration, stores, inference).
- Subpackages by domain — deep modules → [`common.md §Deep modules`](common.md#deep-modules--small-interface-large-implementation).
- Import boundary tests → [`testing.md §Import boundary tests`](testing.md#import-boundary-tests).

## models/ — type placement

| Goes in `models/` | Goes elsewhere |
|---|---|
| `*Request` / `*Response` (OpenAPI contract) | Business logic → `services/` |
| `AppSettings` / config schemas | Module-local result types → owning service module (e.g. `@dataclass MergeResult`) |
| Shared internal shapes used across handlers + services | Binary/ML artifact files → `services/<domain>/models/` (not Python types) |
| Enums on public contracts | Future ORM/table models → infrastructure/repository layer, not `models/` |

1. **"Domain type"** = validated internal data shape, not "must be non-Pydantic." This project uses Pydantic for shared internal types; strict DDD/dataclass-only domain is optional, not required.
2. **`services/` operates on domain types** — services accept/return domain shapes and must not import wire DTOs or parse raw HTTP. That is **not** "define all types in `services/`."
3. **Cohesion override** — types used by one service only stay in that module → [`common.md §Cohesion`](common.md#cohesion--things-that-change-together-live-together)

## Before adding a service

No `*AdminService`, `*Manager`, or `*Facade` for one route or one caller.

| Order | Pick when |
|-------|-----------|
| 1 Handler inline | Dev-only route glue |
| 2 Extend existing | Same store injections already |
| 3 New module | Multiple callers or real domain boundary |

Plan class names = suggestions. Re-derive from codebase → [minimal-execution.md §Plan names are not modules](minimal-execution.md#plan-names-are-not-modules)

## core/ — app wiring system

`core/` is the FastAPI app's engine room: resources start and stop cleanly, and every injectable type is registered in one place. It is **not** a leaf "generic infra" layer — `dependencies.py` is the **composition root** that wires stores, services, and handlers together.

| File | Role |
|---|---|
| `lifecycle.py` | Generic registry runner — no domain registrations |
| `lifespan.py` | Framework lifespan hook — calls `register_managed_resources()` once at startup |
| `dependencies.py` | **Single DI surface** — all `Depends()` factories, `*Dep` aliases, app-scoped holders, startup/shutdown, handler/service/store wiring |
| `errors.py`, `error_handlers.py`, `logging.py` | Cross-cutting HTTP and observability |

**What belongs in `dependencies.py`:** store holders, readiness gates, request validation deps, service factories, handler factories (`*Dep` aliases). One file, one import path for routers.

**What belongs elsewhere:** business logic and store implementations under `services/`; handler classes under `handlers/` (classes only — no separate handler deps module).

`core/` must not import `routers/`. Importing `handlers/` and `services/` from `dependencies.py` is expected — that file exists to compose them.

## Boot vs request

```text
main → lifespan hook → lifecycle registry → startup (create/register holders)
per-request → Depends() factories in dependencies.py (read holders, compose handlers/services)
```

- All `Depends()` + `*Dep` → **`core/dependencies.py` only**. Routers and tests import from there; don't define deps elsewhere.
- Lifespan **starts and stops** resources; `dependencies.py` **registers and exposes** them.
- Wiring rules → [`common.md §Fix linter smells`](common.md#fix-linter-smells-structurally) · [`common.md §One concept, one owner`](common.md#one-concept-one-owner-module)

## handlers/

HTTP orchestration layer between routers and services.

**Handlers own:** call services with domain types (from `models/` or service-local types); map results → response DTOs; route-level logging at the orchestration boundary; future envelope shaping.

**Handlers do not own:** model inference, persistence queries, merge algorithms, external extraction — those stay in `services/`.

Handler methods return Pydantic models — not raw `JSONResponse`. Handler classes live in `handlers/`; their `Depends()` factories live in `core/dependencies.py`.

## Routers

HTTP surface only: `Depends` + delegate to handler + `response_model`. DTOs → [`python.md §API boundary DTOs`](python.md#api-boundary-dtos).

```python
def score_item(
    domain_input: DomainInputDep,
    handler: ScoreHandlerDep,
) -> ScoreResponse:
    return handler.score(domain_input)
```

- Routers import `*Dep` from `core.dependencies` only — never `services.*` directly.
- Success path returns the Pydantic model — not raw `JSONResponse`.
- Adapter validation errors → project error envelope (Pydantic-shaped `details.errors`); business errors → service layer.
- Route-level gates (`StoresReadyDep`, `ScoreDomainDataDep`) may stay on the router when ordering matters (e.g. 422 before 503 on score).

## Adding a managed resource

1. Boot + register → `dependencies.register_*()` called from lifespan.
2. Store validate/factory → store module under `services/`.
3. Request access → `Depends()` factory + `*Dep` alias in `dependencies.py`.
4. Handler exposure (if needed) → handler factory in `dependencies.py` composing the new service/store deps.

## Tests

→ [testing.md](testing.md) — layer matrix, [Integration flavors](testing.md#integration-flavors), [Route integration](testing.md#route-integration), [E2E](testing.md#e2e), [Smoke vs full E2E](testing.md#smoke-vs-full-e2e). FastAPI deltas:

| What | Marker | How |
|---|---|---|
| Service / store / handler logic | `unit` | Direct call — no `TestClient` |
| Route wiring — `TestClient` / `httpx` + `ASGITransport` | `integration` | In-process, same app graph + lifespan, no live port; `(status, body) == expected` |
| Outbound HTTP (when added) | `integration` | `respx` at httpx boundary — not service internals |
| DB boundary (when added) | `integration` | Real SQL + session override + rollback — never mock SQLAlchemy sessions |
| `httpx` vs `E2E_BASE_URL` (uvicorn/staging) | `e2e` | Out-of-process, live stack; critical journeys only — see [E2E](testing.md#e2e) |
| Post-deploy gate | `smoke` | `@pytest.mark.smoke` in `tests/<package>/e2e/`; `pytest -m smoke` |

- **Route expected:** `ResponseDto.from_domain(get_store().get()).model_dump(mode="json")` — see [Route integration](testing.md#route-integration).
- **In-memory stores at boundary = stub, not over-mock** — see [Integration flavors](testing.md#integration-flavors).
- **Store holders vs overrides** — pick by what you are simulating (see table below).
- **Pydantic:** test **custom** validators at unit layer (`test_score.py`). Skip framework required-field / type-coercion 422 — FastAPI owns those. Route integration: custom-validator 422 **envelope** only.
- **E2E:** when-to-write gates, data, flake rules → [E2E](testing.md#e2e); smoke vs nightly split → [Smoke vs full E2E](testing.md#smoke-vs-full-e2e).
- **E2E stack:** uvicorn + migrated DB + sandbox externals; test process separate from app; compose or staging — no YAML here.
- **Auth:** real login default; pre-minted token when OAuth round-trip is expensive.
- **Externals:** sandbox only in CI — no live vendor calls.
- **Async:** poll observable effect — never `sleep`; use `wait_until` with timeout.
- **Artifacts on failure:** trace, logs, HAR, response body — capture before assert teardown.

```python
E2E_BASE_URL = os.environ["E2E_BASE_URL"]

wait_until(
    lambda: httpx.get(f"{E2E_BASE_URL}/healthz", timeout=2).status_code == 200,
    timeout=30,
)

suffix = uuid.uuid4().hex[:8]
resp = httpx.post(
    f"{E2E_BASE_URL}/v1/orgs",
    json={"name": f"e2e-{suffix}"},
)
assert resp.status_code == 201
org_id = resp.json()["id"]
```

### Store holders vs `dependency_overrides`

App-scoped store holders in `core/dependencies.py` are module-level state: lifespan calls `set_stores(...)` at startup; `get_*_store()` `Depends()` factories read those holders per request.

| Mechanism | When | Teardown |
|---|---|---|
| `set_stores(...)` / `clear_stores()` | Readiness / 503 when stores uninitialized; partial readiness (e.g. model not loaded); inject in-memory stores so route expected comes from `get_*_store()` — same path the handler uses | `clear_stores()` in `finally`; next `TestClient` lifespan re-initializes via startup hook |
| `app.dependency_overrides[dep] = fake` | Swap one `Depends` target without changing global holder state — e.g. fake outbound client, isolated validation dep | `app.dependency_overrides.clear()` in `finally` |

Prefer holder helpers for readiness and route wiring against store state. Prefer overrides when replacing a single injectable in an otherwise normal app graph. [FastAPI dependency overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/).

```python
@pytest.mark.integration
def test_readyz_returns_not_ready_when_stores_cleared(client: TestClient) -> None:
    clear_stores()
    try:
        response = client.get("/readyz")
    finally:
        clear_stores()
    assert (response.status_code, response.json()) == (503, {"status": "not_ready"})


@pytest.mark.integration
def test_orders_route_returns_503_when_backend_unavailable(client, app, backend_dep) -> None:
    app.dependency_overrides[backend_dep] = lambda: UnavailableBackend()
    try:
        response = client.get("/orders")
    finally:
        app.dependency_overrides.clear()
    assert (response.status_code, response.json()) == (503, expected_unavailable_body)
```
