import { useCallback, useState } from 'react';
import type { EvaluationResponse, OcrResult } from '../../shared/contracts';
import { evaluateText, extractText } from '../services/api';

type Stage = 'upload' | 'extracting' | 'review' | 'evaluating' | 'result';

export function useEssayAnalysis() {
  const [stage, setStage] = useState<Stage>('upload');
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [text, setText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState('');

  const extract = useCallback(async (files: File[]) => {
    setError('');
    setStage('extracting');
    try {
      const result = await extractText(files);
      setOcr(result);
      setText(result.text);
      setStage('review');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao extrair o texto.');
      setStage('upload');
    }
  }, []);

  const evaluate = useCallback(async (theme: string, auditMode: boolean) => {
    setError('');
    setStage('evaluating');
    try {
      setEvaluation(await evaluateText(text, theme, auditMode));
      setStage('result');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao corrigir a redação.');
      setStage('review');
    }
  }, [text]);

  const reset = useCallback(() => {
    setStage('upload');
    setOcr(null);
    setText('');
    setEvaluation(null);
    setError('');
  }, []);

  return { stage, ocr, text, evaluation, error, setText, extract, evaluate, reset };
}
