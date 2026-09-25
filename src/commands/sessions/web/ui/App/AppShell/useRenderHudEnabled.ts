import { useSyncExternalStore } from "react";
import { renderHudEnabled, subscribeRenderHud } from "../../renderCounters";

const serverSnapshot = () => false;

export function useRenderHudEnabled(): boolean {
	return useSyncExternalStore(
		subscribeRenderHud,
		renderHudEnabled,
		serverSnapshot,
	);
}
