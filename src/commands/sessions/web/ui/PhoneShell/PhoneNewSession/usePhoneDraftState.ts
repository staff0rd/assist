import { usePersistedPrompt } from "../../usePersistedPrompt";
import { useDraftChoices } from "../../App/AppShell/AppOverlays/NewSessionLayer/useDraftChoices";

export function usePhoneDraftState() {
	const [prompt, setPrompt] = usePersistedPrompt("phone-new-session");
	return { prompt, setPrompt, ...useDraftChoices() };
}
