import { createContext, useContext } from "react";

export type DiscardShellResult = (sessionId: string, shellId: string) => void;

export const DiscardShellResultContext = createContext<
	DiscardShellResult | undefined
>(undefined);

export function useDiscardShellResult(): DiscardShellResult | undefined {
	return useContext(DiscardShellResultContext);
}
