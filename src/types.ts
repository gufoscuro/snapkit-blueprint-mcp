// TypeScript types for SnapKit Blueprint MCP

export interface ChunkMetadata {
  file: string;
  section: string;
  headings: string[];
}

export interface EmbeddingChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
}

export interface EmbeddingsFile {
  chunks: EmbeddingChunk[];
  model: string;
  generated_at: string;
}

export interface SearchResult {
  content: string;
  relevance_score: number;
  metadata: ChunkMetadata;
}
