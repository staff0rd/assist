import type { NewSessionMode } from "../newSessionModes";
import type { ModelPick } from "../sessionModel";
import type { LoadedDefaultMode } from "./useDefaultNewSessionMode";

export function configuredModel(
	defaultMode: LoadedDefaultMode | null,
	mode: NewSessionMode,
): ModelPick | undefined {
	const harness = defaultMode?.harnesses[mode];
	const model = defaultMode?.models?.[mode];
	return harness && model ? { harness, model } : undefined;
}
