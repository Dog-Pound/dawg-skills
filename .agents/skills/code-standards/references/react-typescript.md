# React / TypeScript Standards

Applies on top of [`common.md`](common.md) (code) and [`testing.md`](testing.md) (tests). Wins for React/TypeScript mechanics only — link § upstream, never restate.

## TypeScript compiler strictness

`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.

## No `any`

Use `unknown` and narrow. If you must use `any`, comment why → [`common.md §Comments explain why`](common.md#comments-explain-why-not-what). `any` erases the signal a signature carries — see [`common.md §Names and types tell the story`](common.md#names-and-types-tell-the-story).

## No uncommented non-null assertions

No non-null assertions (`!`) without a comment. Prefer narrowing.

```text
// bad
const name = user!.name;

// good: narrow instead
if (!user) throw new Error("user required");
const name = user.name;

// acceptable: comment explains why null is impossible
const el = document.getElementById("root")!; // mounted in index.html, always present
```

## `type` vs `interface`

Prefer `type` for unions and aliases; `interface` for object shapes that may be extended.

## Discriminated unions for state

Model state machines as discriminated unions, not loose booleans and optional fields.

```text
// bad
interface QueryResult<T> {
  isLoading: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}

// good
type QueryState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

## Validate at boundaries

Validate API responses at the fetch boundary with the project's installed schema tool, such as `zod` or `valibot`. See [`common.md §No raw dicts, no magic strings`](common.md#no-raw-dicts-no-magic-strings).

## `readonly` and `as const`

Use `readonly` and `as const` where mutation is not part of the contract.

## Hooks pattern (default)

Custom hooks are the primary mechanism for sharing cross-cutting logic. If you are tempted to write a HOC or render prop for logic sharing, write a custom hook instead.

```text
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
```

## Container / Presentational

A component is either smart (data-aware) or dumb (pure UI). Not both.

- **Presentational**: receives props, renders UI, no data fetching, no global state access. Easy to test and Storybook.
- **Container** (or hook): fetches data, manages state, passes props down.

In modern React, the "container" is usually a custom hook paired with a presentational component:

```text
// features/users/useUserList.ts (container logic)
export function useUserList() {
  return useQuery({ queryKey: userKeys.list(), queryFn: fetchUsers });
}

// features/users/UserList.tsx (presentational)
export function UserList({ users }: { users: User[] }) {
  return <ul>{users.map(u => <UserCard key={u.id} user={u} />)}</ul>;
}

// features/users/UserListPage.tsx (composition)
export function UserListPage() {
  const { data, isLoading } = useUserList();
  if (isLoading) return <UserListSkeleton />;
  return <UserList users={data ?? []} />;
}
```

### The hard rule: component files contain JSX and nothing else

All non-trivial logic must be extracted out of component files:

- **Pure functions** (formatters, sorters, derivations, validators) go in `lib/` with descriptive module names (e.g., `lib/formatCurrency.ts`, `lib/itemSort.ts`).
- **Stateful logic** (hooks that manage state, data fetching, mutations, computed values) go in `hooks/` as custom hooks (e.g., `hooks/useItems.ts`, `hooks/useFileUpload.ts`).
- **The component file** imports from both and composes them into JSX.

A component file that contains `function formatAmount(...)` or `function defaultSort(...)` or inline `useMemo` with 10+ lines of derivation logic is a violation. Extract it.

## Provider pattern

Use React Context for truly cross-cutting concerns: theme, auth, i18n, feature flags.

Rules:

- Always pair `createContext` with a custom hook that throws outside the provider.
- Memoize the provider's `value` to prevent cascade re-renders.
- Do **not** use Context as a general state manager — it re-renders all consumers on every change.
- For server state: TanStack Query / SWR. For complex client state: Zustand / Jotai.

```text
const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Single `Providers` wrapper

Compose all context providers into a single `Providers` component. `main.tsx` uses only `<Providers><App /></Providers>` — never a growing stack of nested providers wrapping `<App />`.

```text
// components/Providers.tsx
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
```

## Compound components

For multi-part coordinated UI (Tabs, Menu, Accordion, Select):

- Share state via internal Context.
- Expose subcomponents as static properties for discoverability.
- Prefer headless-UI libraries (Radix, Headless UI, Ark) that implement this pattern.

```text
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="profile">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```

## HOC pattern — legacy only

Use HOCs only when integrating with libraries that require them. Otherwise, prefer hooks.

## Render props — narrow use

Use render props only when the consumer needs to control rendering of content the wrapper produces (e.g., virtualized lists, downshift). Not for logic sharing.

## JS/TS design patterns

Prefer composition over pattern catalogs — see [`common.md §No over-engineering`](common.md#no-over-engineering). ES modules and plain functions are the default; reach for named patterns only when a library or framework requires them.

| Pattern | Use | Avoid |
|---|---|---|
| **Singleton** | Almost never. If needed, expose a factory + inject. | Hidden global state that breaks tests |
| **Observer** | Typed event emitters (`mitt`, `nanoevents`), signals | Hand-rolled pub/sub |

## Project structure and file placement

These rules enforce a hard separation between rendering, logic, types, constants, and assets. Every artifact has one canonical home.

### `types/` — all exported types

All exported TypeScript types and interfaces live in `types/`, organized by domain (e.g., `types/user.ts`, `types/filters.ts`). If a type is used by more than one file or is part of a module's public contract, it belongs here. File-local types that are not exported and only used within a single file are exempt.

### `constants/` — all constants

Constants (label maps, priority maps, color maps, configuration values, magic numbers) never live in component files. All constants live in `constants/`, organized by domain (e.g., `constants/health.ts`, `constants/session.ts`). Search before adding a new one → [`common.md §DRY`](common.md#dry--repetition-is-a-red-flag).

**Exception:** Query key factories stay in `api/` — they are TanStack Query cache contracts, not display constants. See `tanstack-query.md`.

### `hooks/` — all custom hooks

All custom React hooks live in the top-level `hooks/` directory, named by feature domain (e.g., `hooks/useItems.ts`, `hooks/useFileUpload.ts`). Hooks are never co-located inside feature or component folders. This enforces a hard boundary between stateful logic and rendering.

### `lib/` — all pure helper functions

Pure functions (formatters, sorters, derivations, validators) live in `lib/` with descriptive module names (e.g., `lib/formatCurrency.ts`, `lib/itemSort.ts`). Never name a file `utils.ts` — use a name that describes what the functions do.

### `components/icons/` — all icons

No inline SVG in component files. All icons are defined as named React components in `components/icons/`:

```text
// components/icons/ChevronDown.tsx
export function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" ... />
    </svg>
  );
}
```

If using a third-party icon library (lucide-react, heroicons), prefer it over custom SVGs. Custom icons are acceptable but must be centralized here.

### `components/ui/` — atomic, reusable UI primitives

Design-system-level components (Button, Badge, Chip, ChipGroup, Avatar, Input, Select) live in `components/ui/`. If a component is generic enough to appear in multiple features, it belongs here.

### `features/<name>/` — feature-specific composed components

Feature-specific components that compose UI primitives with feature hooks. → [§The hard rule](#the-hard-rule-component-files-contain-jsx-and-nothing-else).

## Component size and extraction

### Extraction triggers

- **Reusable UI pattern detected:** If a component contains UI elements that could appear in other features (chips, badges, avatars, collapsible items), extract to `components/ui/` regardless of file size.
- **File exceeds ~100 lines of JSX:** Split into sub-components in sibling files within the same feature folder.
- **Embedded logic:** If a component defines helper functions, constants, or complex `useMemo`/`useEffect` blocks inline, extract per the file placement rules above.

### Loading states: skeletons, not text

All loading states use skeleton/shimmer components that match the expected content layout. Never render text-only placeholders like `"Loading..."` in data-driven components.

```text
// bad
if (isLoading) {
  return <div>Loading items...</div>;
}

// good
if (isLoading) {
  return <ItemsTableSkeleton />;
}
```

## Performance

- `React.memo` only for components that re-render often with stable props.
- `useMemo` / `useCallback` only when the cost is measurable. Premature memoization adds complexity.
- **List virtualization** (`@tanstack/react-virtual`) for lists > ~200 items.
- **Code splitting** via `React.lazy` + `Suspense` at route boundaries.
- **Debounce/throttle** user input that triggers network or expensive computation.
- Keep component trees shallow. Lift state only as far as needed (state colocation).
- **Stable keys** in lists — never array index for reorderable lists.

## Data fetching

Use **TanStack Query** (or SWR) for all server state. Query key factories, invalidation rules, zod validation → [`tanstack-query.md`](tanstack-query.md).

## Frontend testing

Test behavior, not implementation. See `testing.md` for the `assert result == expected` discipline.

- Query by role/text, not class names or test IDs.
- Each component: render test, key interaction test, accessibility check (`axe`).
- Hooks: test with `renderHook` from Testing Library.
- API mocking: **MSW** (same handlers for dev, Storybook, and tests).
- E2E: **Playwright**, one happy path per critical user journey.
- `data-testid` is a last resort, not a first choice.

## Tooling

Prettier + ESLint (`@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import`), pnpm, Node ≥20 LTS.
