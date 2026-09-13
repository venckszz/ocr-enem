import type { EssayEvaluation } from '../../../shared/contracts.js';

export interface EvaluationProvider {
  readonly model: string;
  evaluate(text: string, theme: string | undefined, pass: number, rubricContext: string[]): Promise<EssayEvaluation>;
}
