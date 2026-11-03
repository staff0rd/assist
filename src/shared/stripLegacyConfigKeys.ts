const LEGACY_SESSIONS_KEYS = [
	"windowsProjectsRoot",
	"windowsDaemonHost",
	"windowsDaemonPort",
	"windowsVersionCheck",
	"topBar",
	"floatWaiting",
	"floatWaitingAfterMs",
	"parkWaitingAfterMs",
	"askQuestionAutoApprove",
];

const LEGACY_WORKTREE_KEYS = ["watcher", "includeDrafts"];

const LEGACY_DEVLOG_KEYS = ["skip"];

function withoutKeys(value: unknown, keys: string[]): unknown {
	if (!value || typeof value !== "object") return value;
	const rest = { ...(value as Record<string, unknown>) };
	for (const key of keys) delete rest[key];
	return rest;
}

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
	if (stripped.sessions)
		stripped.sessions = withoutKeys(stripped.sessions, LEGACY_SESSIONS_KEYS);
	if (stripped.worktree)
		stripped.worktree = withoutKeys(stripped.worktree, LEGACY_WORKTREE_KEYS);
	if (stripped.devlog)
		stripped.devlog = withoutKeys(stripped.devlog, LEGACY_DEVLOG_KEYS);
	return stripped;
}
