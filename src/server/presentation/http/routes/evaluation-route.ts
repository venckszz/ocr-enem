import { Router } from 'express';
import { z } from 'zod';
import type { EvaluateEssay } from '../../../application/use-cases/evaluate-essay.js';

const requestSchema = z.object({
  text: z.string().min(1).max(30_000),
  theme: z.string().max(500).optional(),
  auditMode: z.boolean().default(false),
});

export function createEvaluationRouter(useCase: EvaluateEssay) {
  const router = Router();
  router.post('/', async (request, response, next) => {
    try {
      const input = requestSchema.parse(request.body);
      response.json(await useCase.execute(input));
    } catch (error) {
      next(error);
    }
  });
  return router;
}
