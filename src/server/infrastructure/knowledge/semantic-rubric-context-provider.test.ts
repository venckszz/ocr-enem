import { describe, expect, it, vi } from 'vitest';
import type { EmbeddingProvider } from '../../application/ports/embedding-provider.js';
import { SemanticRubricContextProvider } from './semantic-rubric-context-provider.js';

describe('SemanticRubricContextProvider', () => {
  it('retorna âncoras semanticamente mais próximas e mantém cache', async () => {
    const embed = vi.fn()
      .mockResolvedValueOnce(Array.from({ length: 12 }, (_, index) => index === 8 ? [1, 0] : [0, 1]))
      .mockResolvedValue([ [1, 0] ]);
    const provider = new SemanticRubricContextProvider({ model: 'fake', embed } satisfies EmbeddingProvider, 1);

    const first = await provider.findRelevant('proposta de intervenção', 'tema');
    const second = await provider.findRelevant('agente e ação', 'tema');

    expect(first[0]).toContain('Competência V');
    expect(second[0]).toContain('Competência V');
    expect(embed).toHaveBeenCalledTimes(3);
  });

  it('não bloqueia a avaliação quando embeddings falham', async () => {
    const embeddings = {
      model: 'fake',
      embed: vi.fn().mockRejectedValue(new Error('offline')),
    } satisfies EmbeddingProvider;
    const provider = new SemanticRubricContextProvider(embeddings);

    await expect(provider.findRelevant('texto')).resolves.toEqual([]);
  });
});
