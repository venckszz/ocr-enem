export type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

export interface EmbeddingProvider {
  readonly model: string;
  embed(texts: string[], task: EmbeddingTask): Promise<number[][]>;
}
