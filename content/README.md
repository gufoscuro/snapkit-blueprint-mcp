# SnapKit Blueprint Content Structure

This directory contains the implementation rules and guidelines for SnapKit, organized by domain for optimal semantic search.

## Directory Structure

```
snapkit-content/
├── mcp-servers/          # MCP server documentation and usage
│   └── overview.md       # All available MCP servers and their tools
├── components/           # Component development guidelines
│   ├── development-guidelines.md  # Component creation and organization
│   └── patterns.md                # Common component patterns (selectors, etc.)
├── api/                  # API integration guidelines
│   └── integration-guidelines.md  # API types, requests, error handling
└── routing/              # Navigation and routing patterns
    └── navigation.md     # Route builder usage and best practices
```

## File Descriptions

### MCP Servers

- **overview.md**: Complete reference for all MCP servers (svelte, shadcn-svelte, arke, etc.) including their tools and when to use them

### Components

- **development-guidelines.md**: Rules for creating, organizing, and documenting components. Covers file locations, composition patterns, and the decision flow for new components
- **patterns.md**: Specific patterns like selector components, with implementation examples

### API

- **integration-guidelines.md**: How to work with backend APIs, including type management, the apiRequest utility, error handling, and discovering endpoints with arke MCP

### Routing

- **navigation.md**: Using the route-builder utility for type-safe navigation, with examples and best practices

## Usage with MCP Server

These files are designed to be:

1. **Chunked** by heading sections during embedding generation
2. **Searched semantically** when Claude Code needs implementation guidance
3. **Updated independently** when rules change in specific domains

## Maintenance

When updating guidelines:

1. Edit the relevant markdown file
2. Run `npm run build:embeddings` to regenerate embeddings
3. Commit both the content and updated embeddings.json

## Semantic Search Examples

- "How do I create a new component?" → `components/development-guidelines.md`
- "How to fetch data from API?" → `api/integration-guidelines.md`
- "What MCP server should I use for icons?" → `mcp-servers/overview.md`
- "How to create links?" → `routing/navigation.md`
- "How to make a selector component?" → `components/patterns.md`
