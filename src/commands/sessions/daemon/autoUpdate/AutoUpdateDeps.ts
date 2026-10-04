import type { LapEnd } from "../../../watch/decideLap";
import type { AutoUpdatePhase } from "../../shared/AutoUpdateLoopState";

export type AutoUpdateDeps = {
	runLap: (onOutput: (text: string) => void) => Promise<LapEnd>;
	record: (text: string) => void;
	note: (text: string) => void;
	enter: (
		phase: AutoUpdatePhase,
		extra?: { reason?: string; escalationId?: string },
	) => void;
	liveEscalation: () => string | undefined;
	escalate: (output: string) => string;
	isLive: (sessionId: string) => boolean;
	sleep: (ms: number) => Promise<void>;
};
