# Python Standards

Python-specific mechanics. Repository configuration owns supported versions and tooling.

## Closed value sets

Use `enum.StrEnum` on Python 3.11+ or `enum.Enum` when values cross module boundaries, exist at runtime, or may gain behavior. Use `Literal[...]` for local type narrowing without a runtime value object.

## Behavior contracts

Use `abc.ABC` and `@abstractmethod` for owned runtime polymorphism. Use `Protocol` for structural contracts, especially third-party objects.

## Module ownership

Order modules for reading: imports, constants, public types and behavior, then private helpers near their owner.

When these concepts exist, give them direct owners named `models.py`, `dao.py`, `errors.py`, and `enums.py`. Create each file when it has behavior or contracts to own. Prefix private modules, constants, functions, attributes, and implementation details with `_`.

Keep settings and environment parsing in `config.py`; keep domain and runtime models in `models.py`, including models constructed from configuration input.

## Types

- Use builtin generics: `list[T]`, `dict[K, V]`, `tuple[T, ...]`.
- Accept `Any` only at an untyped edge; validate or narrow it immediately.
- Make every type variable inferable from an input or bound by its declaration.
