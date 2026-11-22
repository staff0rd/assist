import type { AutopilotSessionState } from "./autopilotSessionState";
import type { AutopilotTarget } from "./readAutopilotTarget";

export type AutopilotDeps = {
	localNode: () => string;
	sessionState: (sessionId: string) => AutopilotSessionState;
	sessionLink: (
		sessionId: string,
	) => { launchedFrom?: string; itemId?: number } | undefined;
	launch: (target: AutopilotTarget) => string;
	closeIdle?: () => void;
};
