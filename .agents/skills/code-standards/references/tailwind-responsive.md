# Responsive Tailwind Standards

## Mobile first

Unprefixed utilities define the smallest screen; breakpoint prefixes progressively enhance larger screens.

```html
<nav class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">…</nav>
```

## Parent owns layout

Parents own `flex`, `grid`, gaps, justification, and alignment. Children own sizing and self-alignment. Reusable components expose a caller-controlled styling hook so their parent can size them without coupling the child to its layout.

```html
<div class="flex items-center justify-between gap-4">
  <Logo />
  <SearchBar class="max-w-md flex-1" />
</div>
```

## Flex sizing

- `flex-1` starts at zero and divides available space proportionally.
- `flex-auto` starts at content size, so larger content receives more space.
- A sticky flex child needs `self-start` to avoid stretching to its container height.

## Spacing and width

- Put `gap-*` on flex/grid parents instead of margins on children.
- Put readability bounds such as `max-w-*` and `max-w-prose` on the container.
- Use Tailwind's spacing scale; use arbitrary values for external specifications.

## Themes and visibility

Cover each themed surface with the project's dark-mode strategy. Use CSS custom properties when they express a complex theme more directly than repeated utility pairs.

Use `hidden` with a breakpoint display utility for responsive visibility. Mobile overlays that become inline panels reset `fixed` or `absolute` positioning to `static` at the breakpoint.
