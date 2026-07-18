# React and TypeScript Standards

Applies on top of [common.md](common.md) for code and [testing.md](testing.md) for tests. Existing repository structure and tooling win; these rules supply defaults where no owner exists.

## TypeScript contracts

Enable `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` for new projects. Existing projects tighten compiler flags through an explicit migration rather than hiding a large unrelated error set in a feature diff.

Use `unknown` at untyped boundaries and narrow immediately. An unavoidable `any` or non-null assertion gets a one-line reason that explains the external invariant.

Use `type` for unions and aliases. Use `interface` when declaration merging or an intentionally extendable object contract is required.

## State

Model mutually exclusive states with discriminated unions instead of contradictory booleans and optional fields.

```ts
type QueryState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

Keep state minimal: derive values during render, group values that always change together, and store identifiers instead of duplicate objects when practical. Lift state only to the nearest shared owner.

## Boundaries

Validate API and persisted data at the fetch/storage boundary with the project's installed schema tool or a small typed parser. Components receive typed data, not unchecked JSON.

Keep query and mutation behavior in the server-state owner already selected by the repository. When that owner is TanStack Query, load [tanstack-query.md](tanstack-query.md).

## Component ownership

Co-locate a component with its feature-specific types, constants, hooks, tests, and small pure helpers. Promote an artifact to a shared directory only after a second real owner appears or the repository already defines that shared layer.

A component may contain short rendering logic that is easiest to understand beside its JSX. Extract when logic:

- is reused;
- obscures the render path;
- owns independent state/effects;
- needs a separate public contract; or
- can be tested more clearly through a non-visual interface.

Name shared modules for their behavior. Avoid catch-all `utils.ts`, `helpers.ts`, global type buckets, and one-use hooks.

## Hooks

Use custom hooks to share stateful React behavior or isolate a cohesive effect lifecycle. A hook is not a destination for every local expression or `useMemo`; keep one-use logic with its component until extraction improves the interface.

Effects synchronize with external systems. Derived data belongs in render, and event-driven work belongs in event handlers.

## Context and providers

Use Context for stable cross-cutting state such as theme, auth, locale, or a library provider—not as a default state manager.

- Pair nullable contexts with a typed consumer hook that fails clearly outside the provider.
- Keep provider values stable when object identity would trigger avoidable consumer renders.
- Compose app-wide providers in one discoverable application boundary.

```tsx
const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider");
  return value;
}
```

Use compound components when several visual parts share one cohesive state contract. Prefer an installed accessible primitive library over hand-rolling focus management and keyboard behavior.

## Accessibility

- Start with semantic HTML and native controls.
- Give every control an accessible name and every form field a label.
- Preserve keyboard operation, visible focus, and focus restoration for overlays.
- Announce asynchronous errors and status changes when they are not otherwise apparent.
- Respect reduced-motion preferences and the project's contrast targets.

Accessibility behavior is part of the component contract and its tests.

## Async UI

Every data-driven surface defines loading, error, empty, and success behavior. Use a layout-matching skeleton when preserving page geometry matters; use concise status text when it is clearer and accessible. Keep prior data visible during background refresh when the product contract allows it.

## Performance

Measure before memoizing. Use `React.memo`, `useMemo`, `useCallback`, virtualization, and code splitting only for an observed cost or an established repository pattern. Stable list keys represent item identity; array indexes are valid only for static, never-reordered content.

## Tests

Test user-observable behavior through accessible queries.

- Prefer role, accessible name, label, and visible text over class selectors or test IDs.
- Test the important state transition, not one test per implementation branch.
- Test custom hooks through their public result when they own independent behavior.
- Mock at the network boundary with the repository's existing tool.
- Keep browser E2E for critical journeys that unit and integration tests cannot prove.

Use the repository's formatter, linter, package manager, and supported Node version. Adding or replacing tooling is a separate decision, not a side effect of a feature change.
