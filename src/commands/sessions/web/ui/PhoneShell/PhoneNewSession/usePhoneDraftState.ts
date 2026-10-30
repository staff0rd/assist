import { useState } from "react";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import type { NewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";

export function usePhoneDraftState() {
	const [prompt, setPrompt] = useState("");
	const [mode, setMode] = useState<NewSessionMode>();
	const [harness, setHarness] = useState<HarnessKind>("claude");
	const [node, setNode] = useState<string>();
	const [cwd, setCwd] = useState<string>();
	return {
		prompt,
		mode,
		harness,
		node,
		cwd,
		setPrompt,
		setMode,
		setHarness,
		setNode,
		setCwd,
	};
}
