import { useEffect, useState } from "react";
import {
	type NewSessionMode,
	newSessionModes,
} from "./NewSessionDialog/newSessionModes";

export function useDefaultNewSessionMode(): NewSessionMode {
	const [mode, setMode] = useState<NewSessionMode>("draft");

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/new-session-defaults");
				const body = await res.json();
				if (!cancelled && Object.hasOwn(newSessionModes, body?.mode))
					setMode(body.mode);
			} catch {
				setMode("draft");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return mode;
}
