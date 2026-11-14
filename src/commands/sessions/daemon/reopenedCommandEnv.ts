import { PERSISTED_ENV_KEYS } from "./deferredCommandEnv";

/* why: the daemon inherits the env of whichever command spawned it, so its own
 * ASSIST_BACKLOG_ITEM_ID may belong to an unrelated item; only the persisted
 * value (or none) is the one the command first ran with. */
export function reopenedCommandEnv(
	base: Record<string, string>,
	persisted: Record<string, string> | undefined,
): Record<string, string> {
	const env = { ...base };
	for (const key of PERSISTED_ENV_KEYS) delete env[key];
	return { ...env, ...persisted };
}
