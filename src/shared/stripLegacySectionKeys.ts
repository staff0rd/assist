const LEGACY_SECTION_KEYS: Record<string, string[]> = {
	sessions: [
		"windowsProjectsRoot",
		"windowsDaemonHost",
		"windowsDaemonPort",
		"windowsVersionCheck",
		"topBar",
		"floatWaiting",
		"floatWaitingAfterMs",
		"parkWaitingAfterMs",
		"askQuestionAutoApprove",
	],
	worktree: ["watcher", "includeDrafts"],
	devlog: ["skip"],
	testflight: ["account"],
};

function withoutKeys(value: unknown, keys: string[]): unknown {
	if (!value || typeof value !== "object") return value;
	const rest = { ...(value as Record<string, unknown>) };
	for (const key of keys) delete rest[key];
	return rest;
}

export function stripLegacySectionKeys(config: Record<string, unknown>): void {
	for (const [section, keys] of Object.entries(LEGACY_SECTION_KEYS))
		if (config[section]) config[section] = withoutKeys(config[section], keys);
}
