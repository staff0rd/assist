import { useSyncExternalStore } from "react";
import type { HotkeyBindings } from "../../../../../shared/hotkeys/defaultHotkeys";
import { hotkeyBindingsStore } from "./hotkeyBindingsStore";

export function useHotkeyBindings(): HotkeyBindings {
	return useSyncExternalStore(
		hotkeyBindingsStore.subscribe,
		hotkeyBindingsStore.get,
	);
}
