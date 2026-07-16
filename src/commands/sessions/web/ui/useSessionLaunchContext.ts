import { createContext, useContext } from "react";
import type { AssistLaunchMeta } from "./createSessionAction";

type SessionLaunch = {
	launchAssist: (
		assistArgs: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
	armUpdateReload: () => void;
};

export const SessionLaunchContext = createContext<SessionLaunch>({
	launchAssist: () => {},
	armUpdateReload: () => {},
});

export function useSessionLaunchContext(): SessionLaunch {
	return useContext(SessionLaunchContext);
}
