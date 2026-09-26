export function stripLegacyConfigKeys(
	config: Record<string, unknown>,
): Record<string, unknown> {
	const stripped = { ...config };
	const news = stripped.news;
	if (news && typeof news === "object" && "feeds" in news) {
		const { feeds: _feeds, ...rest } = news as Record<string, unknown>;
		stripped.news = rest;
	}
	return stripped;
}
