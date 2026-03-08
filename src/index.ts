import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
dotenv.config({ debug: false });
import fs from 'fs/promises';
import path from 'path';
import { EmbeddingsFile, SearchResult } from './types.js';
import { searchChunks } from './search.js';

const EMBEDDINGS_PATH = process.env.EMBEDDINGS_PATH || path.resolve('embeddings/embeddings.json');
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
let embeddings: EmbeddingsFile | null = null;

async function loadEmbeddings() {
  try {
    const data = await fs.readFile(EMBEDDINGS_PATH, 'utf8');
    embeddings = JSON.parse(data);
  } catch (e) {
    console.error('Failed to load embeddings:', e);
    embeddings = null;
  }
}

async function getEmbedding(text: string, model: string): Promise<number[]> {
  const resp = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text }),
  });
  if (!resp.ok) {
    throw new Error(`Ollama embed failed (${resp.status}): ${await resp.text()}`);
  }
  const data = await resp.json() as { embeddings: number[][] };
  return data.embeddings[0];
}

async function executeSearch(query: string, limit = 5): Promise<{ results: SearchResult[] }> {
  if (!embeddings) throw new Error('Embeddings not loaded');
  const queryEmbedding = await getEmbedding(query.slice(0, 2000), embeddings.model);
  const results: SearchResult[] = searchChunks(embeddings.chunks, queryEmbedding, limit);
  return { results };
}

async function main() {
  await loadEmbeddings();
  if (!embeddings) {
    console.error('No embeddings loaded. Please run `npm run build:embeddings` first.');
    process.exit(1);
  }

  try {
    await fetch(`${OLLAMA_BASE_URL}/api/version`);
  } catch {
    console.error(`Ollama server not reachable at ${OLLAMA_BASE_URL}. Is it running? (ollama serve)`);
    process.exit(1);
  }

  const server = new Server(
    {
      name: 'snapkit-blueprint-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_blueprint',
        description: 'Semantic search over SnapKit architectural guidelines and implementation rules.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Number of results', default: 5 }
          },
          required: ['query']
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'search_blueprint') {
      const { query, limit = 5 } = request.params.arguments as { query: string; limit?: number };
      const result = await executeSearch(query, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
