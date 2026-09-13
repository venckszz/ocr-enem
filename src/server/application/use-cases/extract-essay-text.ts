import type { OcrDocument, OcrProvider } from '../ports/ocr-provider.js';

export class ExtractEssayText {
  constructor(private readonly ocrProvider: OcrProvider) {}

  execute(documents: OcrDocument[]) {
    if (documents.length === 0) throw new Error('Envie ao menos uma imagem ou PDF.');
    return this.ocrProvider.extract(documents);
  }
}
