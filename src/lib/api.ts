import type {
  GenerateQuestionsResult,
  QuestionAnswer,
  Recipe,
} from '../types/recipe';

export type ApiErrorKind = 'rateLimit' | 'network' | 'generic';

const MESSAGES: Record<ApiErrorKind, string> = {
  rateLimit: 'Too many requests right now. Please wait a minute and try again.',
  network: 'Could not reach the server. Check your connection and try again.',
  generic: 'Something went wrong. Please try again.',
};

/** Error with a friendly, user-safe message. Raw API text is never stored. */
export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(kind: ApiErrorKind) {
    super(MESSAGES[kind]);
    this.name = 'ApiError';
    this.kind = kind;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
}

async function post<T>(
  path: string,
  body: unknown,
  { signal }: RequestOptions,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    // Let callers recognise cancelled requests and ignore them.
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError('network');
  }

  if (res.status === 429) {
    throw new ApiError('rateLimit');
  }
  if (!res.ok) {
    throw new ApiError('generic');
  }

  // Not-JSON (e.g. an HTML page when the API isn't running) must not leak a SyntaxError.
  try {
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError('generic');
  }
}

export function generateQuestions(
  text: string,
  options: RequestOptions = {},
): Promise<GenerateQuestionsResult> {
  return post<GenerateQuestionsResult>('/api/generate-questions', { text }, options);
}

export function generateRecipe(
  text: string,
  answers: QuestionAnswer[],
  options: RequestOptions = {},
): Promise<Omit<Recipe, 'id'>> {
  return post<Omit<Recipe, 'id'>>('/api/generate-recipe', { text, answers }, options);
}
