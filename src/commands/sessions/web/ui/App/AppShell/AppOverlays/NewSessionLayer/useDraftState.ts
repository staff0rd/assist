import { useCallback, useState } from "react";
import { usePersistedPrompt } from "../../../../usePersistedPrompt";
import { useDraftChoices } from "./useDraftChoices";

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
	const [prompt, setPrompt] = usePersistedPrompt("new-session");
	const choices = useDraftChoices();
	const [focus, setFocus] = useState(initialFocus);
	const { setCwd, setMode, setHarness, setPickedModel, setNode } = choices;

	const clear = useCallback(() => {
		setPrompt("");
		setCwd(undefined);
		setMode(undefined);
		setHarness(undefined);
		setPickedModel(undefined);
		setNode(undefined);
		setFocus(initialFocus);
	}, [setPrompt, setCwd, setMode, setHarness, setPickedModel, setNode]);

	return { prompt, ...choices, focus, setPrompt, setFocus, clear };
}
