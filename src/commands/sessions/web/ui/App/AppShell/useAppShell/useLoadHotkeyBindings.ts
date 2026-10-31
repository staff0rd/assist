import { useEffect } from "react";
import type { HotkeyBindings } from "../../../../../../../shared/hotkeys/defaultHotkeys";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { hotkeyBindingsStore } from "../../hotkeyBindingsStore";

export function useLoadHotkeyBindings(): void {
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch("/api/hotkeys");
				if (!res.ok) return;
				const bindings = (await res.json()) as HotkeyBindings;
				if (!cancelled) hotkeyBindingsStore.set(bindings);
			} catch (error) {
				reportCaughtError(error, "hotkey bindings");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
}
