import { useSessionHarness } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/useSessionHarness";
import type { NewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import { sessionModel } from "../../App/AppShell/AppOverlays/NewSessionLayer/sessionModel";
import { configuredModel } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/configuredModel";
import { draftHarness } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/draftHarness";
import type { LoadedDefaultMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode";
import type { usePhoneDraftState } from "./usePhoneDraftState";

export function usePhoneModeHarness(
	node: string | undefined,
	draft: ReturnType<typeof usePhoneDraftState>,
	defaultMode: LoadedDefaultMode | null,
	mode: NewSessionMode,
) {
	const { harness, harnesses } = useSessionHarness(
		node,
		draftHarness(draft.harness, defaultMode, mode),
		mode,
	);
	const model = sessionModel(
		harness,
		draft.pickedModel,
		configuredModel(defaultMode, mode),
		draft.setPickedModel,
	);
	return { harness, harnesses, model };
}
