import type { OcrResult } from '../../../shared/contracts.js';
import type { OcrDocument } from './ocr-provider.js';

export interface OcrRefiner {
  refine(documents: OcrDocument[], candidates: OcrResult[]): Promise<OcrResult>;
}
