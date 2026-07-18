# TanStack Query Standards

Applies on top of [react-typescript.md](react-typescript.md).

## Query keys

Query-key factories are API cache contracts. Keep one `queryKeys` object per API domain under `api/`; split by domain when that file grows. Use `as const` for arrays and the factory object.

```ts
export const queryKeys = {
  items: ["items"] as const,
  item: (id: string) => ["item", id] as const,
} as const;
```

Keys are resource-named. `['items']` does not invalidate `['item', id]`; mutations invalidate every related key explicitly.

## Hooks

Query and mutation hooks wrap `useQuery` and `useMutation` under `hooks/`; derived types follow [react-typescript.md](react-typescript.md). Name query hooks `use<Resource>` or `use<Resource>List` and mutations `useAdd<Resource>`, `useUpdate<Resource>`, or `useDelete<Resource>`.

```ts
export function useItems() {
  return useQuery({ queryKey: queryKeys.items, queryFn: listItems });
}
```

## Mutations

Default to invalidation. Use optimistic updates only when the interaction must feel immediate.

Cache callbacks belong in the hook. UI effects such as toasts or closing a modal belong in the component's `mutate` callback.

```ts
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItem,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.item(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
}
```

## QueryClient

Create the `QueryClient` in the application's provider module and pass it through `QueryClientProvider`. Keep its defaults in that same owner.

## Tests

Use `renderHook` with a fresh `QueryClientProvider` configured with `retry: false` and `staleTime: 0`. Assert observable hook data and cache behavior, not internal method calls.

```ts
const { result } = renderHook(() => useItems(), { wrapper: Wrapper });
await waitFor(() => expect(result.current.isSuccess).toBe(true));
expect(result.current.data).toEqual(expectedItems);
```
