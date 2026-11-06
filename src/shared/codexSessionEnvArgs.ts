const SESSION_ENV_KEYS = [
	"ASSIST_SESSION",
	"ASSIST_SESSION_ID",
	"ASSIST_BACKLOG_ITEM_ID",
] as const;

/* why: the Codex TUI hands its turns to a shared app-server daemon, which runs
 * every shell command with the env of whichever session first started it — so a
 * later session's commands would carry the earlier session's ASSIST_SESSION_ID.
 * Pinning these keys through the per-thread shell_environment_policy makes each
 * session's commands see its own values (empty when the key is unset here). */
export function codexSessionEnvArgs(
	env: Record<string, string | undefined>,
): string[] {
	return SESSION_ENV_KEYS.flatMap((key) => [
		"-c",
		`shell_environment_policy.set.${key}=${JSON.stringify(env[key] ?? "")}`,
	]);
}
