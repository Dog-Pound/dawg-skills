# FastAPI Standards

FastAPI-specific HTTP, dependency, lifecycle, and serialization rules. Repository ADRs own application topology.

## HTTP boundary

Routes own HTTP parameters, dependencies, authorization, status, headers, and response models. They translate between DTOs and typed domain inputs; domain behavior stays with its entity owner. Keep application construction, router registration, lifespan, dependency providers, and error handlers at the composition root.

## Type placement

| Contract | Owner |
|---|---|
| Request/response DTO | API models or domain API module |
| Shared domain shape | Domain owner |
| Application/domain-local result | Owning module |
| Settings | Composition/configuration owner |
| ORM/table model | Persistence owner |

Application and domain entry points accept typed inputs rather than raw request objects or unvalidated dictionaries. Convert at the boundary through one explicit adapter or `to_domain()` / `from_*()` methods.

## Dependencies and composition

FastAPI dependencies are boundary adapters. Use them for request-scoped resources, authentication and authorization, validated request context, and injected owners.

- Keep construction at the composition root.
- Reuse `Annotated` dependency aliases when they make route signatures clearer.
- Keep authorization checks at the HTTP boundary and business authorization invariants in the domain owner.
- Preserve the repository's documented public provider import surface.
- Use sub-dependencies instead of manually rebuilding the same dependency graph.

Routers import public dependency providers, not concrete persistence or vendor clients.

```python
@router.post("/scores", response_model=ScoreResponse)
def score_item(body: ScoreRequest, scorer: ScorerDep) -> ScoreResponse:
    return ScoreResponse.from_result(scorer.score(body.to_domain()))
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
