import type { OcrResult } from '../../../shared/contracts.js';

export type OcrDocument = {
  mimeType: string;
  data: Buffer;
  filename: string;
};

export interface OcrProvider {
  extract(documents: OcrDocument[]): Promise<OcrResult>;
}
