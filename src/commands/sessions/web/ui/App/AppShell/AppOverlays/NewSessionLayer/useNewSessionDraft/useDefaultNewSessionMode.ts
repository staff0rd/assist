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

type Loaded = {
	cwd: string;
	node: string | undefined;
	opens: number;
	attempt: number;
	outcome: Outcome;
};

export function useDefaultNewSessionMode(
	cwd: string,
	opens = 0,
	node?: string,
): LoadedDefaultMode | null {
	const [attempt, setAttempt] = useState(0);
	const [loaded, setLoaded] = useState<Loaded | null>(null);
	const retry = useCallback(() => setAttempt((n) => n + 1), []);

	useEffect(() => {
		let cancelled = false;
		void fetchMode(cwd, node).then((outcome) => {
			if (!cancelled) setLoaded({ cwd, node, opens, attempt, outcome });
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, node, opens, attempt]);

	if (!loaded) return null;
	const { outcome } = loaded;
	return {
		mode: "mode" in outcome ? outcome.mode : "prompt",
		harnesses: "harnesses" in outcome ? outcome.harnesses : {},
		models: "models" in outcome ? outcome.models : {},
		pending:
			loaded.cwd !== cwd ||
			loaded.node !== node ||
			loaded.opens !== opens ||
			loaded.attempt !== attempt,
		error: "error" in outcome ? outcome.error : undefined,
		retry,
	};
}
