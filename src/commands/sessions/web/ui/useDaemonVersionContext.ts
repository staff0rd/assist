import { createContext, useContext } from "react";

export const DaemonVersionContext = createContext<string | null>(null);

export function useDaemonVersionContext(): string | null {
	return useContext(DaemonVersionContext);
}
