import { wrapRestartNudge } from "../shared/wrapRestartNudge";

export function daemonRestartPrompt(backgroundTaskIds: string[]): string {
	const preamble =
		"The assist sessions daemon restarted and killed this session's processes. This was not a deliberate stop and nothing you were running was told to finish.";
	if (backgroundTaskIds.length === 0)
		return wrapRestartNudge(`${preamble} Continue from where you left off.`, 0);
	return wrapRestartNudge(
		`${preamble} It killed ${backgroundTaskIds.length} background task(s) that were still running (${backgroundTaskIds.join(", ")}); their output files end where the kill landed, with no exit code. Treat them as killed by the restart, not as interrupted by the user, and restart any of them that should still be running.`,
		backgroundTaskIds.length,
	);
}
