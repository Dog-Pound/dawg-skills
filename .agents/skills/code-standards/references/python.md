# Python-Specific Standards

Applies on top of [`common.md`](common.md) (code) and [`testing.md`](testing.md) (tests). Wins for Python-specific mechanics only — link § upstream, never restate.

## Closed value sets: `Enum` over `Literal`

Use `enum.StrEnum` (Python ≥3.11) or `enum.Enum` for value sets that:

- Are referenced at runtime (compared, iterated, displayed, serialized).
- Cross module boundaries as part of a public contract.
- Have any chance of growing semantics (a display name, ordering, parsing rules, JSON aliases).

`Literal[...]` is for type-narrowing within a single module or as a structural type hint on data the type system never *constructs*. It is not the public contract for runtime values.

```text
# bad: Literal as the cross-module contract
LabelName = Literal["win", "loss", "active_or_ambiguous", "unlabeled"]

class OrderRecord(BaseModel):
    label: LabelName

# elsewhere — magic strings everywhere
if row.label == "win": ...
elif row.label == "loss": ...

# good: Enum carries semantics and prevents magic strings
class LabelName(StrEnum):
    WIN = "win"
    LOSS = "loss"
    ACTIVE_OR_AMBIGUOUS = "active_or_ambiguous"
    UNLABELED = "unlabeled"

class OrderRecord(BaseModel):
    label: LabelName

# elsewhere — the enum is the contract
if row.label is LabelName.WIN: ...
```

## Behavior contracts: ABC over Protocol

Behavior contracts with multiple implementations use `abc.ABC` + `@abstractmethod`, not `typing.Protocol`. Nominal typing: missing methods fail at instantiation, not at the type checker's mercy; `grep "Converter)"` finds every implementation.

`Protocol` is for typing third-party or structural shapes you don't own — not for contracts this codebase defines and implements.

```text
# bad: structural contract for owned implementations — checker-only, invisible inheritance
class Converter(Protocol):
    def convert(self, source: Path) -> ConversionResult: ...

# good: nominal contract — fail-fast, grep-able
class Converter(ABC):
    @abstractmethod
    def convert(self, source: Path) -> ConversionResult: ...
```

## Settings

- Every `BaseSettings` field has a default. A missing env var must never crash construction — required fields make *any* consumer of the settings class fail, including code that reads one unrelated field.
- Classes never call `get_xxx_settings()` inside methods. House pattern: optional-injected constructor — `def __init__(self, settings: XSettings | None = None): self._settings = settings or get_xxx_settings()`. Wiring happens at composition roots (boot, registry, `Depends()`), not deep in call stacks.

## OOP-first module layout

Module top-to-bottom:

1. Imports.
2. Module-level constants (no docstrings — see [`common.md §API documentation`](common.md#api-documentation-concise-or-absent)).
3. The class(es) that own the module's behavior.
4. Free functions only when they are the module's public API or are class-independent.

A method that calls a `_helper(...)` defined at module scope is a smell. The helper is a private method. See [`common.md §Behavior on a class lives on the class`](common.md#behavior-on-a-class-lives-on-the-class).

## Pydantic models

- Validators get a docstring only when the invariant isn't obvious from the validator name.
- Use `model_validator(mode="after")` and name the method after the invariant: `_outcome_label_matches_status` is good; `_validate` is not.
- Cross-field invariants belong on the model. If you find yourself enforcing them in a stage or service, the model is missing a validator.

```text
# bad: docstring restates the model
class OrderRecord(BaseModel):
    """A raw row plus the rule-based label and structured note signals."""

    label: LabelName
    label_status: LabelStatus

# good: silent model — name + types tell the story
class OrderRecord(BaseModel):
    label: LabelName
    label_status: LabelStatus

    @model_validator(mode="after")
    def _outcome_label_matches_status(self) -> Self: ...
```

### API boundary DTOs

Request/response models in dedicated schema package. Conversion on the model — `to_domain()` / `from_*()`. No inline dict munging.

Shared internal domain shapes also live in the schema package (`models/`) for this project; service-local types stay in the owning module. → [`fastapi.md §models/ — type placement`](fastapi.md#models--type-placement)

```python
# bad
def score(body: dict) -> dict:
    domain = DomainInput(id=body["id"], features=body["features"])

# good
def score(body: ScoreRequest) -> ScoreResponse:
    return ScoreResponse.from_result(service.score(body.to_domain()))
```

## Type ergonomics

- Use builtin generics (`list[T]`, `dict[K, V]`, `tuple[T, ...]`); reach for `typing` only when you need protocols, generics with bounds, or `Self`.
- `Any` is allowed at the *very* edge (deserializing untrusted JSON) and only there. Validate into a typed model immediately.
- Generic type variables (`T`, `T_co`, etc.) must have at least one parameter the caller can bind. An unbound generic is `Any` in disguise.

```text
# bad: T can't be bound by any caller
def latest[T](rows: list[Row], field: str) -> T | None: ...

# good: T is inferred from `default`
def latest[T](rows: list[Row], field: str, default: T) -> T: ...

# also good: drop the generic
def latest(rows: list[Row], field: str) -> Row | None: ...
```

## Tests

→ [`testing.md`](testing.md). Python/pytest deltas only:

- Register `unit`, `integration`, `e2e`, `smoke` markers in `[tool.pytest.ini_options].markers` (`pyproject.toml`).
- `@pytest.mark.smoke` lives on tests in `tests/<package>/e2e/` — not a sibling `smoke/` directory. CI: `pytest -m smoke` vs `pytest -m "e2e and not smoke"`.
- Layout: `tests/<package>/{unit,integration,e2e}/` — package-root fitness/contract tests (e.g. import boundaries, bundled artifacts) sit beside those dirs; `e2e/` optional until critical user journeys ship (marker registered; empty suite OK in CI).
- `@pytest.mark.parametrize` for table-driven tests; `@pytest.fixture` + nearest `tests/<package>/<unit|integration|e2e>/conftest.py` for shared setup.
- `tmp_path` for filesystem fixtures — never relative paths or `/tmp/...`.
- `pytest.raises` when error type/message is the behavior.
- `pytest-asyncio` with `asyncio_mode = "auto"` when tests are `async def`.
- Import boundaries: opt-in `lint-imports` contracts — one forbidden edge per rule:

```ini
[importlinter:contract:billing-no-catalog]
name = billing must not import catalog
type = forbidden
source_modules = myapp.services.billing
forbidden_modules = myapp.services.catalog
```
