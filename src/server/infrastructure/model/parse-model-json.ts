export function parseModelJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('O modelo não retornou JSON válido.');
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new Error('O JSON retornado pelo modelo está malformado. Tente novamente.');
  }
}
