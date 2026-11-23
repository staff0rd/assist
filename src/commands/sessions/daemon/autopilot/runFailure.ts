import { formatItemId } from "../../../backlog/formatItemId";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotFailure } from "./AutopilotRecord";
import type { AutopilotSessionState } from "./autopilotSessionState";

/** Why a run that just ended failed: its root or a backlog session it started errored. */
export function runFailure(
	deps: AutopilotDeps,
	rootId: string,
	state: AutopilotSessionState,
): Omit<AutopilotFailure, "at"> | undefined {
	if (state === "errored") {
		const error = deps.sessionLink(rootId)?.error;
		return {
			sessionId: rootId,
			reason: `the autopilot session errored${error ? `: ${error}` : ""}`,
		};
	}
	const errored = deps.runItems(rootId).find((run) => run.error);
	if (!errored) return undefined;
	return {
		item: formatItemId(errored.itemId),
		phase: deps.sessionLink(errored.sessionId)?.phase,
		sessionId: errored.sessionId,
		reason: `its backlog session errored: ${errored.error}`,
	};
}
