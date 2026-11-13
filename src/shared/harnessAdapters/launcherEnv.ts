const OWNED_BY_DAEMON = new Set([
	"ASSIST_ACTIVITY_ID",
	"ASSIST_SDK_SESSION",
	"ASSIST_SESSION",
	"ASSIST_SESSION_ID",
]);

export function launcherEnv(
	env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(env).filter(
			(entry): entry is [string, string] =>
				entry[0].startsWith("ASSIST_") &&
				!OWNED_BY_DAEMON.has(entry[0]) &&
				entry[1] !== undefined,
		),
	);
}
