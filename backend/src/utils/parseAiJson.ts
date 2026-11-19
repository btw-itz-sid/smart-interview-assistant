// OpenAI often wraps JSON in markdown fences or extra prose.
// Parse the first valid object/array instead of crashing into mock fallbacks.

export function extractJson<T = unknown>(content: string): T | null {
  if (!content) return null;

  const stripped = content
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    const objectMatch = stripped.match(/\{[\s\S]*\}/);
    const arrayMatch = stripped.match(/\[[\s\S]*\]/);
    const candidate =
      objectMatch && arrayMatch
        ? objectMatch.index! <= arrayMatch.index!
          ? objectMatch[0]
          : arrayMatch[0]
        : objectMatch?.[0] || arrayMatch?.[0];

    if (!candidate) return null;

    try {
      return JSON.parse(candidate) as T;
    } catch {
      return null;
    }
  }
}

export function extractQuestionList(content: string, count: number): string[] {
  const parsed = extractJson<unknown>(content);
  const raw = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : [];

  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (
        item &&
        typeof item === 'object' &&
        'question' in item &&
        typeof (item as { question: unknown }).question === 'string'
      ) {
        return (item as { question: string }).question.trim();
      }
      return '';
    })
    .filter(Boolean)
    .slice(0, count);
}
