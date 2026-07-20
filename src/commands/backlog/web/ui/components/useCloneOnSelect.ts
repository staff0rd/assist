import { useCallback, useEffect, useState } from "react";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import {
	type ClonePrompt,
	type CloneWatch,
	resolveCloneWatch,
	startCloneWatch,
} from "./resolveCloneWatch";

export function useCloneOnSelect(sessions: SessionInfo[]) {
	const { setSelectedCwd } = useRepoSelectionContext();
	const { launchAssist } = useSessionLaunchContext();
	const [prompt, setPrompt] = useState<ClonePrompt | null>(null);
	const [watch, setWatch] = useState<CloneWatch | null>(null);
	const [error, setError] = useState<string | null>(null);

	const requestClone = useCallback((target: ClonePrompt) => {
		setError(null);
		setPrompt(target);
	}, []);
	const cancel = useCallback(() => setPrompt(null), []);
	const dismissError = useCallback(() => setError(null), []);

	const confirm = useCallback(() => {
		if (!prompt) return;
		setWatch(startCloneWatch(sessions, prompt, launchAssist));
		setPrompt(null);
	}, [prompt, sessions, launchAssist]);

	useEffect(() => {
		if (!watch) return;
		const action = resolveCloneWatch(sessions, watch);
		if (!action) return;
		if (action.type === "latch") {
			setWatch((w) => (w ? { ...w, id: action.id } : w));
		} else if (action.type === "done") {
			setSelectedCwd(watch.target);
			setWatch(null);
		} else {
			setError(action.message);
			setWatch(null);
		}
	}, [sessions, watch, setSelectedCwd]);

	return { prompt, requestClone, confirm, cancel, error, dismissError };
}
