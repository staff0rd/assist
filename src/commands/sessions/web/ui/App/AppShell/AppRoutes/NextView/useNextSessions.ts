import { createContext, useContext } from "react";
import type { SessionInfo } from "../../../../types";

export type NextSessions = {
	sessions: SessionInfo[];
	activate: (id: string) => void;
};

export const NextSessionsContext = createContext<NextSessions>({
	sessions: [],
	activate: () => {},
});

export function useNextSessions(): NextSessions {
	return useContext(NextSessionsContext);
}
