# Responsive Tailwind Standards

Applies on top of [react-typescript.md](react-typescript.md).

## Mobile first

Unprefixed utilities define the smallest screen; breakpoint prefixes progressively enhance larger screens.

```jsx
<nav className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">…</nav>
```

## Parent owns layout

Parents own `flex`, `grid`, gaps, justification, and alignment. Children own sizing and self-alignment. Accept `className` so a parent can size a child without coupling the child to its layout.

```jsx
<div className="flex items-center justify-between gap-4">
  <Logo />
  <SearchBar className="max-w-md flex-1" />
</div>
```

## Flex sizing

- `flex-1` starts at zero and divides available space proportionally.
- `flex-auto` starts at content size, so larger content receives more space.
- A sticky flex child needs `self-start` to avoid stretching to its container height.

```jsx
<div className="flex gap-6">
  <aside className="sticky top-20 w-64 shrink-0 self-start">Sidebar</aside>
  <main className="flex-1">…</main>
</div>
```

## Spacing and width

- Put `gap-*` on flex/grid parents instead of margins on children.
- Put readability bounds such as `max-w-*` and `max-w-prose` on the container.
- Use Tailwind's spacing scale; use arbitrary values only when an external specification requires them.

## Themes and responsive visibility

Cover each themed surface with the project's dark-mode strategy. For complex themes, prefer CSS custom properties over repeated utility pairs.

Use `hidden` with a breakpoint display utility for responsive visibility. For mobile overlays that become inline panels, use `fixed` or `absolute` by default and reset to `static` at the breakpoint.

```jsx
<aside className="fixed inset-0 z-40 bg-white md:static md:z-auto md:block md:bg-transparent">…</aside>
```
