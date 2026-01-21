import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';

const CONTENT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../content');
const OUTPUT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../embeddings/embeddings.json');
const MODEL = 'text-embedding-004';

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

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error('Missing GOOGLE_API_KEY');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const embedModel = genAI.getGenerativeModel({ model: MODEL });
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
      // Gemini embedding API
      const embedResp = await embedModel.embedContent(chunkText);
      const embedding = embedResp.embedding.values;
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
