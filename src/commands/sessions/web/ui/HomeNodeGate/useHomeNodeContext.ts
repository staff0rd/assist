import { createContext, useContext } from "react";
import type { HomeNodeApi } from "./useHomeNode";

export const HomeNodeContext = createContext<HomeNodeApi | null>(null);

export function useHomeNodeContext(): HomeNodeApi | null {
	return useContext(HomeNodeContext);
}
