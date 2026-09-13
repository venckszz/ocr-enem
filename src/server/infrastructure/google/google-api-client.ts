const GOOGLE_GENERATIVE_LANGUAGE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GoogleApiClient {
  constructor(private readonly apiKey: string) {}

  async post<T>(url: string, body: unknown, timeoutMs = 60_000, maxAttempts = 2): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let retryable = true;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const separator = url.includes('?') ? '&' : '?';
        const response = await fetch(`${url}${separator}key=${encodeURIComponent(this.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({})) as T & { error?: { message?: string } };
        if (response.ok) return payload;
        lastError = new Error(`Google API (${response.status}): ${payload.error?.message ?? 'falha desconhecida'}`);
        retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === maxAttempts - 1) throw lastError;
      } catch (error) {
        lastError = error instanceof Error && error.name === 'AbortError'
          ? new Error('Google API excedeu o tempo limite.')
          : error instanceof Error ? error : new Error(String(error));
        if (!retryable || attempt === maxAttempts - 1) throw lastError;
      } finally {
        clearTimeout(timer);
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
    throw lastError ?? new Error('Falha desconhecida ao acessar Google API.');
  }

  generativeModelUrl(model: string, action: 'generateContent' | 'batchEmbedContents') {
    return `${GOOGLE_GENERATIVE_LANGUAGE_URL}/models/${encodeURIComponent(model)}:${action}`;
  }
}
