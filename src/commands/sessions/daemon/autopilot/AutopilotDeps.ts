import type { AutopilotSessionState } from "./autopilotSessionState";

export type AutopilotDeps = {
	localNode: () => string;
	sessionState: (sessionId: string) => AutopilotSessionState;
	launch: (cwd: string, prompt: string) => string;
};
