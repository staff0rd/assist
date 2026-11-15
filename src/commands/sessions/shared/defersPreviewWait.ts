import { activeHarness } from "../../../lib/activeHarness";
import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import { sdkAgentEnv } from "../../../shared/sdkAgentEnv";

/* why: the daemon can push a decision as the next turn into a Claude (SDK)
 * session, or type it into a terminal it hosts for a harness that cannot wait
 * on a background task (Codex), so both hand the preview to the daemon and end
 * the turn instead. */
export function defersPreviewWait(
	env: NodeJS.ProcessEnv = process.env,
): boolean {
	if (env[sdkAgentEnv] === "1") return true;
	if (env.ASSIST_SESSION !== "1" || !env.ASSIST_SESSION_ID) return false;
	const harness = activeHarness();
	if (!harness) return false;
	return (
		harnessCapability(harness, "preview.nextTurn").supported &&
		!harnessCapability(harness, "tasks.notifyOnExit").supported
	);
}
