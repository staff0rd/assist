import { createContext, useContext } from "react";
import type { WebserverRestart } from "./useWebserverRestart";

export const LocalRestartContext = createContext<WebserverRestart | null>(null);

export function useLocalRestartContext(): WebserverRestart {
	const restart = useContext(LocalRestartContext);
	if (!restart) throw new Error("LocalRestartContext is not provided");
	return restart;
}
