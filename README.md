
# SnapKit Blueprint MCP

A Model Context Protocol (MCP) server for semantic search over architectural guidelines and implementation rules. Part of the [SnapKit](https://github.com/gufoscuro/snapkit) ecosystem.

## Relationship with SnapKit

This MCP server is designed to work alongside **SnapKit**, an AI-assisted customization framework built on SvelteKit. While SnapKit provides the runtime architecture (page registry, component discovery, state sharing), this server exposes the **architectural knowledge** to AI agents.

When integrated with Claude Code or other MCP-compatible tools, AI assistants can query implementation patterns, component guidelines, and architecture decisions—enabling them to generate code that follows SnapKit conventions without manual context sharing.

See the [SnapKit MCP Server Ecosystem](https://github.com/gufoscuro/snapkit#mcp-server-ecosystem) for how this fits into the broader tooling.

## Features

- Semantic search over markdown documentation
- Embedding generation using Google Gemini API
- Fast in-memory vector search
- Configurable content directory for custom documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```bash
GOOGLE_API_KEY=your_api_key_here
CONTENT_DIR=/path/to/your/docs  # Optional
```

3. Generate embeddings:
```bash
npm run build:embeddings
```

4. Build the project:
```bash
npm run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key for generating and querying embeddings |
| `CONTENT_DIR` | No | Path to the folder containing markdown documentation. Defaults to `./content` |
| `EMBEDDINGS_PATH` | No | Path to the embeddings JSON file. Defaults to `./embeddings/embeddings.json` |

### Using a Custom Content Directory

You can point to any folder containing markdown files:

```bash
# Using an environment variable
CONTENT_DIR=/path/to/snapkit/.blueprints npm run build:embeddings

# Or in your .env file
CONTENT_DIR=/path/to/snapkit/.blueprints
```

The folder must exist, otherwise the embedding generation will fail with an error.

## Usage with Claude Code

Add this MCP server to your Claude Code configuration (`~/.config/claude-code/mcp_config.json`):

```json
{
  "mcpServers": {
    "snapkit-blueprint": {
      "command": "node",
      "args": [
        "/path/to/snapkit-blueprint-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Alternatively, link it globally:

```bash
# In this repository
npm link

# Then in your MCP config:
{
  "mcpServers": {
    "snapkit-blueprint": {
      "command": "npx",
      "args": ["snapkit-blueprint-mcp"],
      "env": {
        "GOOGLE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

After configuring, restart Claude Code. The `search_blueprint` tool will be available.

## Project Structure

```
├── content/           # Default markdown documentation
├── embeddings/        # Generated embeddings (auto-created)
├── scripts/           # Embedding generation script
└── src/               # MCP server and search logic
```
