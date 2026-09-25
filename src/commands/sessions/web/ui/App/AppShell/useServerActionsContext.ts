import { createContext, useContext } from "react";

type ServerActions = {
	onStop: (id: string) => void;
	onStart: (
		runName: string,
		cwd?: string,
		replace?: boolean,
		launchedFrom?: string,
	) => void;
	onDiscard: (id: string) => void;
};

export const ServerActionsContext = createContext<ServerActions>({
	onStop: () => {},
	onStart: () => {},
	onDiscard: () => {},
});

export function useServerActionsContext(): ServerActions {
	return useContext(ServerActionsContext);
}
