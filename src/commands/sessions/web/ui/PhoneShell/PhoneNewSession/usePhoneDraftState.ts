import { useState } from "react";
import { usePersistedPrompt } from "../../usePersistedPrompt";
import { useDraftChoices } from "../../App/AppShell/AppOverlays/NewSessionLayer/useDraftChoices";

export function usePhoneDraftState() {
	const [prompt, setPrompt] = usePersistedPrompt("phone-new-session");
	const [node, setNode] = useState<string>();
	return { prompt, setPrompt, node, setNode, ...useDraftChoices() };
}
