# MCP Servers Overview

This project uses multiple MCP servers. Use the appropriate one based on your task.

## Quick Reference

| MCP Server               | Purpose                            | When to Use                                                                    |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| **svelte**               | Svelte 5 & SvelteKit documentation | Language features, runes, routing, SvelteKit APIs                              |
| **shadcn-svelte**        | shadcn-svelte component docs       | Using/adding base UI components in `src/lib/components/ui/`                    |
| **shadcn-svelte-extras** | Extra components via jsrepo        | Advanced components not in core shadcn-svelte (Chat, Code, Emoji Picker, etc.) |
| **svelte-components**    | Feature component discovery        | Finding/creating components in `src/lib/components/features/`                  |
| **arke**                 | Backend API discovery              | Finding API endpoints and TypeScript types for data fetching                   |

## svelte MCP

Use for Svelte 5 and SvelteKit documentation.

**Tools:**

- **list-sections**: Discover available documentation sections. Use this FIRST when asked about Svelte/SvelteKit topics.
- **get-documentation**: Retrieve full documentation content. After `list-sections`, fetch ALL relevant sections based on use_cases.
- **svelte-autofixer**: Analyze Svelte code for issues. MUST use this whenever writing Svelte code - keep calling until no issues remain.
- **playground-link**: Generate a Svelte Playground link. Only use after user confirmation and NEVER if code was written to files.

## shadcn-svelte MCP

Use for **base UI components** in `src/lib/components/ui/`. These components should NOT be modified directly.

**Tools:**

- **shadcn-svelte-list**: List all available shadcn-svelte components, blocks, charts, and docs
- **shadcn-svelte-get**: Get detailed component documentation, installation commands, and code examples
- **shadcn-svelte-search**: Fuzzy search across shadcn-svelte components and docs
- **shadcn-svelte-icons**: Browse and search Lucide Svelte icons
- **bits-ui-get**: Access Bits UI component API documentation (shadcn-svelte is built on Bits UI)

**When to use:**

1. Understanding props/usage of base UI components (Button, Dialog, Card, etc.)
2. Adding a new shadcn component to the project → use `shadcn-svelte-get` for installation instructions
3. Finding icons → use `shadcn-svelte-icons`

## shadcn-svelte-extras MCP (jsrepo)

Use for **extra components** not included in core shadcn-svelte. These are community components from [shadcn-svelte-extras](https://www.shadcn-svelte-extras.com/).

**Available components include:** Avatar Group, Chat, Code Block, Emoji Picker, Field Set, File Tree, Tags Input, Terminal, and more.

**Tools:**

- **search**: Search for available extra components
- **get_block**: Get component documentation, code, and installation commands
- **list_blocks**: List all available extra components

**When to use:**

1. Need a component not available in core shadcn-svelte
2. Looking for advanced/specialized UI components (chat interfaces, code blocks, terminals, etc.)
3. Adding new extras to the project → use `npx jsrepo add @ieedan/shadcn-svelte-extras/<component>`

## svelte-components MCP

Use for **feature components** in `src/lib/components/features/`. This is where all custom project components live.

**Tools:**

- **list_components**: List all available feature components, optionally filtered by category
- **get_component**: Get detailed information about a specific component including props, types, and usage examples
- **search_components**: Search components by props, types, or functionality

**When to use:**

1. Discovering existing feature components before creating new ones
2. Understanding props and usage of custom project components
3. Finding components with specific functionality

## arke MCP

Use for **backend API discovery** when creating components that fetch or interact with data.

**Tools:**

- **search_api**: Search for API operations by natural language query. Returns matching endpoints with method, path, and TypeScript types.

**Parameters:**

- `query`: Natural language description (e.g., "list orders", "create customer", "update product")
- `namespace` (optional): Filter by API namespace (e.g., "sales-api", "supply-api", "product-api")
- `include_schemas`: Set to `true` to get raw JSON schemas in addition to TypeScript types

**Workflow for components that fetch data:**

1. **Search for relevant endpoints**: Use `search_api` to find endpoints that match your data needs
2. **Review the response types**: Use the returned TypeScript type definitions to type your component's data
3. **Implement the fetch call**: Use `apiRequest` from `$lib/utils/request.ts` (NOT raw `fetch`)
4. **Handle loading and error states**: Always account for async data fetching
