import type {
	AutopilotFollowUp,
	AutopilotRun,
	AutopilotTick,
} from "./AutopilotRecord";

export type AutopilotStatus = {
	cwd: string;
	prompt: string;
	intervalMinutes: number;
	node: string | null;
	localNode: string;
	scheduledHere: boolean;
	paused: boolean;
	running: AutopilotRun | null;
	nextTickAt: string | null;
	followUp: AutopilotFollowUp | null;
	lastTick: AutopilotTick | null;
};
