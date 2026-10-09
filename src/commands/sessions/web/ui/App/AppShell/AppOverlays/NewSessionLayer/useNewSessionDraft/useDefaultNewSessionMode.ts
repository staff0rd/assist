import { useEffect, useState } from "react";
import { type NewSessionMode, newSessionModes } from "../newSessionModes";

export type LoadedDefaultMode = { cwd: string; mode: NewSessionMode };

export function useDefaultNewSessionMode(
	cwd: string,
): LoadedDefaultMode | null {
	const [loaded, setLoaded] = useState<LoadedDefaultMode | null>(null);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			let mode: NewSessionMode = "draft";
			try {
				const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : "";
				const res = await fetch(`/api/new-session-defaults${query}`);
				const body = await res.json();
				if (Object.hasOwn(newSessionModes, body?.mode)) mode = body.mode;
			} catch {}
			if (!cancelled) setLoaded({ cwd, mode });
		})();
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return loaded;
}
