import type { AutopilotSessionState } from "./autopilotSessionState";
import type { AutopilotTarget } from "./readAutopilotTarget";

export type AutopilotRunItem = {
	itemId: number;
	sessionId: string;
	live: boolean;
	/** Why the session errored, when it did. */
	error?: string;
};

/** A session of the run that ended its turn with no preview or prompt pending. */
export type AutopilotIdleMember = {
	sessionId: string;
	waitingSince: number;
	itemId?: number;
	phase?: string;
	lastMessage?: string;
};

/** A run member idle on a background task while nothing else holds the run. */
export type AutopilotHeldMember = {
	sessionId: string;
	itemId?: number;
	phase?: string;
	/** How long its background tasks have been running. */
	taskAgeMs: number;
};

export type AutopilotDeps = {
	localNode: () => string;
	sessionState: (sessionId: string) => AutopilotSessionState;
	sessionLink: (sessionId: string) =>
		| {
				launchedFrom?: string;
				itemId?: number;
				phase?: string;
				error?: string;
		  }
		| undefined;
	launch: (target: AutopilotTarget) => string;
	/** Sessions in the autopilot run rooted at rootId that run a backlog item. */
	runItems: (rootId: string) => AutopilotRunItem[];
	/** Sessions the run rooted at rootId started that sit idle with nothing pending. */
	idleMembers?: (rootId: string) => AutopilotIdleMember[];
	/** Members holding the run rooted at rootId live solely by idling on background tasks. */
	backgroundHolds?: (rootId: string) => AutopilotHeldMember[];
	stopSession: (sessionId: string) => void;
	/** Send a prompt to a session; false when it can't take one. */
	promptSession: (sessionId: string, text: string) => boolean;
	/** Sessions, in any run, still running the given backlog item. */
	itemSessions: (itemId: number) => string[];
	/** Backlog statuses of the given items, read from the database. */
	itemStatuses?: (ids: number[]) => Promise<Map<number, string>>;
	closeIdle?: (keep: Set<string>) => void;
	/** Push a notification that the schedule paused on a failure. */
	notify?: (title: string, message: string) => void;
};
