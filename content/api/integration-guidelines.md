# API Integration Guidelines

## API Types Management

**IMPORTANT:** Do NOT define API response types locally within components. All API types must be centralized in `src/lib/types/api-types.ts`.

**Rules:**

1. **Never define API types inline** in components (e.g., `type OrderSummary = {...}`)
2. **Always add new API types** to `src/lib/types/api-types.ts`
3. **Import and reuse** types from the centralized location

**Example:**

```typescript
// ❌ WRONG - Don't define types locally in components
// src/lib/components/features/supply/SupplyOrdersTable.svelte
type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// ✅ CORRECT - Define in api-types.ts and import
// src/lib/types/api-types.ts
export type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// src/lib/components/features/supply/SupplyOrdersTable.svelte
import type { OrderSummary } from '$lib/types/api-types'
```

**Why:** This ensures type consistency across the application, enables reusability, and makes it easier to update types when the API changes.

## Using the API Request Utility

**CRITICAL:** Always use `apiRequest` from `$lib/utils/request.ts` instead of raw `fetch()`.

### Basic Usage

```typescript
import { apiRequest } from '$lib/utils/request';
import { createQueryRequestObject } from '$lib/utils/filters';
import type { OrderSummary } from '$lib/types/api-types';

// Simple GET request
const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order'
});

// With query parameters
const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order',
  queryParams: createQueryRequestObject(query)
});

// POST request
const newOrder = await apiRequest<OrderSummary>({
  url: 'sales/order',
  method: 'POST',
  body: orderData
});
```

### Error Handling

Always handle loading and error states when fetching data:

```typescript
let loading = $state(true);
let error = $state<string | null>(null);
let data = $state<OrderSummary[]>([]);

async function loadOrders() {
  loading = true;
  error = null;
  
  try {
    data = await apiRequest<OrderSummary[]>({
      url: 'sales/order'
    });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load orders';
  } finally {
    loading = false;
  }
}
```

## Discovering API Endpoints

Use the **arke MCP** to discover available API endpoints:

```typescript
// Use arke MCP tool: search_api
// Query: "list orders"
// Returns: Available endpoints with TypeScript types
```

**Workflow:**

1. **Search for endpoints**: Use natural language queries like "list customers", "create order", "update product"
2. **Review response types**: Examine the returned TypeScript types
3. **Add types to api-types.ts**: Centralize the types
4. **Implement the request**: Use `apiRequest` utility
5. **Handle states**: Implement loading, error, and success states

## Query Parameters and Filters

Use `createQueryRequestObject` from `$lib/utils/filters` to build query parameters:

```typescript
import { createQueryRequestObject } from '$lib/utils/filters';

const query = {
  status: 'pending',
  customer: customerId,
  dateFrom: startDate,
  dateTo: endDate
};

const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order',
  queryParams: createQueryRequestObject(query)
});
```

## Best Practices

1. **Always use TypeScript types** from `api-types.ts`
2. **Never use raw fetch()** - use `apiRequest` instead
3. **Handle all async states** - loading, error, success
4. **Use arke MCP** to discover endpoints before implementing
5. **Centralize types** - never define API types inline
6. **Use query builders** - leverage `createQueryRequestObject` for filters
