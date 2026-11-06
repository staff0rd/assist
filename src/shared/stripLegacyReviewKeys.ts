const LEGACY_REVIEW_HIGH_LEVEL_KEYS = ["slices"];

export function stripLegacyReviewKeys(review: unknown): unknown {
	if (!review || typeof review !== "object") return review;
	const { highLevel, ...rest } = review as Record<string, unknown>;
	if (!highLevel || typeof highLevel !== "object") return review;
	const kept = { ...(highLevel as Record<string, unknown>) };
	for (const key of LEGACY_REVIEW_HIGH_LEVEL_KEYS) delete kept[key];
	return { ...rest, highLevel: kept };
}
