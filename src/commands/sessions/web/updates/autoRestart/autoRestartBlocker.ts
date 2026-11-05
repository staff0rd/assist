import type { RestartTarget } from "../../../../watch/restartRules";
import type { AutoUpdateLoopState } from "../../../shared/AutoUpdateLoopState";
import type { PrPreview } from "../../../shared/SessionInfoBase";

export type LiveSession = {
	name: string;
	status: string;
	commandType?: string;
	node?: string;
	pendingPrPreview?: PrPreview;
};

export type AutoRestartInput = {
	restart: RestartTarget[];
	buildPending: boolean;
	loop?: AutoUpdateLoopState;
	sessions: LiveSession[];
};

function isBusy(session: LiveSession): boolean {
	if (session.node !== undefined || session.commandType === "run") return false;
	if (session.status !== "running") return false;
	const preview = session.pendingPrPreview;
	return preview === undefined || preview.kind === "show";
}

export function autoRestartBlocker(
	input: AutoRestartInput,
): string | undefined {
	if (input.buildPending) return "build pending";
	if (!input.loop) return "daemon not reachable";
	if (input.loop.paused) return "auto-update paused";
	if (input.loop.phase === "diverged") return "auto-update diverged";
	const busy = input.sessions.filter(isBusy);
	if (busy.length > 0)
		return `waiting on ${busy.length} running session${busy.length === 1 ? "" : "s"} (${busy.map((s) => s.name).join(", ")})`;
	return undefined;
}
