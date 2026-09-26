import { useCallback, useState } from "react";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "./NewSessionDialog/newSessionModes";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { draftNode } from "./draftNode";

export type DraftFocus = {
	field: "prompt" | "repo" | "mode";
	selectionStart: number;
	selectionEnd: number;
};

export type NewSessionDraft = {
	prompt: string;
	cwd: string;
	mode: NewSessionMode;
	harness: HarnessKind;
	node: string | undefined;
	focus: DraftFocus;
	setPrompt: (prompt: string) => void;
	setNode: (node: string) => void;
	setCwd: (cwd: string) => void;
	setMode: (mode: NewSessionMode) => void;
	setHarness: (harness: HarnessKind) => void;
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
	const [harness, setHarness] = useState<HarnessKind>("claude");
	const [node, setNode] = useState<string>();
	const [focus, setFocus] = useState(initialFocus);
	const nodeSelection = useNodeSelectionContext();

	const clear = useCallback(() => {
		setPrompt("");
		setCwd(undefined);
		setMode(undefined);
		setNode(undefined);
		setFocus(initialFocus);
	}, []);

	if (!defaultMode) return null;
	return {
		prompt,
		cwd: cwd ?? selectedCwd,
		mode: mode ?? defaultMode,
		harness,
		node: draftNode(node, nodeSelection),
		focus,
		setPrompt,
		setNode,
		setCwd,
		setMode,
		setHarness,
		setFocus,
		clear,
	};
}
