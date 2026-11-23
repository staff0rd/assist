import type { AutopilotSessionState } from "./autopilotSessionState";
import type { AutopilotTarget } from "./readAutopilotTarget";

export type AutopilotRunItem = {
	itemId: number;
	sessionId: string;
	live: boolean;
};

export type AutopilotDeps = {
	localNode: () => string;
	sessionState: (sessionId: string) => AutopilotSessionState;
	sessionLink: (
		sessionId: string,
	) => { launchedFrom?: string; itemId?: number } | undefined;
	launch: (target: AutopilotTarget) => string;
	/** Sessions in the autopilot run rooted at rootId that run a backlog item. */
	runItems: (rootId: string) => AutopilotRunItem[];
	stopSession: (sessionId: string) => void;
	/** Backlog statuses of the given items, read from the database. */
	itemStatuses?: (ids: number[]) => Promise<Map<number, string>>;
	closeIdle?: () => void;
};
