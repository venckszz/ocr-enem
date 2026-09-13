export const OFFICIAL_SCORES = [0, 40, 80, 120, 160, 200] as const;
export type OfficialScore = (typeof OFFICIAL_SCORES)[number];

export type DeductionDetail = {
  ok?: boolean;
  falhas?: number;
  pts_perdidos: number;
  obs?: string;
  exemplos?: string[];
};

export type CompetencyNumber = 1 | 2 | 3 | 4 | 5;

export type CompetencyEvaluation = {
  competency: CompetencyNumber;
  score: OfficialScore;
  positive: string;
  improvement: string;
  deductions: Record<string, DeductionDetail>;
};

export type EssayEvaluation = {
  competencies: CompetencyEvaluation[];
  totalScore: number;
  summary: string;
  nextSteps: string[];
};

export type OcrResult = {
  text: string;
  pageTexts: string[];
  estimatedConfidence: number;
  qualityWarnings: string[];
  model: string;
  method: 'dedicated' | 'ensemble' | 'hybrid';
};

export type CompetencyConsensus = {
  competency: CompetencyNumber;
  selectedScore: OfficialScore;
  minScore: OfficialScore;
  maxScore: OfficialScore;
  agreement: number;
};

export type Reliability = {
  method: 'single-pass' | 'three-pass-consensus';
  label: 'não estimada' | 'baixa' | 'moderada' | 'alta';
  agreement: number | null;
  totalRange: [number, number] | null;
  competencies: CompetencyConsensus[];
  note: string;
};

export type EvaluationResponse = {
  evaluation: EssayEvaluation;
  reliability: Reliability;
  model: string;
};

export type ApiError = { error: string; details?: string };
