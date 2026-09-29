import { useCallback, useState } from "react";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "./newSessionModes";

export type DraftFocus = {
	field: "prompt" | "repo" | "mode";
	selectionStart: number;
	selectionEnd: number;
};

const initialFocus: DraftFocus = {
	field: "prompt",
	selectionStart: 0,
	selectionEnd: 0,
};

export function useDraftState() {
	const [prompt, setPrompt] = useState("");
	const [cwd, setCwd] = useState<string>();
	const [mode, setMode] = useState<NewSessionMode>();
	const [harness, setHarness] = useState<HarnessKind>("claude");
	const [node, setNode] = useState<string>();
	const [focus, setFocus] = useState(initialFocus);

	const clear = useCallback(() => {
		setPrompt("");
		setCwd(undefined);
		setMode(undefined);
		setNode(undefined);
		setFocus(initialFocus);
	}, []);

	return {
		prompt,
		cwd,
		mode,
		harness,
		node,
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
