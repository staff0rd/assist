import { createContext, useContext } from "react";

type ServerActions = {
	onStop: (id: string) => void;
	onStart: (runName: string, cwd?: string, replace?: boolean) => void;
};

export const ServerActionsContext = createContext<ServerActions>({
	onStop: () => {},
	onStart: () => {},
});

export function useServerActionsContext(): ServerActions {
	return useContext(ServerActionsContext);
}
