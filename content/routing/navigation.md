# Navigation and Routing

## Creating Links to Pages

**IMPORTANT:** When creating links to pages in the application, you MUST ALWAYS use the route-builder utility instead of hardcoded URLs.

Use the `createRoute()` function from `$lib/utils/route-builder` to generate URLs programmatically. This provides:

- Type-safe route generation
- Centralized route management
- Prevention of broken links when routes change
- Automatic parameter interpolation and query string handling

See `@src/lib/utils/ROUTE-BUILDER.md` for complete documentation and examples.

## Basic Usage

```svelte
<script>
  import { createRoute } from '$lib/utils/route-builder'
</script>

<!-- Simple link -->
<a href={createRoute({ $id: 'order-list' })}>Orders</a>

<!-- Link with parameters -->
<a href={createRoute({ $id: 'order-detail', params: { uuid: orderId } })}>
  View Order
</a>

<!-- Link with query params -->
<a href={createRoute({ $id: 'order-list', query: { status: 'pending' } })}>
  Pending Orders
</a>
```

## What NOT to Do

**Never hardcode URLs like this:**

```svelte
<!-- ❌ WRONG -->
<a href="/orders">Orders</a>
<a href="/orders/{orderId}">View Order</a>
<a href="/orders?status=pending">Pending Orders</a>

<!-- ✅ CORRECT -->
<a href={createRoute({ $id: 'order-list' })}>Orders</a>
<a href={createRoute({ $id: 'order-detail', params: { uuid: orderId } })}>View Order</a>
<a href={createRoute({ $id: 'order-list', query: { status: 'pending' } })}>Pending Orders</a>
```

## Benefits

1. **Type Safety**: TypeScript ensures route IDs and parameters are correct
2. **Refactoring**: Changing route structure only requires updating the route builder
3. **Consistency**: All links use the same generation logic
4. **Parameters**: Automatic URL parameter interpolation
5. **Query Strings**: Built-in query parameter handling

## Advanced Usage

### Complex Routes with Multiple Parameters

```typescript
const url = createRoute({
  $id: 'order-item-detail',
  params: {
    orderId: '123',
    itemId: '456'
  },
  query: {
    view: 'compact',
    highlight: 'true'
  }
});
// Result: /orders/123/items/456?view=compact&highlight=true
```

### Programmatic Navigation

```typescript
import { goto } from '$app/navigation';
import { createRoute } from '$lib/utils/route-builder';

function navigateToOrder(orderId: string) {
  goto(createRoute({ $id: 'order-detail', params: { uuid: orderId } }));
}
```

### Hash Fragments

```typescript
const url = createRoute({
  $id: 'order-detail',
  params: { uuid: orderId },
  hash: 'comments'
});
// Result: /orders/{orderId}#comments
```

## Route IDs Reference

Refer to `ROUTE-BUILDER.md` for the complete list of available route IDs and their parameters.

## Best Practices

1. **Always use `createRoute()`** for internal links
2. **Never hardcode URLs** - they become brittle and hard to maintain
3. **Use descriptive route IDs** - they make code more readable
4. **Validate parameters** - ensure required params are provided
5. **Keep route definitions centralized** - in the route-builder utility
