import { createContext, useContext } from "react";

export const InRepoGroupContext = createContext(false);

export function useInRepoGroupContext(): boolean {
	return useContext(InRepoGroupContext);
}
