import type { HarnessKind } from "../../../../../../shared/harnesses";
import { useSessionHarness } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/useSessionHarness";
import type { NewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { draftHarness } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/draftHarness";
import type { LoadedDefaultMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode";

export function usePhoneModeHarness(
	node: string | undefined,
	picked: HarnessKind | undefined,
	defaultMode: LoadedDefaultMode | null,
	mode: NewSessionMode,
) {
	return useSessionHarness(node, draftHarness(picked, defaultMode, mode), mode);
}
