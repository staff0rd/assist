import { useEffect } from "react";
import type { HotkeyBindings } from "../../../../../../../shared/hotkeys/defaultHotkeys";
import { hotkeyBindingsStore } from "../../hotkeyBindingsStore";

export function useLoadHotkeyBindings(): void {
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/hotkeys");
				if (!res.ok) return;
				const bindings = (await res.json()) as HotkeyBindings;
				if (!cancelled) hotkeyBindingsStore.set(bindings);
			} catch {}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
}
