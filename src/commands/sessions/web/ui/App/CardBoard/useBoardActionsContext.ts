import { createContext, useContext } from "react";
import type { SessionLifecycleHandlers } from "../../types";

export const BoardActionsContext = createContext<SessionLifecycleHandlers>({
	onRetry: () => {},
	onRestart: () => {},
	onDismiss: () => {},
});

export function useBoardActionsContext(): SessionLifecycleHandlers {
	return useContext(BoardActionsContext);
}
