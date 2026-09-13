import { describe, expect, it } from 'vitest';
import type { EssayEvaluation, OfficialScore } from '../../../shared/contracts.js';
import { buildConsensus } from './consensus.js';

const makeEvaluation = (scores: OfficialScore[]): EssayEvaluation => ({
  competencies: scores.map((score, index) => ({
    competency: (index + 1) as 1 | 2 | 3 | 4 | 5,
    score,
    positive: 'Ponto forte.',
    improvement: 'Melhoria.',
    deductions: {},
  })),
  totalScore: scores.reduce((sum, score) => sum + score, 0),
  summary: 'Resumo.',
  nextSteps: ['Revisar.'],
});

describe('buildConsensus', () => {
  it('seleciona a mediana e informa a faixa de notas', () => {
    const result = buildConsensus([
      makeEvaluation([160, 160, 120, 200, 160]),
      makeEvaluation([200, 160, 160, 200, 160]),
      makeEvaluation([160, 120, 160, 160, 200]),
    ]);
    expect(result.evaluation.competencies.map((item) => item.score)).toEqual([160, 160, 160, 200, 160]);
    expect(result.reliability.totalRange).toEqual([800, 880]);
  });
});
