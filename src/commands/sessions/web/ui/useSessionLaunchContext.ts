import { createContext, useContext } from "react";
import type { HarnessKind } from "../../../../shared/harnesses";
import type { AssistLaunchMeta } from "./resumeSessionAction";

type SessionLaunch = {
	launchAssist: (
		assistArgs: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
	launchAgentInStream: (
		joinSessionId: string,
		prompt: string,
		cwd?: string,
	) => void;
	resumeSession: (
		sessionId: string,
		cwd: string,
		name?: string,
		harness?: HarnessKind,
	) => void;
	armUpdateReload: () => void;
	activateSession: (id: string) => void;
	sendInput: (sessionId: string, data: string) => void;
};

export const SessionLaunchContext = createContext<SessionLaunch>({
	launchAssist: () => {},
	launchAgentInStream: () => {},
	resumeSession: () => {},
	armUpdateReload: () => {},
	activateSession: () => {},
	sendInput: () => {},
});

export function useSessionLaunchContext(): SessionLaunch {
	return useContext(SessionLaunchContext);
}
