import { createContext, useContext } from "react";

export type StopShellCommand = (sessionId: string, shellId: string) => void;

export const StopShellCommandContext = createContext<
	StopShellCommand | undefined
>(undefined);

export function useStopShellCommand(): StopShellCommand | undefined {
	return useContext(StopShellCommandContext);
}
