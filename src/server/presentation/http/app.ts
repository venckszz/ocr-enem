import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { AppEnv } from '../../config/env.js';
import type { ExtractEssayText } from '../../application/use-cases/extract-essay-text.js';
import type { EvaluateEssay } from '../../application/use-cases/evaluate-essay.js';
import { errorHandler } from './middleware/error-handler.js';
import { createEvaluationRouter } from './routes/evaluation-route.js';
import { createOcrRouter } from './routes/ocr-route.js';

type Dependencies = {
  env: AppEnv;
  extractEssayText: ExtractEssayText;
  evaluateEssay: EvaluateEssay;
};

export function createApp({ env, extractEssayText, evaluateEssay }: Dependencies) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      provider: 'google',
      ocrModel: env.GOOGLE_OCR_MODEL,
      ocrRefinerModel: env.GOOGLE_REFINER_MODEL,
      ocrRefineThreshold: env.GOOGLE_OCR_REFINE_THRESHOLD,
      ocrThinking: false,
      evaluationModel: env.GOOGLE_EVALUATION_MODEL,
      evaluationFallbackModel: env.GOOGLE_EVALUATION_FALLBACK_MODEL,
      evaluationThinking: 'high',
      embeddingModel: env.GOOGLE_EMBEDDING_MODEL,
    });
  });
  app.use('/api/ocr', createOcrRouter(extractEssayText, env.MAX_UPLOAD_MB));
  app.use('/api/evaluate', createEvaluationRouter(evaluateEssay));

  const webRoot = path.resolve(process.cwd(), 'dist/web');
  if (existsSync(webRoot)) {
    app.use(express.static(webRoot));
    app.get('*splat', (_request, response) => response.sendFile(path.join(webRoot, 'index.html')));
  }
  app.use(errorHandler);
  return app;
}
