import { createContext, useCallback, useContext } from "react";
import type { UserMessages } from "../types";

type LastMessageHistory = {
	userMessages: UserMessages | null;
	fetchUserMessages: (sessionId: string) => void;
};

export const LastMessageHistoryContext = createContext<LastMessageHistory>({
	userMessages: null,
	fetchUserMessages: () => {},
});

export function useLastMessageHistory(sessionId: string | undefined) {
	const { userMessages, fetchUserMessages } = useContext(
		LastMessageHistoryContext,
	);
	const onFetchHistory = useCallback(() => {
		if (sessionId) fetchUserMessages(sessionId);
	}, [sessionId, fetchUserMessages]);
	const history =
		userMessages?.sessionId === sessionId ? userMessages?.messages : undefined;
	return { history, onFetchHistory };
}
