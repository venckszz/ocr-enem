import { z } from 'zod';
import { OFFICIAL_SCORES } from '../../../shared/contracts.js';

const officialScoreSchema = z.number().refine(
  (score) => (OFFICIAL_SCORES as readonly number[]).includes(score),
  'A nota deve pertencer à escala oficial do ENEM.',
);

const deductionSchema = z.object({
  ok: z.boolean().optional(),
  falhas: z.number().int().nonnegative().optional(),
  pts_perdidos: z.number().nonnegative().default(0),
  obs: z.string().max(300).optional(),
  exemplos: z.array(z.string().max(80)).max(3).optional(),
});

export const competencyEvaluationSchema = z.object({
  competency: z.number().int().min(1).max(5),
  score: officialScoreSchema,
  positive: z.string().min(1).max(600),
  improvement: z.string().min(1).max(600),
  deductions: z.record(deductionSchema),
});

export const essayEvaluationSchema = z.object({
  competencies: z.array(competencyEvaluationSchema).length(5),
  totalScore: z.number().int().min(0).max(1000),
  summary: z.string().min(1).max(1200),
  nextSteps: z.array(z.string().min(1).max(300)).min(1).max(5),
}).superRefine((value, context) => {
  const expected = value.competencies.reduce((sum, item) => sum + item.score, 0);
  if (value.totalScore !== expected) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['totalScore'],
      message: `Total ${value.totalScore} difere da soma ${expected}.`,
    });
  }
  const unique = new Set(value.competencies.map((item) => item.competency));
  if (unique.size !== 5) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['competencies'], message: 'As cinco competências são obrigatórias.' });
  }
});

export const ocrPayloadSchema = z.object({
  text: z.string().min(1),
  pageTexts: z.array(z.string()),
  estimatedConfidence: z.number().min(0).max(1),
  qualityWarnings: z.array(z.string()).max(8),
});

export type ValidEssayEvaluation = z.infer<typeof essayEvaluationSchema>;
