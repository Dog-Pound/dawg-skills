# FastAPI Testing Standards

| Scope | Exercise |
|---|---|
| Unit | Domain owner or validator directly |
| Integration | In-process app with lifespan: route → dependencies → owner → serialized response |
| External-boundary integration | Real database or a fake at the outbound HTTP seam; one real boundary per test |
| E2E | Out-of-process deployed stack; critical journeys only |

- Assert `(status_code, response.json()) == expected` for JSON route contracts.
- Build expected responses from controlled fixture or domain inputs, never by echoing the response.
- Test custom validation and the project's error envelope; framework-owned required-field permutations need no exhaustive duplication.
- Override the narrowest dependency that represents the test seam and always restore overrides.

[FastAPI dependency overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/) are the default seam for replacing one injectable in an otherwise normal application graph.
