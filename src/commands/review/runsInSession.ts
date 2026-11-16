import { isAgentHarness } from "../../lib/isAgentHarness";
import { deferredRunEnv } from "../sessions/shared/deferredRunEnv";

/* why: a deferred command the daemon reopens after a restart runs without the
 * harness marker, but it still belongs to the session that first ran it. */
export function runsInSession(): boolean {
	return isAgentHarness() || process.env[deferredRunEnv] === "1";
}
