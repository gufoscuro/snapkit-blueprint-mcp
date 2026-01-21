# Component Patterns

## Creating Selector Components

Use the existing generic selector components:

- **Single selection**: `FormGenericSingleSelector` from `$lib/components/form/FormGenericSingleSelector.svelte`
- **Multi selection**: `FormGenericMultiSelector` from `$lib/components/form/FormGenericMultiSelector.svelte`

**Required implementation pattern:**

1. Define your entity type (from API)
2. Create an `optionMappingFunction` that maps your entity to `ExtendedOption`
3. Create a `fetchFunction` that fetches entities from the API
4. Pass these to the generic selector component

**Example**: See `src/lib/components/features/form/FormSelectorExample.svelte`

### Implementation Steps

1. **Define your entity type** (should come from `$lib/types/api-types.ts`):

```typescript
import type { Customer } from '$lib/types/api-types';
```

2. **Create the option mapping function**:

```typescript
const optionMappingFunction = (customer: Customer): ExtendedOption => ({
  value: customer.id,
  label: customer.name,
  // Add any additional fields needed for display
  metadata: {
    email: customer.email,
    status: customer.status
  }
});
```

3. **Create the fetch function**:

```typescript
import { apiRequest } from '$lib/utils/request';

const fetchCustomers = async (searchTerm: string): Promise<Customer[]> => {
  return await apiRequest<Customer[]>({
    url: 'sales/customers',
    queryParams: {
      search: searchTerm,
      limit: 50
    }
  });
};
```

4. **Use the generic selector**:

```svelte
<FormGenericSingleSelector
  {fetchFunction}
  {optionMappingFunction}
  placeholder="Select a customer"
  bind:value={selectedCustomerId}
/>
```

### Best Practices

- Always type your entities using types from `$lib/types/api-types.ts`
- Handle loading and error states within the fetch function
- Keep the option mapping function pure (no side effects)
- Use meaningful labels and include relevant metadata for display
- Consider implementing debouncing for search-heavy selectors
