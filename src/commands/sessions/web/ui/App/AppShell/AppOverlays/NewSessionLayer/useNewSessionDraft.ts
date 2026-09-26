import { useCallback, useState } from "react";
import type { NewSessionMode } from "./NewSessionDialog/newSessionModes";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

export type NewSessionDraft = {
	prompt: string;
	cwd: string;
	mode: NewSessionMode;
	setPrompt: (prompt: string) => void;
	setCwd: (cwd: string) => void;
	setMode: (mode: NewSessionMode) => void;
	clear: () => void;
};

export function useNewSessionDraft(
	defaultMode: NewSessionMode | null,
): NewSessionDraft | null {
	const { selectedCwd } = useRepoSelectionContext();
	const [prompt, setPrompt] = useState("");
	const [cwd, setCwd] = useState<string>();
	const [mode, setMode] = useState<NewSessionMode>();

	const clear = useCallback(() => {
		setPrompt("");
		setCwd(undefined);
		setMode(undefined);
	}, []);

	if (!defaultMode) return null;
	return {
		prompt,
		cwd: cwd ?? selectedCwd,
		mode: mode ?? defaultMode,
		setPrompt,
		setCwd,
		setMode,
		clear,
	};
}
