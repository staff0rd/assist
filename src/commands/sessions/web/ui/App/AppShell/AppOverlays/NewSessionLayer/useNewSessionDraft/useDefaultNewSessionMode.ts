import { useCallback, useEffect, useState } from "react";
import type { NewSessionMode } from "../newSessionModes";
import { fetchMode, type Outcome } from "./fetchMode";
import type { ModeHarnesses } from "./parseModeHarnesses";
import type { ModeModels } from "./parseModeModels";

export type LoadedDefaultMode = {
	mode: NewSessionMode;
	harnesses: ModeHarnesses;
	models?: ModeModels;
	pending: boolean;
	error?: string;
	retry?: () => void;
};

type Loaded = { cwd: string; opens: number; attempt: number; outcome: Outcome };

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
		harnesses: "harnesses" in outcome ? outcome.harnesses : {},
		models: "models" in outcome ? outcome.models : {},
		pending:
			loaded.cwd !== cwd ||
			loaded.opens !== opens ||
			loaded.attempt !== attempt,
		error: "error" in outcome ? outcome.error : undefined,
		retry,
	};
}
