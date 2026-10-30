import { useEffect, useState } from "react";
import { apiFetch } from "../../../../../apiFetch";
import { type NewSessionMode, newSessionModes } from "../newSessionModes";

export type LoadedDefaultMode = { mode: NewSessionMode; pending: boolean };

type Loaded = { cwd: string; opens: number; mode: NewSessionMode };

const RETRY_MS = 1000;

async function fetchMode(cwd: string): Promise<NewSessionMode | null> {
	try {
		const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : "";
		const res = await apiFetch(`/api/new-session-defaults${query}`);
		const body = await res.json();
		return Object.hasOwn(newSessionModes, body?.mode) ? body.mode : null;
	} catch {
		return null;
	}
}

export function useDefaultNewSessionMode(
	cwd: string,
	opens = 0,
): LoadedDefaultMode | null {
	const [loaded, setLoaded] = useState<Loaded | null>(null);

	useEffect(() => {
		let cancelled = false;
		let retry: ReturnType<typeof setTimeout> | undefined;
		const load = async () => {
			const mode = await fetchMode(cwd);
			if (cancelled) return;
			if (mode) setLoaded({ cwd, opens, mode });
			else retry = setTimeout(load, RETRY_MS);
		};
		void load();
		return () => {
			cancelled = true;
			clearTimeout(retry);
		};
	}, [cwd, opens]);

	if (!loaded) return null;
	return {
		mode: loaded.mode,
		pending: loaded.cwd !== cwd || loaded.opens !== opens,
	};
}
