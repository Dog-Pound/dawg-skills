# TanStack React Query Testing Standards

Use `renderHook` with a fresh `QueryClientProvider` configured with `retry: false` and `staleTime: 0`. Assert observable hook data and cache behavior, not internal method calls.

```ts
const { result } = renderHook(() => useItems(), { wrapper: Wrapper });
await waitFor(() => expect(result.current.isSuccess).toBe(true));
expect(result.current.data).toEqual(expectedItems);
```
