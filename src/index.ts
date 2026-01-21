import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingsFile, SearchResult } from './types.js';
import { searchChunks } from './search.js';

const EMBEDDINGS_PATH = path.resolve('embeddings/embeddings.json');
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

async function executeSearch(query: string, limit = 5): Promise<{ results: SearchResult[] }> {
  if (!embeddings) throw new Error('Embeddings not loaded');
  if (!process.env.GOOGLE_API_KEY) throw new Error('Missing GOOGLE_API_KEY');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const embedModel = genAI.getGenerativeModel({ model: embeddings.model });
  const embedResp = await embedModel.embedContent(query.slice(0, 2000));
  const queryEmbedding = embedResp.embedding.values;
  const results: SearchResult[] = searchChunks(embeddings.chunks, queryEmbedding, limit);
  return { results };
}

async function main() {
  await loadEmbeddings();
  if (!embeddings) {
    console.error('No embeddings loaded. Please run `npm run build:embeddings` first.');
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
