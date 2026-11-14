import { wrapRestartNudge } from "../shared/wrapRestartNudge";

function lostPreviews(deferredCommands: string[]): string {
	if (deferredCommands.length === 0) return "";
	const commands = deferredCommands.map((c) => `\`assist ${c}\``).join(", ");
	return ` It also closed ${deferredCommands.length} preview(s) still waiting for the user's decision (${commands}); those decisions will never arrive. Run each of those commands again the same way, then end your turn and wait for the decision as before.`;
}

export function daemonRestartPrompt(
	backgroundTaskIds: string[],
	deferredCommands: string[] = [],
): string {
	const preamble =
		"The assist sessions daemon restarted and killed this session's processes. This was not a deliberate stop and nothing you were running was told to finish.";
	const previews = lostPreviews(deferredCommands);
	if (backgroundTaskIds.length === 0)
		return wrapRestartNudge(
			`${preamble}${previews || " Continue from where you left off."}`,
			0,
		);
	return wrapRestartNudge(
		`${preamble} It killed ${backgroundTaskIds.length} background task(s) that were still running (${backgroundTaskIds.join(", ")}); their output files end where the kill landed, with no exit code. Treat them as killed by the restart, not as interrupted by the user, and restart any of them that should still be running.${previews}`,
		backgroundTaskIds.length,
	);
}
