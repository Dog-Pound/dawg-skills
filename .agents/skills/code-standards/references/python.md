# Python Standards

Applies on top of [common.md](common.md) for code and [testing.md](testing.md) for tests. Repository configuration owns supported Python versions and tooling.

## Closed value sets

Use `enum.StrEnum` (Python 3.11+) or `enum.Enum` when values cross module boundaries, exist at runtime, or may gain behavior. Use `Literal[...]` for local type narrowing where no runtime value object is needed.

```python
class LabelName(StrEnum):
    WIN = "win"
    LOSS = "loss"


class OrderRecord(BaseModel):
    label: LabelName
```

## Behavior contracts

Use `abc.ABC` and `@abstractmethod` for owned runtime polymorphism with multiple implementations. Use `Protocol` for structural contracts, especially third-party objects the project does not own. A single implementation uses its concrete type until another implementation or volatile boundary earns an abstraction.

```python
class Converter(ABC):
    @abstractmethod
    def convert(self, source: Path) -> ConversionResult: ...
```

## Settings

- Required runtime values and secrets have no defaults; fail at the composition root when they are absent.
- Defaults represent values safe and valid in every environment, not placeholders that let misconfiguration boot.
- Construct settings at a composition root and inject them. Domain methods do not read global settings getters.

```python
class AppSettings(BaseSettings):
    api_key: SecretStr
    request_timeout_seconds: float = 10.0
```

## Module ownership

Order modules for reading: imports, constants, public types and behavior, then private helpers near their owner. Prefer functions for stateless behavior and methods for behavior that owns class state or invariants. Keep a helper on its class when it operates on that class's state or invariant; keep a class-independent transformation as a module-private function.

## Pydantic models

- Put cross-field invariants on the model.
- Use `model_validator(mode="after")` and name validators after the invariant.
- Add a validator docstring only when its name cannot carry the invariant.
- Convert wire DTOs at the boundary with `to_domain()` and `from_*()` methods or one explicit adapter.

```python
class OrderRecord(BaseModel):
    label: LabelName
    label_status: LabelStatus

    @model_validator(mode="after")
    def _outcome_label_matches_status(self) -> Self: ...
```

### API boundary DTOs

Request and response models live at the API boundary selected by the repository. Service-local types stay with the service; shapes shared across boundaries have one model owner. See [FastAPI type placement](fastapi.md#type-placement).

```python
def score(body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse.from_result(service.score(body.to_domain()))
```

## Type ergonomics

- Use builtin generics: `list[T]`, `dict[K, V]`, `tuple[T, ...]`.
- Accept `Any` only at an untyped edge; validate or narrow it immediately.
- Every type variable must be inferable from an input or bound by the declaration.

```python
def latest[T](rows: list[Row], field: str, default: T) -> T: ...
```

## Pytest

Follow the repository's existing test layout and markers. When no convention exists:

- distinguish unit, integration, E2E, and smoke tests by scope;
- use `@pytest.mark.parametrize` for repeated input/output cases;
- put shared setup in the nearest `conftest.py` that owns it;
- use `tmp_path` for filesystem tests;
- use `pytest.raises(..., match=...)` when the error is the behavior; and
- register every custom marker in `pyproject.toml`.

Use async test support already selected by the repository. Add `pytest-asyncio` only when async tests require it.

Import-boundary checks are opt-in after layer edges stabilize. Keep one named forbidden edge per contract and enforce it outside production code.
