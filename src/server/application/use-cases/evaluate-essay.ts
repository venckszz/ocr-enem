import type { EvaluationResponse } from '../../../shared/contracts.js';
import { buildConsensus } from '../../domain/services/consensus.js';
import type { EvaluationProvider } from '../ports/evaluation-provider.js';
import type { RubricContextProvider } from '../ports/rubric-context-provider.js';

export type EvaluateEssayInput = { text: string; theme?: string; auditMode: boolean };

export class EvaluateEssay {
  constructor(
    private readonly evaluationProvider: EvaluationProvider,
    private readonly rubricContextProvider?: RubricContextProvider,
  ) {}

  async execute(input: EvaluateEssayInput): Promise<EvaluationResponse> {
    const text = input.text.trim();
    if (text.length < 80) throw new Error('Texto muito curto para uma correção ENEM confiável.');
    const passes = input.auditMode ? [0, 1, 2] : [0];
    const rubricContext = this.rubricContextProvider
      ? await this.rubricContextProvider.findRelevant(text, input.theme)
      : [];
    const evaluations = await Promise.all(
      passes.map((pass) => this.evaluationProvider.evaluate(text, input.theme?.trim() || undefined, pass, rubricContext)),
    );
    const result = buildConsensus(evaluations);
    return { ...result, model: this.evaluationProvider.model };
  }
}
