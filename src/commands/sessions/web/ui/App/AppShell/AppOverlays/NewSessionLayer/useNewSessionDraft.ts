import { useCallback, useState } from "react";
import type { NewSessionMode } from "./NewSessionDialog/newSessionModes";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

export type DraftFocus = {
	field: "prompt" | "repo" | "mode";
	selectionStart: number;
	selectionEnd: number;
};

export type NewSessionDraft = {
	prompt: string;
	cwd: string;
	mode: NewSessionMode;
	focus: DraftFocus;
	setPrompt: (prompt: string) => void;
	setCwd: (cwd: string) => void;
	setMode: (mode: NewSessionMode) => void;
	setFocus: (focus: DraftFocus) => void;
	clear: () => void;
};

const initialFocus: DraftFocus = {
	field: "prompt",
	selectionStart: 0,
	selectionEnd: 0,
};

export function useNewSessionDraft(
	defaultMode: NewSessionMode | null,
): NewSessionDraft | null {
	const { selectedCwd } = useRepoSelectionContext();
	const [prompt, setPrompt] = useState("");
	const [cwd, setCwd] = useState<string>();
	const [mode, setMode] = useState<NewSessionMode>();
	const [focus, setFocus] = useState(initialFocus);

	const clear = useCallback(() => {
		setPrompt("");
		setCwd(undefined);
		setMode(undefined);
		setFocus(initialFocus);
	}, []);

	if (!defaultMode) return null;
	return {
		prompt,
		cwd: cwd ?? selectedCwd,
		mode: mode ?? defaultMode,
		focus,
		setPrompt,
		setCwd,
		setMode,
		setFocus,
		clear,
	};
}
