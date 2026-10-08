const LEGACY_SESSIONS_KEYS = [
	"windowsProjectsRoot",
	"windowsDaemonHost",
	"windowsDaemonPort",
	"windowsVersionCheck",
];

const LEGACY_WORKTREE_KEYS = ["watcher", "includeDrafts"];

function withoutKeys(value: unknown, keys: string[]): unknown {
	if (!value || typeof value !== "object") return value;
	const rest = { ...(value as Record<string, unknown>) };
	for (const key of keys) delete rest[key];
	return rest;
}

export function stripLegacyConfigKeys(
	config: Record<string, unknown>,
): Record<string, unknown> {
	const stripped = { ...config };
	const news = stripped.news;
	if (news && typeof news === "object" && "feeds" in news) {
		const { feeds: _feeds, ...rest } = news as Record<string, unknown>;
		stripped.news = rest;
	}
	if (stripped.sessions)
		stripped.sessions = withoutKeys(stripped.sessions, LEGACY_SESSIONS_KEYS);
	if (stripped.worktree)
		stripped.worktree = withoutKeys(stripped.worktree, LEGACY_WORKTREE_KEYS);
	return stripped;
}
