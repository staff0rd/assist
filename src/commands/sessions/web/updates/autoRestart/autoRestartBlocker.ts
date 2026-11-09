import type { RestartTarget } from "../../../../watch/restartRules";
import type { AutoUpdateLoopState } from "../../../shared/AutoUpdateLoopState";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { isBusy } from "../../../shared/isBusy";

export type LiveSession = {
	name: string;
	status: string;
	commandType?: string;
	node?: string;
	pendingPrPreview?: PrPreview;
	resumedOverPreview?: string;
};

export type AutoRestartInput = {
	restart: RestartTarget[];
	buildPending: boolean;
	loop?: AutoUpdateLoopState;
	sessions: LiveSession[];
	lastUserActivityAt?: number;
	idleMinutes?: number;
};

export type AutoRestartSessions = Pick<
	AutoRestartInput,
	"sessions" | "lastUserActivityAt"
> & {
	restartActivity?: string;
};

export type AutoRestartSnapshot = AutoRestartInput &
	AutoRestartSessions & { built: string };

export const DEFAULT_IDLE_MINUTES = 2;

function userActive(input: AutoRestartInput, now: number): boolean {
	const idleMinutes = input.idleMinutes ?? DEFAULT_IDLE_MINUTES;
	return (
		input.lastUserActivityAt !== undefined &&
		now - input.lastUserActivityAt < idleMinutes * 60_000
	);
}

export function autoRestartBlocker(
	input: AutoRestartInput,
	now: number,
): string | undefined {
	if (input.buildPending) return "build pending";
	if (!input.loop) return "daemon not reachable";
	if (input.loop.paused) return "auto-update paused";
	if (input.loop.phase === "diverged") return "auto-update diverged";
	const busy = input.sessions.filter(isBusy);
	if (busy.length > 0)
		return `waiting on ${busy.length} running session${busy.length === 1 ? "" : "s"} (${busy.map((s) => s.name).join(", ")})`;
	if (userActive(input, now))
		return `you're active · restarting ${input.idleMinutes ?? DEFAULT_IDLE_MINUTES}m after you stop`;
	return undefined;
}
