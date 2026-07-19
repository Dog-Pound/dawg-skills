# TanStack React Query Standards

TanStack React Query cache, hook, and provider deltas.

## Query keys

Query-key factories are API cache contracts. Keep one factory per API domain beside that domain's API client. Use a shared root prefix so broad invalidation includes lists and details. Use `as const` for every key.

```ts
export const queryKeys = {
  all: ["items"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters: ItemFilters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
} as const;
```

Invalidate the narrowest prefix that restores consistency. `queryKeys.all` invalidates the whole domain; `queryKeys.lists()` leaves details intact.

## Hooks

Query and mutation hooks wrap `useQuery` and `useMutation` beside their domain owner. Name query hooks `use<Resource>` or `use<Resource>List` and mutations `useAdd<Resource>`, `useUpdate<Resource>`, or `useDelete<Resource>`.

```ts
export function useItems() {
  return useQuery({ queryKey: queryKeys.lists(), queryFn: listItems });
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
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() }),
      ]);
    },
  });
}
```

## QueryClient

Create one browser `QueryClient` in the application's provider module and pass it through `QueryClientProvider`. Server-rendered applications follow their framework's request-isolation pattern.
