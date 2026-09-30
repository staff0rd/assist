import { createContext, useContext } from "react";

export type NextCloneLookup = (repo: string) => string | undefined;

export const NextCloneContext = createContext<NextCloneLookup>(() => undefined);

export function useNextClone(): NextCloneLookup {
	return useContext(NextCloneContext);
}
