import { createContext, useContext } from "react";

export const CloneBadgeContext = createContext<Set<string>>(new Set());

export function useCloneBadgeContext(): Set<string> {
	return useContext(CloneBadgeContext);
}
