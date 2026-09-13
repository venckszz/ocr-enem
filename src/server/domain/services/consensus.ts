import type { EssayEvaluation, OfficialScore, Reliability } from '../../../shared/contracts.js';

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

export function buildConsensus(evaluations: EssayEvaluation[]): { evaluation: EssayEvaluation; reliability: Reliability } {
  if (evaluations.length === 1) {
    return {
      evaluation: evaluations[0],
      reliability: {
        method: 'single-pass',
        label: 'não estimada',
        agreement: null,
        totalRange: null,
        competencies: [],
        note: 'Uma única avaliação não permite estimar concordância entre corretores.',
      },
    };
  }

  const competencies = evaluations[0].competencies.map((first, index) => {
    const scores = evaluations.map((evaluation) => evaluation.competencies[index].score);
    const selectedScore = median(scores) as OfficialScore;
    const chosen = evaluations.find((evaluation) => evaluation.competencies[index].score === selectedScore)!
      .competencies[index];
    const agreement = scores.filter((score) => score === selectedScore).length / scores.length;
    return {
      chosen,
      consensus: {
        competency: first.competency,
        selectedScore,
        minScore: Math.min(...scores) as OfficialScore,
        maxScore: Math.max(...scores) as OfficialScore,
        agreement,
      },
    };
  });

  const agreement = competencies.reduce((sum, item) => sum + item.consensus.agreement, 0) / competencies.length;
  const totalScores = evaluations.map((evaluation) => evaluation.totalScore);
  const label = agreement >= 0.87 ? 'alta' : agreement >= 0.67 ? 'moderada' : 'baixa';
  const selectedCompetencies = competencies.map((item) => ({ ...item.chosen, score: item.consensus.selectedScore }));
  const evaluation = {
    ...evaluations[Math.floor(evaluations.length / 2)],
    competencies: selectedCompetencies,
    totalScore: selectedCompetencies.reduce((sum, item) => sum + item.score, 0),
  };

  return {
    evaluation,
    reliability: {
      method: 'three-pass-consensus',
      label,
      agreement,
      totalRange: [Math.min(...totalScores), Math.max(...totalScores)],
      competencies: competencies.map((item) => item.consensus),
      note: 'Faixa empírica de três correções independentes; não é intervalo de confiança estatístico.',
    },
  };
}
