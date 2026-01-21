import { EmbeddingChunk, SearchResult } from './types.js';

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Embedding size mismatch');
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search for most relevant chunks
export function searchChunks(
  chunks: EmbeddingChunk[],
  queryEmbedding: number[],
  limit = 5
): SearchResult[] {
  const results = chunks.map(chunk => ({
    content: chunk.content,
    relevance_score: cosineSimilarity(chunk.embedding, queryEmbedding),
    metadata: chunk.metadata
  }));
  results.sort((a, b) => b.relevance_score - a.relevance_score);
  return results.slice(0, limit);
}
