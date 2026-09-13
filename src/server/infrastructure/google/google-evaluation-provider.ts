import type { EssayEvaluation } from '../../../shared/contracts.js';
import type { EvaluationProvider } from '../../application/ports/evaluation-provider.js';
import { essayEvaluationSchema } from '../../domain/entities/essay-evaluation.js';
import { parseModelJson } from '../model/parse-model-json.js';
import { buildEvaluationMessages } from '../prompts/evaluation-prompt.js';
import { GoogleApiClient } from './google-api-client.js';

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  promptFeedback?: { blockReason?: string };
};

export class GoogleEvaluationProvider implements EvaluationProvider {
  readonly model: string;
  private readonly models: string[];

  constructor(
    private readonly client: GoogleApiClient,
    primaryModel: string,
    fallbackModels: string[] = [],
  ) {
    this.models = [...new Set([primaryModel, ...fallbackModels])];
    this.model = this.models.join(' → ');
  }

  async evaluate(text: string, theme: string | undefined, pass: number, rubricContext: string[]) {
    const [systemMessage, userMessage] = buildEvaluationMessages(text, theme, pass, rubricContext);
    let lastError: Error | undefined;
    for (const model of this.models) {
      try {
        const payload = await this.client.post<GeminiResponse>(
          this.client.generativeModelUrl(model, 'generateContent'),
          {
            systemInstruction: { parts: [{ text: systemMessage.content }] },
            contents: [{ role: 'user', parts: [{ text: userMessage.content }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 10_000,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingLevel: 'high' },
            },
          },
          240_000,
          2,
        );
        const raw = payload.candidates?.[0]?.content?.parts
          ?.filter((part) => !part.thought)
          .map((part) => part.text ?? '')
          .join('')
          .trim();
        if (!raw) throw new Error(`Gemini não retornou avaliação${payload.promptFeedback?.blockReason ? `: ${payload.promptFeedback.blockReason}` : '.'}`);
        return essayEvaluationSchema.parse(parseModelJson<unknown>(raw)) as EssayEvaluation;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }
    throw lastError ?? new Error('Nenhum modelo Google concluiu a avaliação.');
  }
}
