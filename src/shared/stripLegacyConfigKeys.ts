const LEGACY_SESSIONS_KEYS = [
	"windowsProjectsRoot",
	"windowsDaemonHost",
	"windowsDaemonPort",
	"windowsVersionCheck",
];

export function stripLegacyConfigKeys(
	config: Record<string, unknown>,
): Record<string, unknown> {
	const stripped = { ...config };
	const news = stripped.news;
	if (news && typeof news === "object" && "feeds" in news) {
		const { feeds: _feeds, ...rest } = news as Record<string, unknown>;
		stripped.news = rest;
	}
	const sessions = stripped.sessions;
	if (sessions && typeof sessions === "object") {
		const rest = { ...(sessions as Record<string, unknown>) };
		for (const key of LEGACY_SESSIONS_KEYS) delete rest[key];
		stripped.sessions = rest;
	}
	return stripped;
}
