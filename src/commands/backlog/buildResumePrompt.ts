/**
 * Prompt sent when resuming a phase whose Claude conversation was interrupted by
 * a daemon restart. The full phase instructions (tasks, verify, phase-done) are
 * already in the resumed transcript, so this only nudges the agent to continue
 * the in-flight work rather than restart it.
 */
export function buildResumePrompt(
	phaseNumber: number,
	totalPhases: number,
): string {
	return [
		`This conversation was interrupted partway through phase ${phaseNumber}/${totalPhases} by a restart.`,
		"Review what you already did earlier in this conversation and continue from where you left off to finish the phase. Do not start the phase over.",
		"When the phase is complete, run /verify and then the `assist backlog phase-done` command exactly as instructed earlier in this conversation.",
	].join("\n");
}
