import { stripLegacyReviewKeys } from "./stripLegacyReviewKeys";
import { stripLegacySectionKeys } from "./stripLegacySectionKeys";

function stripRepos(repos: unknown): unknown {
	if (!repos || typeof repos !== "object") return repos;
	return Object.fromEntries(
		Object.entries(repos as Record<string, unknown>).map(([name, entry]) => [
			name,
			entry && typeof entry === "object"
				? stripLegacyConfigKeys(entry as Record<string, unknown>)
				: entry,
		]),
	);
}

export function stripLegacyConfigKeys(
	config: Record<string, unknown>,
): Record<string, unknown> {
	const stripped = { ...config };
	if (stripped.repos) stripped.repos = stripRepos(stripped.repos);
	delete stripped.backlog;
	delete stripped.cliReadVerbs;
	delete stripped.roam;
	const news = stripped.news;
	if (news && typeof news === "object" && "feeds" in news) {
		const { feeds: _feeds, ...rest } = news as Record<string, unknown>;
		stripped.news = rest;
	}
	stripLegacySectionKeys(stripped);
	if (stripped.review) stripped.review = stripLegacyReviewKeys(stripped.review);
	return stripped;
}
