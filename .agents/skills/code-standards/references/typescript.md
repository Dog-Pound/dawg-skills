# TypeScript Standards

TypeScript-specific mechanics. Existing projects tighten compiler flags through an explicit migration.

## Contracts

Enable `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` for new projects.

Use `unknown` at untyped boundaries and narrow immediately. An unavoidable `any` or non-null assertion gets a one-line reason that states the external invariant.

Use `type` for unions and aliases. Use `interface` for declaration merging or an intentionally extendable object contract. Express privacy with module scope and the repository's established native `private` or `#` mechanism.

## State

Model mutually exclusive states with discriminated unions instead of contradictory booleans and optional fields.

```ts
type QueryState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

Validate API and persisted data at the fetch or storage boundary with the installed schema tool or a small typed parser.

Use the repository's formatter, linter, package manager, and supported Node version. Tooling changes are separate decisions.
