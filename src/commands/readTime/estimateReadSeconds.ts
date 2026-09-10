const LENGTH_DECAY_FITTED_TO_TIMED_PR_READINGS = 0.17;

export function estimateReadSeconds(
	words: number,
	wordsPerMinute: number,
): number {
	const load = words ** (1 + LENGTH_DECAY_FITTED_TO_TIMED_PR_READINGS);
	return Math.round((load / wordsPerMinute) * 60);
}
