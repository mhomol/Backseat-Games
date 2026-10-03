const WORD_API_URL = 'https://random-word-api.herokuapp.com/word?number=2';
const TIMEOUT_MS = 8000;

function abortableFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

async function requestWords(): Promise<string[]> {
  const response = await abortableFetch(WORD_API_URL);
  if (!response.ok) {
    throw new Error('Need internet to pick a word');
  }
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || data.some((entry) => typeof entry !== 'string')) {
    throw new Error('Need internet to pick a word');
  }
  return data as string[];
}

export async function fetchHangmanPhrase(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const words = await requestWords();
      const phrase = words
        .map((word) => word.replace(/[^a-zA-Z]/g, ''))
        .filter(Boolean)
        .join(' ');
      if (!phrase) {
        throw new Error('Need internet to pick a word');
      }
      return phrase;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError instanceof Error && lastError.message) {
    throw lastError;
  }
  throw new Error('Need internet to pick a word');
}
