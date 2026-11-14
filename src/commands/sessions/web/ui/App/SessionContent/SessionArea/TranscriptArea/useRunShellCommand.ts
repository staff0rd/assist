import { createContext, useContext } from "react";

export type RunShellCommand = (sessionId: string, command: string) => void;

export const RunShellCommandContext = createContext<
	RunShellCommand | undefined
>(undefined);

export function useRunShellCommand(): RunShellCommand | undefined {
	return useContext(RunShellCommandContext);
}
