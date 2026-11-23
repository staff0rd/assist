import type {
	AutopilotFollowUp,
	AutopilotItem,
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
	pauseReason: string | null;
	running: AutopilotRun | null;
	nextTickAt: string | null;
	followUp: AutopilotFollowUp | null;
	lastTick: AutopilotTick | null;
	/** Newest first; sessionId is the item's live run session, if any. */
	items: (AutopilotItem & { sessionId: string | null })[];
};
