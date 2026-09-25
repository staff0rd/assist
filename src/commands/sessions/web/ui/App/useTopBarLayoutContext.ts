import { createContext, useContext } from "react";

export const TopBarLayoutContext = createContext(false);

export function useTopBarLayoutContext(): boolean {
	return useContext(TopBarLayoutContext);
}
