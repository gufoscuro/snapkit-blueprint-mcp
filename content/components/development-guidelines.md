# Component Development Guidelines

## Component File Locations

| Location                       | Contains                           | MCP Server        |
| ------------------------------ | ---------------------------------- | ----------------- |
| `src/lib/components/ui/`       | Base UI components (shadcn-svelte) | shadcn-svelte     |
| `src/lib/components/features/` | Feature/domain components          | svelte-components |

**Note:** Base UI components in `ui/` should NOT be modified directly. Always build feature components by composing them.

## Reuse and Composition First

Before creating a new component, you MUST:

1. **Check for existing components**: Use `svelte-components` MCP to search the codebase
2. **Consider composition**: Evaluate if combining existing components achieves the desired result
3. **Extend when appropriate**: If an existing component is close, prefer extending it over duplicating logic

**Decision flow:**

1. Can an existing component be used as-is? → Use it
2. Can existing components be composed together? → Compose them
3. Can an existing component be extended with new props/slots? → Extend it
4. Only if none of the above apply → Create a new component

## Creating New Feature Components

All newly created feature components MUST be placed in:

```
src/lib/components/features/
```

**Simple composed components** (combining existing UI components with minimal logic):

```
src/lib/components/features/<domain>/<ComponentName>.svelte
```

**New standalone components** (step 4 of decision flow - requires extensibility):

```
src/lib/components/features/<domain>/<ComponentName>/default/<ComponentName>.svelte
```

Examples:

- `src/lib/components/features/orders/OrderStatusBadge.svelte` - Simple composition of Badge
- `src/lib/components/features/orders/SalesOrdersList/default/SalesOrdersList.svelte` - Complex standalone component

### Barrel Files for Exports

For standalone components, create an `index.ts` file:

```typescript
// src/lib/components/features/orders/SalesOrdersList/index.ts
export { default as SalesOrdersList } from './default/SalesOrdersList.svelte';
export { default as SalesOrdersListCompact } from './default/SalesOrdersListCompact.svelte';
```

This enables clean imports:

```typescript
import { SalesOrdersList } from '$lib/components/features/orders/SalesOrdersList';
```

### Update the Components Registry

After creating new components, run:

```bash
npm run generate:components-registry
```

This automatically scans `src/lib/components/features/` and updates `src/generated/components-registry.ts`. Do NOT edit the registry file manually.

## Component Documentation

When creating a new component, add a descriptive comment block at the top:

```svelte
<!--
  @component OrderSummaryCard
  @description Displays a summary of an order including items, totals, and status.
  @keywords order, summary, card, checkout, invoice, receipt
  @uses Card, Badge, Separator
-->
```

## Variants vs Props

**Use a prop when:**

- The change is a simple toggle (e.g., `compact`, `bordered`, `disabled`)
- The variation affects only styling or minor layout adjustments
- The logic remains essentially the same
- You want consumers to switch between modes dynamically at runtime

**Use a variant file when:**

- The variation involves significantly different markup structure
- The variant has different data requirements or props
- The logic diverges substantially from the base component
- The variant is a specialized use case that most consumers won't need

**Examples:**

- `size="sm" | "md" | "lg"` → Use a prop (simple styling change)
- `SalesOrdersListCompact.svelte` → Use a variant (different column layout, omits details section)
