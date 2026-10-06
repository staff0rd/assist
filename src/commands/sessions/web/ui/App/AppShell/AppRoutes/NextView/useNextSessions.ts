import { createContext, useContext } from "react";
import type { SessionInfo } from "../../../../types";
import type { TrackedIssues } from "./useTrackedIssues";

export type NextSessions = {
	sessions: SessionInfo[];
	trackedIssues: TrackedIssues;
	activate: (id: string) => void;
};

export const NextSessionsContext = createContext<NextSessions>({
	sessions: [],
	trackedIssues: new Map(),
	activate: () => {},
});

export function useNextSessions(): NextSessions {
	return useContext(NextSessionsContext);
}
