import type { ApiError, EvaluationResponse, OcrResult } from '../../shared/contracts';

async function unwrap<T>(response: Response): Promise<T> {
  const payload = await response.json() as T | ApiError;
  if (!response.ok) {
    const error = payload as ApiError;
    throw new Error(error.details ? `${error.error} ${error.details}` : error.error);
  }
  return payload as T;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, timeoutMessage: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error(timeoutMessage);
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function extractText(files: File[]): Promise<OcrResult> {
  const form = new FormData();
  files.forEach((file) => form.append('documents', file));
  return unwrap<OcrResult>(await fetchWithTimeout(
    '/api/ocr',
    { method: 'POST', body: form },
    120_000,
    'O OCR excedeu 2 minutos. Verifique a conexão e tente novamente com uma imagem por vez.',
  ));
}

export async function evaluateText(text: string, theme: string, auditMode: boolean): Promise<EvaluationResponse> {
  return unwrap<EvaluationResponse>(await fetchWithTimeout('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, theme: theme || undefined, auditMode }),
  }, 300_000, 'A correção excedeu 5 minutos. Tente novamente sem o modo auditoria.'));
}
