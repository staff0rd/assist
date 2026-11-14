const PERSISTED_ENV_KEYS = ["ASSIST_BACKLOG_ITEM_ID"] as const;

export function deferredCommandEnv(
	env: Record<string, string>,
): Record<string, string> | undefined {
	const kept = Object.fromEntries(
		PERSISTED_ENV_KEYS.filter((key) => env[key] !== undefined).map((key) => [
			key,
			env[key],
		]),
	);
	return Object.keys(kept).length > 0 ? kept : undefined;
}
