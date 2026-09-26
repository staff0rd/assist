import { useEffect, useState } from "react";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";

export function useDefaultNewSessionMode(): NewSessionMode | null {
	const [mode, setMode] = useState<NewSessionMode | null>(null);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			let loaded: NewSessionMode = "draft";
			try {
				const res = await fetch("/api/new-session-defaults");
				const body = await res.json();
				if (Object.hasOwn(newSessionModes, body?.mode)) loaded = body.mode;
			} catch {}
			if (!cancelled) setMode(loaded);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return mode;
}
