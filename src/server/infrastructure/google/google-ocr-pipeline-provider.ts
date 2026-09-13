import type { OcrResult } from '../../../shared/contracts.js';
import type { OcrDocument, OcrProvider } from '../../application/ports/ocr-provider.js';
import type { OcrRefiner } from '../../application/ports/ocr-refiner.js';

export class GoogleOcrPipelineProvider implements OcrProvider {
  constructor(
    private readonly primary: OcrProvider,
    private readonly refiner: OcrRefiner,
    private readonly refineThreshold: number,
  ) {}

  async extract(documents: OcrDocument[]): Promise<OcrResult> {
    let firstReading: OcrResult | undefined;
    try {
      firstReading = await this.primary.extract(documents);
      if (firstReading.estimatedConfidence >= this.refineThreshold) return firstReading;
    } catch {
      firstReading = undefined;
    }
    return this.refiner.refine(documents, firstReading ? [firstReading] : []);
  }
}
