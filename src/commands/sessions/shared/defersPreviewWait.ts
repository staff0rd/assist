import { activeHarness } from "../../../lib/activeHarness";
import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import { sdkAgentEnv } from "../../../shared/sdkAgentEnv";

/* why: the daemon pushes a decision as the next turn into a Claude (SDK)
 * session, or types it into any terminal it hosts, so every such session hands
 * the preview to the daemon and ends the turn. The agent can then run a
 * preview command the same way (in the foreground) in every harness instead of
 * picking foreground or background from the environment. */
export function defersPreviewWait(
	env: NodeJS.ProcessEnv = process.env,
): boolean {
	if (env[sdkAgentEnv] === "1") return true;
	if (env.ASSIST_SESSION !== "1" || !env.ASSIST_SESSION_ID) return false;
	const harness = activeHarness();
	return (
		harness !== undefined &&
		harnessCapability(harness, "preview.nextTurn").supported
	);
}
