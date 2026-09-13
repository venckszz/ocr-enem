import getPort, { portNumbers } from 'get-port';
import { ExtractEssayText } from './application/use-cases/extract-essay-text.js';
import { EvaluateEssay } from './application/use-cases/evaluate-essay.js';
import { loadEnv } from './config/env.js';
import { GoogleApiClient } from './infrastructure/google/google-api-client.js';
import { GoogleEvaluationProvider } from './infrastructure/google/google-evaluation-provider.js';
import { GoogleGeminiEmbeddingProvider } from './infrastructure/google/google-gemini-embedding-provider.js';
import { GoogleGeminiOcrRefiner } from './infrastructure/google/google-gemini-ocr-refiner.js';
import { GoogleOcrPipelineProvider } from './infrastructure/google/google-ocr-pipeline-provider.js';
import { SemanticRubricContextProvider } from './infrastructure/knowledge/semantic-rubric-context-provider.js';
import { createApp } from './presentation/http/app.js';

const env = loadEnv();
const googleClient = new GoogleApiClient(env.GOOGLE_API_KEY);
const ocrProvider = new GoogleOcrPipelineProvider(
  new GoogleGeminiOcrRefiner(googleClient, env.GOOGLE_OCR_MODEL),
  new GoogleGeminiOcrRefiner(googleClient, env.GOOGLE_REFINER_MODEL),
  env.GOOGLE_OCR_REFINE_THRESHOLD,
);
const rubricContextProvider = new SemanticRubricContextProvider(
  new GoogleGeminiEmbeddingProvider(googleClient, env.GOOGLE_EMBEDDING_MODEL),
);
const evaluationProvider = new GoogleEvaluationProvider(
  googleClient,
  env.GOOGLE_EVALUATION_MODEL,
  [env.GOOGLE_EVALUATION_FALLBACK_MODEL],
);
const app = createApp({
  env,
  extractEssayText: new ExtractEssayText(ocrProvider),
  evaluateEssay: new EvaluateEssay(evaluationProvider, rubricContextProvider),
});

const port = await getPort({ port: portNumbers(env.PORT, Math.min(env.PORT + 20, 65535)) });
app.listen(port, '0.0.0.0', () => {
  console.log(`OCR ENEM disponível em http://localhost:${port}`);
  if (port !== env.PORT) console.log(`Porta ${env.PORT} ocupada; selecionada ${port}.`);
});
