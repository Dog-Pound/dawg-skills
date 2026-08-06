# Pydantic Standards

Pydantic and pydantic-settings deltas.

## Settings

- Required runtime values and secrets have no defaults; fail at the composition root when absent.
- Defaults are safe and valid in every environment.
- Construct settings at the composition root and inject them. Domain behavior does not read global settings getters.

## Models

- Put cross-field invariants on the model.
- Use `model_validator(mode="after")` and name validators after the invariant.
- Add a validator docstring only when its name cannot carry the invariant.
- Convert wire DTOs at the boundary with `to_domain()` and `from_*()` methods or one explicit adapter.

Request and response DTOs belong to their boundary. Boundary-local types stay with their boundary owner; shapes shared across boundaries have one domain owner.
