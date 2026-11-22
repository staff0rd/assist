import type { HarnessKind } from "../../../../shared/harnesses";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import type { AssistConfig } from "../../../../shared/types";

export type AutopilotTarget = {
	cwd: string;
	prompt: string;
	intervalMinutes: number;
	node?: string;
	harness?: HarnessKind;
	model?: string;
	scheduledHere: boolean;
};

/* why: the daemon's own cwd is not the repo, so read the repo's prompt-session
 * harness here; a PTY claude would stop at the folder-trust prompt in a fresh worktree. */
function launchHarness(harness: AssistConfig["harness"]) {
	const defaults = harness.defaults?.prompt;
	return {
		harness: defaults?.harness ?? harness.engine,
		model: defaults?.model,
	};
}

export function readAutopilotTarget(
	cwd: string,
	localNode: string,
): AutopilotTarget | undefined {
	const config = loadConfigFrom(cwd);
	const autopilot = config.autopilot;
	const prompt = autopilot?.prompt?.trim();
	if (!prompt || !autopilot?.intervalMinutes) return undefined;
	const node = autopilot.node?.trim() || undefined;
	return {
		cwd,
		prompt,
		intervalMinutes: autopilot.intervalMinutes,
		node,
		...launchHarness(config.harness),
		scheduledHere: node === localNode,
	};
}
