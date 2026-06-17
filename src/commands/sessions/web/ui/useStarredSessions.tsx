import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { backlogCwds } from "./loadStarredKeys";
import type { SessionInfo } from "./types";
import { applyToggle, checkStarred, useStarredKeys } from "./useStarredKeys";

type StarredSessions = {
	isStarred: (session: SessionInfo) => boolean;
	toggleStar: (session: SessionInfo) => void;
};

const StarredSessionsContext = createContext<StarredSessions | null>(null);

export function StarredSessionsProvider({
	sessions,
	children,
}: {
	sessions: SessionInfo[];
	children: ReactNode;
}) {
	const cwdsKey = backlogCwds(sessions).join("|");
	const [starred, setStarred] = useStarredKeys(cwdsKey);

	const isStarred = useCallback(
		(session: SessionInfo) => checkStarred(starred, session),
		[starred],
	);
	const toggleStar = useCallback(
		(session: SessionInfo) => applyToggle(setStarred, session),
		[setStarred],
	);

	const value = useMemo(
		() => ({ isStarred, toggleStar }),
		[isStarred, toggleStar],
	);

	return (
		<StarredSessionsContext.Provider value={value}>
			{children}
		</StarredSessionsContext.Provider>
	);
}

export function useStarredSessions(): StarredSessions {
	const context = useContext(StarredSessionsContext);
	if (!context) {
		throw new Error(
			"useStarredSessions must be used within a StarredSessionsProvider",
		);
	}
	return context;
}
