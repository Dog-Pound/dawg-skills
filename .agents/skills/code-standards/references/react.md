# React Standards

React-specific ownership, lifecycle, and UI rules.

## State and boundaries

Keep state minimal: derive values during render, group values that change together, and store identifiers instead of duplicate objects. Lift state only to the nearest shared owner.

Components receive validated, typed data. Keep server-state behavior in the repository's selected owner.

## Component ownership

Co-locate a component with its feature-specific types, constants, hooks, tests, and small pure helpers.

Extract rendering logic when it is reused, obscures the render path, owns independent state or effects, needs a public contract, or gains a clearer non-visual test seam. Name shared modules for their behavior; feature-owned helpers, types, and hooks remain with their feature until another owner appears.

## Hooks and providers

Use custom hooks to share stateful behavior or isolate a cohesive effect lifecycle. Effects synchronize with external systems; derived data belongs in render and event-driven work in handlers.

Use Context for stable cross-cutting state such as theme, auth, locale, or a library provider.

- Pair nullable contexts with a typed consumer hook that fails clearly outside the provider.
- Keep provider values stable when identity would trigger avoidable renders.
- Compose application-wide providers at one discoverable boundary.

Use compound components when several visual parts share one cohesive state contract. Prefer an installed accessible primitive over custom focus and keyboard machinery.

## User experience

- Start with semantic HTML and native controls.
- Give controls accessible names and form fields labels.
- Preserve keyboard operation, visible focus, and overlay focus restoration.
- Announce asynchronous errors and status changes when they are otherwise unapparent.
- Respect reduced motion and the repository's contrast targets.
- Define loading, error, empty, and success states for every data-driven surface.

Use a layout-matching skeleton when geometry matters and concise accessible status text when it does not. Keep prior data visible during background refresh when the product contract allows it.

## Performance

Measure before memoizing, virtualizing, or code splitting. Stable list keys represent item identity; array indexes fit only static, never-reordered content.
