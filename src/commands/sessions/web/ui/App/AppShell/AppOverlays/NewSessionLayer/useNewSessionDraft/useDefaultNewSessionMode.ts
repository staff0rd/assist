import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../../apiFetch";
import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";
import { type NewSessionMode, newSessionModes } from "../newSessionModes";

export type LoadedDefaultMode = {
	mode: NewSessionMode;
	pending: boolean;
	error?: string;
	retry?: () => void;
};

type Outcome = { mode: NewSessionMode } | { error: string };

type Loaded = { cwd: string; opens: number; attempt: number; outcome: Outcome };

async function fetchMode(cwd: string): Promise<Outcome> {
	try {
		const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : "";
		const res = await apiFetch(`/api/new-session-defaults${query}`);
		if (!res.ok) return { error: `HTTP ${res.status}` };
		const body = await res.json();
		if (Object.hasOwn(newSessionModes, body?.mode)) return { mode: body.mode };
		throw new Error(`unknown mode ${JSON.stringify(body?.mode)}`);
	} catch (error) {
		reportCaughtError(error, "new-session defaults");
		return { error: error instanceof Error ? error.message : String(error) };
	}
}

export function useDefaultNewSessionMode(
	cwd: string,
	opens = 0,
): LoadedDefaultMode | null {
	const [attempt, setAttempt] = useState(0);
	const [loaded, setLoaded] = useState<Loaded | null>(null);
	const retry = useCallback(() => setAttempt((n) => n + 1), []);

	useEffect(() => {
		let cancelled = false;
		void fetchMode(cwd).then((outcome) => {
			if (!cancelled) setLoaded({ cwd, opens, attempt, outcome });
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, opens, attempt]);

	if (!loaded) return null;
	const { outcome } = loaded;
	return {
		mode: "mode" in outcome ? outcome.mode : "prompt",
		pending:
			loaded.cwd !== cwd ||
			loaded.opens !== opens ||
			loaded.attempt !== attempt,
		error: "error" in outcome ? outcome.error : undefined,
		retry,
	};
}
