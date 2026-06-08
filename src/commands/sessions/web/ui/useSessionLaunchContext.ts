import { createContext, useContext } from "react";

type SessionLaunch = {
	launchAssist: (assistArgs: string[], cwd?: string) => void;
};

export const SessionLaunchContext = createContext<SessionLaunch>({
	launchAssist: () => {},
});

export function useSessionLaunchContext(): SessionLaunch {
	return useContext(SessionLaunchContext);
}
