
# SnapKit Blueprint MCP

A Model Context Protocol (MCP) server for semantic search over SnapKit architectural guidelines and implementation rules.

## Features
- Semantic search over markdown guidelines
- Embedding generation using Google Gemini API
- Fast in-memory vector search

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Google API key:
```bash
GOOGLE_API_KEY=your_api_key_here
```

3. Generate embeddings:
```bash
npm run build:embeddings
```

4. Build the project:
```bash
npm run build
```

## Usage with Claude Code

To use this MCP server from another repository with Claude Code, add it to your Claude Code MCP configuration file (`~/.config/claude-code/mcp_config.json`):

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

Alternatively, if you want to use it via npx, you can link it globally first:

```bash
# In this repository
npm link

# Then in your MCP config use:
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

After configuring, restart Claude Code. The `search_blueprint` tool will be available in your other repositories.

## Environment Variables
- `GOOGLE_API_KEY` (required for embedding generation)

## Project Structure
- `content/` - Markdown guidelines
- `embeddings/` - Generated embeddings
- `scripts/` - Embedding generation script
- `src/` - MCP server and search logic
