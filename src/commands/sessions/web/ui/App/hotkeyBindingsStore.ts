import {
	defaultHotkeys,
	type HotkeyBindings,
} from "../../../../../shared/hotkeys/defaultHotkeys";

let current: HotkeyBindings = defaultHotkeys;
const listeners = new Set<() => void>();

export const hotkeyBindingsStore = {
	get: (): HotkeyBindings => current,
	set(bindings: HotkeyBindings): void {
		current = bindings;
		for (const listener of listeners) listener();
	},
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
};
