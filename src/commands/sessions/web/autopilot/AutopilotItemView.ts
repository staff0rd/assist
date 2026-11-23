import type { BacklogStatus } from "../../../backlog/types";

type AutopilotPhaseRef = { number: number | null; name: string };

export type AutopilotItemView = {
	id: number;
	name: string;
	status: BacklogStatus;
	sessionId: string | null;
	startedAt: string;
	why?: string;
	delivered?: string;
	result?: string;
	/** The latest phase summary: what the item has done so far. */
	summary?: string;
	finishedAt?: string;
	phase: number;
	totalPhases: number;
	donePhases: number;
	remaining: AutopilotPhaseRef[];
	commits: number;
	insertions: number;
	deletions: number;
};
