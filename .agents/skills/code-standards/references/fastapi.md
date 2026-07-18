# FastAPI Standards

Applies on top of [python.md](python.md). Existing repository architecture wins; use this default only where the repository has no established owner.

## Default flow

Start with the shortest complete path:

```text
router → service
```

Add a handler only when HTTP orchestration—DTO mapping, multiple service calls, response assembly, or route-level policy—forms a reusable unit. Repositories with an established handler layer keep `router → handler → service` consistently.

| Layer | Owns |
|---|---|
| `routers/` | HTTP contract: parameters, dependencies, status, response model |
| `handlers/` | Optional HTTP orchestration with real behavior |
| `services/` | Business rules, persistence orchestration, external integrations |
| `models/` or domain package | Typed boundary and shared domain contracts |
| composition root | App construction, dependency providers, lifespan, error handlers |

Organize growing routers and services by domain. Keep `main.py` as app composition, not a second home for feature logic.

## Type placement

| Contract | Owner |
|---|---|
| Request/response DTO | API models or domain API module |
| Shared domain shape | Domain owner |
| Service-local result | Owning service module |
| Settings | Composition/configuration owner |
| ORM/table model | Persistence owner |

Services accept typed domain inputs rather than raw request objects or unvalidated dictionaries. Convert at the boundary through one explicit adapter or `to_domain()` / `from_*()` methods.

## Dependencies and composition

FastAPI dependencies are boundary adapters. Use them for request-scoped resources, authentication/authorization, validated request context, and injected services.

- Keep construction at the composition root.
- Reuse `Annotated` dependency aliases when they make route signatures clearer.
- Keep authorization checks at the HTTP boundary and business authorization invariants in the domain owner.
- Start with one dependency module. Split by domain when it stops being a deep module, while preserving one documented public import surface.
- Use sub-dependencies instead of manually rebuilding the same dependency graph.

Routers import public dependency providers, not concrete persistence or vendor clients.

```python
@router.post("/scores", response_model=ScoreResponse)
def score_item(body: ScoreRequest, service: ScoreServiceDep) -> ScoreResponse:
    return ScoreResponse.from_result(service.score(body.to_domain()))
```

## Lifespan and managed resources

Create and close app-scoped resources in the FastAPI lifespan. Expose them through dependency providers; request handlers read them but do not own their lifecycle.

For every managed resource, define:

1. construction and validation;
2. startup ownership;
3. request access;
4. shutdown; and
5. readiness behavior.

Keep registration explicit. Boot code calls named registration or construction functions instead of relying on import side effects.

## Errors

- Request validation maps to the project's stable error envelope.
- Business failures remain typed domain outcomes or exceptions until the HTTP boundary maps them.
- External failures preserve retryability and cause.
- Success returns the declared response model; use `Response` subclasses only when status, headers, streaming, or media type require them.

## Tests

Use [testing.md](testing.md) and these FastAPI deltas:

| Scope | Exercise |
|---|---|
| Unit | Service, domain, validator, or handler directly |
| Integration | In-process app with lifespan: route → dependencies → service → serialized response |
| External-boundary integration | Real database or a fake at the outbound HTTP seam; one real boundary per test |
| E2E | Out-of-process deployed stack; critical journeys only |

- Assert `(status_code, response.json()) == expected` for JSON route contracts.
- Build expected responses from controlled fixture/domain inputs, never by echoing the response.
- Test custom validation and the project's error envelope; framework-owned required-field permutations need no exhaustive duplication.
- Override the narrowest dependency that represents the test seam and always restore overrides.
- Poll observable asynchronous effects with a bounded project helper; fixed sleeps are not readiness checks.
- Capture response bodies, logs, traces, and browser artifacts before teardown on failure.

[FastAPI dependency overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/) are the default seam for replacing one injectable in an otherwise normal application graph.
