import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const DEFAULT_CONTENT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../content');
const CONTENT_DIR = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : DEFAULT_CONTENT_DIR;
const OUTPUT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../embeddings/embeddings.json');
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

async function validateContentDir(): Promise<void> {
  try {
    const stat = await fs.stat(CONTENT_DIR);
    if (!stat.isDirectory()) {
      console.error(`CONTENT_DIR is not a directory: ${CONTENT_DIR}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`CONTENT_DIR does not exist: ${CONTENT_DIR}`);
    process.exit(1);
  }
}

function splitMarkdownByHeadings(content: string): { text: string, headings: string[], section: string }[] {
  // Simple splitter: splits by H2 (##) and includes parent H1
  const lines = content.split(/\r?\n/);
  let currentH1 = '';
  let currentSection = '';
  let buffer: string[] = [];
  let results: { text: string, headings: string[], section: string }[] = [];
  for (const line of lines) {
    if (line.startsWith('# ')) {
      currentH1 = line.replace('# ', '').trim();
      currentSection = currentH1;
      buffer = [];
    } else if (line.startsWith('## ')) {
      if (buffer.length > 0) {
        results.push({ text: buffer.join('\n').trim(), headings: [currentH1], section: currentSection });
      }
      currentSection = line.replace('## ', '').trim();
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) {
    results.push({ text: buffer.join('\n').trim(), headings: [currentH1], section: currentSection });
  }
  return results;
}


// Recursively find all .md files in a directory
async function findMarkdownFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function getEmbedding(text: string): Promise<number[]> {
  const resp = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: text }),
  });
  if (!resp.ok) {
    throw new Error(`Ollama embed failed (${resp.status}): ${await resp.text()}`);
  }
  const data = await resp.json() as { embeddings: number[][] };
  return data.embeddings[0];
}

async function main() {
  await validateContentDir();
  const files = await findMarkdownFiles(CONTENT_DIR);
  const chunks = [];
  for (const filePath of files) {
    const file = path.relative(CONTENT_DIR, filePath);
    const content = await fs.readFile(filePath, 'utf8');
    const sections = splitMarkdownByHeadings(content);
    for (const section of sections) {
      if (!section.text.trim()) continue;
      // Truncate to ~500 tokens (2000 chars)
      const chunkText = section.text.slice(0, 2000);
      const embedding = await getEmbedding(chunkText);
      chunks.push({
        id: uuidv4(),
        content: chunkText,
        embedding,
        metadata: {
          file,
          section: section.section,
          headings: section.headings
        }
      });
    }
  }
  const output = {
    chunks,
    model: MODEL,
    generated_at: new Date().toISOString()
  };
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${chunks.length} chunks to ${OUTPUT_PATH}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
