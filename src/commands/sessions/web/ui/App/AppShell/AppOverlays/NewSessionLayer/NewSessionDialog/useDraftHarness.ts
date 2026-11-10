import { sessionModel } from "../sessionModel";
import type { NewSessionDraft } from "../useNewSessionDraft";
import { useSessionHarness } from "./useSessionHarness";

export function useDraftHarness(draft: NewSessionDraft) {
	const { harness, harnesses } = useSessionHarness(
		draft.node,
		draft.harness,
		draft.mode,
	);
	const model = sessionModel(
		draft.mode,
		harness,
		draft.pickedModel,
		draft.configuredModel,
		draft.setPickedModel,
	);
	return { harness, harnesses, model };
}
