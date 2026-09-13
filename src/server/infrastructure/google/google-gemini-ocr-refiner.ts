import { z } from 'zod';
import type { OcrResult } from '../../../shared/contracts.js';
import type { OcrDocument, OcrProvider } from '../../application/ports/ocr-provider.js';
import type { OcrRefiner } from '../../application/ports/ocr-refiner.js';
import { parseModelJson } from '../model/parse-model-json.js';
import { buildHandwritingOcrPrompt } from '../prompts/handwriting-ocr-prompt.js';
import { GoogleApiClient } from './google-api-client.js';

const refinedOcrSchema = z.object({
  pageTexts: z.array(z.string()).min(1).max(10),
  estimatedConfidence: z.number().min(0).max(1),
  uncertainSegments: z.array(z.string().max(100)).max(8).default([]),
});

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  promptFeedback?: { blockReason?: string };
};

export class GoogleGeminiOcrRefiner implements OcrRefiner, OcrProvider {
  constructor(
    private readonly client: GoogleApiClient,
    private readonly model: string,
  ) {}

  extract(documents: OcrDocument[]) {
    return this.refine(documents, []);
  }

  async refine(documents: OcrDocument[], candidates: OcrResult[]): Promise<OcrResult> {
    const auxiliary = candidates.map((candidate) => ({ model: candidate.model, pageTexts: candidate.pageTexts }));
    const payload = await this.client.post<GeminiResponse>(
      this.client.generativeModelUrl(this.model, 'generateContent'),
      {
        contents: [{
          role: 'user',
          parts: [
            { text: buildHandwritingOcrPrompt(auxiliary) },
            ...documents.map((document) => ({
              inlineData: { mimeType: document.mimeType, data: document.data.toString('base64') },
            })),
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5000,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      90_000,
    );

    const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!raw) throw new Error(`Gemini não retornou transcrição${payload.promptFeedback?.blockReason ? `: ${payload.promptFeedback.blockReason}` : '.'}`);
    const refined = refinedOcrSchema.parse(parseModelJson<unknown>(raw));
    const pageTexts = documents.map((_, index) => refined.pageTexts[index]?.trim() ?? '');

    return {
      text: pageTexts.filter(Boolean).join('\n\n'),
      pageTexts,
      estimatedConfidence: refined.estimatedConfidence,
      qualityWarnings: refined.uncertainSegments.length > 0
        ? [`Revise ${refined.uncertainSegments.length} trecho(s): ${refined.uncertainSegments.slice(0, 3).join(' · ')}`]
        : [],
      model: `${this.model}${candidates.length > 0 ? ` + ${candidates.map((item) => item.model).join(' + ')}` : ''}`,
      method: 'hybrid',
    };
  }
}
