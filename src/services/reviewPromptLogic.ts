export const REVIEW_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export function shouldPromptReview(lastPromptMs: number | null, now: number): boolean {
  if (lastPromptMs == null || !Number.isFinite(lastPromptMs)) {
    return true;
  }
  return now - lastPromptMs >= REVIEW_COOLDOWN_MS;
}
