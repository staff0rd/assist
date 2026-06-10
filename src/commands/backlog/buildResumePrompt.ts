/**
 * Prompt sent when resuming a phase whose Claude conversation was interrupted by
 * a daemon restart. The full phase instructions (tasks, verify, phase-done) and
 * the work done so far are already in the resumed transcript, so this only nudges
 * the agent to pick the in-flight work back up.
 */
export function buildResumePrompt(): string {
	return "A restart interrupted this conversation. Continue from where you left off.";
}
