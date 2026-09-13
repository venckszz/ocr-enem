import { describe, expect, it, vi } from 'vitest';
import type { OcrResult } from '../../../shared/contracts.js';
import type { OcrDocument, OcrProvider } from '../../application/ports/ocr-provider.js';
import type { OcrRefiner } from '../../application/ports/ocr-refiner.js';
import { GoogleOcrPipelineProvider } from './google-ocr-pipeline-provider.js';

const document: OcrDocument = { data: Buffer.from('image'), filename: 'redacao.png', mimeType: 'image/png' };
const reading = (confidence: number): OcrResult => ({
  text: 'Texto transcrito',
  pageTexts: ['Texto transcrito'],
  estimatedConfidence: confidence,
  qualityWarnings: [],
  model: 'google',
  method: 'hybrid',
});

describe('GoogleOcrPipelineProvider', () => {
  it('aceita a primeira leitura confiável', async () => {
    const primary = { extract: vi.fn().mockResolvedValue(reading(0.9)) } satisfies OcrProvider;
    const refiner = { refine: vi.fn() } satisfies OcrRefiner;
    const provider = new GoogleOcrPipelineProvider(primary, refiner, 0.88);

    await expect(provider.extract([document])).resolves.toEqual(reading(0.9));
    expect(refiner.refine).not.toHaveBeenCalled();
  });

  it('refina a leitura de baixa confiança', async () => {
    const lowConfidence = reading(0.6);
    const refined = reading(0.94);
    const primary = { extract: vi.fn().mockResolvedValue(lowConfidence) } satisfies OcrProvider;
    const refiner = { refine: vi.fn().mockResolvedValue(refined) } satisfies OcrRefiner;
    const provider = new GoogleOcrPipelineProvider(primary, refiner, 0.88);

    await expect(provider.extract([document])).resolves.toEqual(refined);
    expect(refiner.refine).toHaveBeenCalledWith([document], [lowConfidence]);
  });
});
