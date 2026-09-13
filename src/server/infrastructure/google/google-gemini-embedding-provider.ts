import type { EmbeddingProvider, EmbeddingTask } from '../../application/ports/embedding-provider.js';
import { GoogleApiClient } from './google-api-client.js';

type EmbeddingResponse = { embeddings?: Array<{ values?: number[] }> };

export class GoogleGeminiEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly client: GoogleApiClient,
    readonly model: string,
  ) {}

  async embed(texts: string[], task: EmbeddingTask): Promise<number[][]> {
    if (texts.length === 0) return [];
    const payload = await this.client.post<EmbeddingResponse>(
      this.client.generativeModelUrl(this.model, 'batchEmbedContents'),
      {
        requests: texts.map((text) => ({
          model: `models/${this.model}`,
          content: { parts: [{ text }] },
          taskType: task,
        })),
      },
      45_000,
    );
    const embeddings = payload.embeddings ?? [];
    if (embeddings.length !== texts.length || embeddings.some((item) => !item.values?.length)) {
      throw new Error('Gemini Embeddings retornou vetores incompletos.');
    }
    return embeddings.map((item) => item.values as number[]);
  }
}
